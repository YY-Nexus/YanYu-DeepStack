"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  // 生成页码数组
  const generatePagination = () => {
    // 如果总页数小于等于7，显示所有页码
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 否则，显示当前页附近的页码和首尾页码
    const pages = []

    // 始终显示第一页
    pages.push(1)

    // 当前页接近开始
    if (currentPage <= 3) {
      pages.push(2, 3, 4, "...")
    }
    // 当前页接近结束
    else if (currentPage >= totalPages - 2) {
      pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1)
    }
    // 当前页在中间
    else {
      pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...")
    }

    // 始终显示最后一页
    pages.push(totalPages)

    return pages
  }

  const pagination = generatePagination()

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="分页">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pagination.map((page, index) =>
        page === "..." ? (
          <Button key={`ellipsis-${index}`} variant="ghost" size="icon" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page as number)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`第 ${page} 页`}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
