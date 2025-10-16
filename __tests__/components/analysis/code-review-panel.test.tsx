import '@testing-library/jest-dom' // 确保jest-dom匹配器可用
import React, { useState as reactUseState } from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeReviewPanel from '@/components/analysis/code-review-panel'

// Simple test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

// 设置全局测试超时为30秒
jest.setTimeout(30000);

// Mock data similar to what's in the component
const mockReviews = [
  {
    id: '1',
    title: '实现用户认证系统',
    description: '添加JWT认证和权限管理功能',
    author: '张三',
    createdAt: new Date('2024-12-25'),
    status: 'pending',
    priority: 'high',
    filesChanged: 12,
    linesAdded: 245,
    linesRemoved: 38,
    comments: 3,
    approvals: 1,
    branch: 'feature/auth-system',
    assignees: ['李四', '王五'],
    labels: ['enhancement', 'security'],
    score: 85
  },
  {
    id: '2',
    title: '优化数据库查询性能',
    description: '重构复杂查询，添加索引优化',
    author: '李四',
    createdAt: new Date('2024-12-24'),
    status: 'approved',
    priority: 'medium',
    filesChanged: 5,
    linesAdded: 89,
    linesRemoved: 156,
    comments: 8,
    approvals: 2,
    branch: 'perf/db-optimization',
    assignees: ['张三'],
    labels: ['performance', 'database'],
    score: 92
  }
]

const mockIssues = [
  {
    id: '1',
    type: 'error',
    severity: 'critical',
    message: '潜在的安全漏洞：SQL注入风险',
    file: 'src/api/users.ts',
    line: 45,
    column: 12,
    rule: 'security/no-sql-injection',
    suggestion: '使用参数化查询或ORM'
  },
  {
    id: '2',
    type: 'warning',
    severity: 'major',
    message: '函数复杂度过高',
    file: 'src/utils/data-processor.ts',
    line: 123,
    column: 8,
    rule: 'complexity/max-complexity',
    suggestion: '考虑将函数拆分为更小的函数'
  }
]

// 我们不需要mock useEffect，因为组件内部已经有模拟数据
// 测试将直接使用组件中定义的模拟数据

