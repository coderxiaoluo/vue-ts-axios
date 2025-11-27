import LRequest from './request'
import { API_CONFIG } from './config'

// 主 API 请求实例，使用默认配置
export const lRequest = new LRequest({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  retry: API_CONFIG.RETRY_CONFIG.maxRetryCount,
  retryDelay: API_CONFIG.RETRY_CONFIG.retryDelay
})

// 百度地图 API 请求实例
export const baiduQuery = new LRequest({
  baseURL: 'http://api.map.baidu.com/reverse_geocoding/v3',
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  retry: API_CONFIG.RETRY_CONFIG.maxRetryCount,
  retryDelay: API_CONFIG.RETRY_CONFIG.retryDelay
})

// 默认导出主请求实例
export default lRequest

// 导出所有请求实例，方便批量使用
export const requestInstances = {
  default: lRequest,
  baiduQuery
}

// 导出请求配置，方便其他地方使用
export { API_CONFIG }

