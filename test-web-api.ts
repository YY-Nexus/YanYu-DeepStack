// 测试Web API类型定义是否正常工作

// 测试FormData类型
const formData = new FormData();
formData.append('name', 'test');
formData.append('file', new File(['test'], 'test.txt'));

// 测试URLSearchParams类型
const searchParams = new URLSearchParams();
searchParams.append('q', 'typescript');
searchParams.append('page', '1');

// 测试fetch API
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'test' }),
}) 
  .then(response => response.json())
  .then(data => console.log(data));

// 测试DOM API
const element = document.createElement('div');
element.textContent = 'Hello, World!';
element.className = 'test-class';

// 导出一个简单的函数
 export function testWebAPI() {
  return {
    formData,
    searchParams,
    element,
  };
}