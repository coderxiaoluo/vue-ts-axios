import { lRequest, baiduQuery, requestInstances } from '../index'

// 测试 API 调用的函数
export class ApiTestService {
  // 测试主 API 请求
  static async testMainApi() {
    try {
      console.log('测试主 API GET 请求...')
      const response = await lRequest.get('/test', {
        params: { id: 1, name: 'test' }
      })
      console.log('主 API GET 请求成功:', response.data)
      return response.data
    } catch (error) {
      console.error('主 API GET 请求失败:', error)
      return null
    }
  }

  // 测试 POST 请求
  static async testPostApi() {
    try {
      console.log('测试主 API POST 请求...')
      const response = await lRequest.post('/submit', {
        username: 'testuser',
        password: 'password123'
      })
      console.log('主 API POST 请求成功:', response.data)
      return response.data
    } catch (error) {
      console.error('主 API POST 请求失败:', error)
      return null
    }
  }

  // 测试百度地图 API
  static async testBaiduApi() {
    try {
      console.log('测试百度地图 API 请求...')
      const response = await baiduQuery.get('', {
        params: {
          ak: 'your_api_key_here',
          output: 'json',
          location: '39.984702,116.305645'
        }
      })
      console.log('百度地图 API 请求成功:', response.data)
      return response.data
    } catch (error) {
      console.error('百度地图 API 请求失败:', error)
      return null
    }
  }

  // 测试通过 requestInstances 访问
  static async testRequestInstances() {
    try {
      console.log('通过 requestInstances 测试默认请求...')
      const response = await requestInstances.default.get('/info')
      console.log('默认实例请求成功:', response.data)
      return response.data
    } catch (error) {
      console.error('默认实例请求失败:', error)
      return null
    }
  }

  // 运行所有测试
  static async runAllTests() {
    console.log('开始运行所有 API 测试...')

    const results = {
      mainApi: await this.testMainApi(),
      postApi: await this.testPostApi(),
      baiduApi: await this.testBaiduApi(),
      requestInstances: await this.testRequestInstances()
    }

    console.log('所有测试完成!')
    return results
  }
}

// 导出便捷的测试函数
export const runApiTests = async () => {
  return ApiTestService.runAllTests()
}

export default ApiTestService