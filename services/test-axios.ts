// 测试优化后的axios封装
import LRequest from './request'
import { API_CONFIG } from './config'

// 创建axios实例
const apiRequest = new LRequest({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  interceptors: {
    requestInterceptor: (config) => {
      console.log('实例级请求拦截器 - 添加token')
      // 这里可以添加token等认证信息
      // config.headers.Authorization = 'Bearer ' + getToken()
      return config
    },
    responseInterceptor: (response) => {
      console.log('实例级响应拦截器 - 处理响应数据')
      return response
    }
  }
})

// 测试GET请求
const testGet = async () => {
  console.log('测试GET请求')
  try {
    const result = await apiRequest.get('/users', {
      params: { page: 1, limit: 10 },
      retry: 2, // 重试2次
      interceptors: {
        requestInterceptor: (config) => {
          console.log('单次请求的拦截器')
          return config
        }
      }
    })
    console.log('GET请求成功:', result)
  } catch (error) {
    console.log('GET请求失败:', error)
  }
}

// 测试POST请求
const testPost = async () => {
  console.log('测试POST请求')
  try {
    const result = await apiRequest.post('/login', {
      username: 'test',
      password: '123456'
    })
    console.log('POST请求成功:', result)
  } catch (error) {
    console.log('POST请求失败:', error)
  }
}

// 测试取消重复请求
const testCancelDuplicate = async () => {
  console.log('测试取消重复请求')
  // 快速连续发送相同请求，第二个会取消第一个
  apiRequest.get('/users', { params: { test: 1 } })
  apiRequest.get('/users', { params: { test: 1 } })
}

// 测试清除所有请求
const testClearRequests = () => {
  console.log('测试清除所有请求')
  // 模拟路由跳转时清除所有请求
  setTimeout(() => {
    apiRequest.clearPendingRequests()
    console.log('已清除所有待处理请求')
  }, 100)
}

// 导出测试函数，供外部调用
export const runAllTests = async () => {
  console.log('开始测试优化后的axios封装...')
  console.log('当前环境配置:', API_CONFIG.ENV_INFO.current)
  console.log('基础URL:', API_CONFIG.BASE_URL)

  await testGet()
  await testPost()
  await testCancelDuplicate()
  testClearRequests()

  console.log('测试完成，请查看控制台输出')
}

// 导出单个测试函数，方便单独测试
export { testGet, testPost, testCancelDuplicate, testClearRequests, apiRequest }