describe('CodeReviewPanel', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  test('renders the component correctly', () => {
    render(<CodeReviewPanel />);
    expect(screen.getByText('代码评审')).toBeInTheDocument()
    expect(screen.getByText('评审列表')).toBeInTheDocument()
    expect(screen.getByText('代码问题')).toBeInTheDocument()
    expect(screen.getByText('质量指标')).toBeInTheDocument()
    expect(screen.getByText('评审报告')).toBeInTheDocument()
  })

  test('displays review items correctly', () => {
    render(<CodeReviewPanel />)
    // Check if review items are rendered
    expect(screen.getByText('实现用户认证系统')).toBeInTheDocument()
    expect(screen.getByText('优化数据库查询性能')).toBeInTheDocument()
    // Check status badges
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('approved')).toBeInTheDocument()
    // Check other details
    expect(screen.getByText('feature/auth-system')).toBeInTheDocument()
    expect(screen.getByText('perf/db-optimization')).toBeInTheDocument()
  })

  test('filters reviews by status', async () => {
    render(<CodeReviewPanel />)
    // Initially, both reviews should be visible
    expect(screen.getByText('实现用户认证系统')).toBeInTheDocument()
    expect(screen.getByText('优化数据库查询性能')).toBeInTheDocument()

    // Click on 'pending' filter
    fireEvent.click(screen.getByText('待评审'))
    // Check only pending review is visible
    expect(screen.getByText('实现用户认证系统')).toBeInTheDocument()
    expect(screen.queryByText('优化数据库查询性能')).not.toBeInTheDocument()

    // Click on 'approved' filter
    fireEvent.click(screen.getByText('已通过'))
    // Check only approved review is visible
    expect(screen.queryByText('实现用户认证系统')).not.toBeInTheDocument()
    expect(screen.getByText('优化数据库查询性能')).toBeInTheDocument()

    // Click on 'all' filter
    fireEvent.click(screen.getByText('全部'))
    // Check both reviews are visible again
    expect(screen.getByText('实现用户认证系统')).toBeInTheDocument()
    expect(screen.getByText('优化数据库查询性能')).toBeInTheDocument()
  })

  test('renders correct content when activeTab is set via props', () => {
    // 使用props设置activeTab为'issues'
    render(<CodeReviewPanel activeTab="issues" />);
    
    // 验证代码问题标签被选中
    const issuesTab = screen.getByText('代码问题');
    expect(issuesTab).toHaveAttribute('aria-selected', 'true');
    
    // 验证评审列表标签未被选中
    const reviewListTab = screen.getByText('评审列表');
    expect(reviewListTab).not.toHaveAttribute('aria-selected', 'true');
    
    // 验证代码问题内容是否显示
    expect(screen.getByText(/SQL注入风险/)).toBeInTheDocument();
  });

  test('switches to code issues tab correctly', async () => {
    // 初始化userEvent
    const user = userEvent.setup();
    
    // 正常渲染组件
    render(<CodeReviewPanel />);
    
    // 获取代码问题标签元素
    const issuesTab = screen.getByText('代码问题');
    
    // 使用userEvent模拟点击
    await user.click(issuesTab);
    
    // 等待标签状态变化
    await waitFor(() => {
      // 重新获取标签元素
      const updatedIssuesTab = screen.getByText('代码问题');
      // 验证标签是否被选中
      expect(updatedIssuesTab).toHaveAttribute('aria-selected', 'true');
    }, { timeout: 5000 });
  });

  // 单独测试代码问题内容显示
  test('displays code issues when active tab is issues', async () => {
    // 使用组件的props直接设置activeTab为'issues'
    render(<CodeReviewPanel activeTab="issues" />);

    // 等待内容加载
    const sqlIssue = await screen.findByText(/SQL注入风险/, {}, { timeout: 15000 })
    expect(sqlIssue).toBeInTheDocument();

    const complexityIssue = await screen.findByText(/函数复杂度过高/, {}, { timeout: 15000 })
    expect(complexityIssue).toBeInTheDocument();
  });

  // 暂时跳过其他标签测试
  test('switches to quality metrics tab correctly', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(<CodeReviewPanel />, { wrapper: TestWrapper })

  const metricsTab = getByRole('tab', { name: '质量指标' })
  expect(metricsTab).toHaveAttribute('aria-selected', 'false')

  await user.click(metricsTab)
  await waitFor(() => {
    expect(metricsTab).toHaveAttribute('aria-selected', 'true')
  })
})

test('switches to review report tab correctly', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(<CodeReviewPanel />, { wrapper: TestWrapper })

  const reportTab = getByRole('tab', { name: '评审报告' })
  expect(reportTab).toHaveAttribute('aria-selected', 'false')

  await user.click(reportTab)
  await waitFor(() => {
    expect(reportTab).toHaveAttribute('aria-selected', 'true')
  })
})

test('switches back to review list tab correctly', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(<CodeReviewPanel />, { wrapper: TestWrapper })

  // First switch to another tab
  const issuesTab = getByRole('tab', { name: '代码问题' })
  await user.click(issuesTab)
  await waitFor(() => {
    expect(issuesTab).toHaveAttribute('aria-selected', 'true')
  })

  // Then switch back to review list tab
  const reviewListTab = getByRole('tab', { name: '评审列表' })
  expect(reviewListTab).toHaveAttribute('aria-selected', 'false')

  await user.click(reviewListTab)
  await waitFor(() => {
    expect(reviewListTab).toHaveAttribute('aria-selected', 'true')
  })
})

  test('starts review when button is clicked', async () => {
    render(<CodeReviewPanel />)
    // Find the '开始评审' button for the first review
    const startReviewButton = screen.getAllByText('开始评审')[0]
    // Ensure button is enabled initially
    expect(startReviewButton).not.toBeDisabled()
    // Click the button
    fireEvent.click(startReviewButton)
    // Button should be disabled while loading
    expect(startReviewButton).toBeDisabled()
    // Wait for loading to complete with increased timeout
    await waitFor(() => {
      expect(startReviewButton).not.toBeDisabled()
    }, { timeout: 3000 })
  })


})