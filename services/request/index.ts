// 封装 axios
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, Canceler } from 'axios'
import NProgress from 'nprogress'
// 引入对应css样式
import 'nprogress/nprogress.css'

// 配置NProgress
NProgress.configure({
  showSpinner: false, // 关闭加载动画
  minimum: 0.1, // 最小进度
  speed: 200 // 动画速度
})

// 响应数据类型
interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

// 拦截器配置接口
interface InterceptorsConfig<T = ResponseData> {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig
  requestInterceptorCatch?: (error: AxiosError) => Promise<AxiosError>
  responseInterceptor?: (response: T) => T
  responseInterceptorCatch?: (error: AxiosError) => Promise<never>
}

// 自定义请求配置接口
export interface RequestConfig<T = ResponseData> extends AxiosRequestConfig {
  interceptors?: InterceptorsConfig<T>
  retry?: number // 重试次数
  retryDelay?: number // 重试延迟(ms)
  cancelable?: boolean // 是否可取消
}

class LRequest {
  private instance: AxiosInstance
  private pendingRequests: Map<string, Canceler> = new Map()

  constructor(config: RequestConfig) {
    this.instance = axios.create({
      timeout: 10000, // 默认超时时间
      ...config
    })

    // 设置全局拦截器
    this.setupGlobalInterceptors()

    // 设置实例拦截器
    this.setupInstanceInterceptors(config.interceptors)
  }

  // 生成请求标识
  private generateRequestKey(config: AxiosRequestConfig): string {
    const { method = 'GET', url = '', params = {}, data = {} } = config
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`
  }

  // 取消重复请求
  private addPendingRequest(config: AxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config)

    // 如果有重复请求，取消之前的请求
    if (this.pendingRequests.has(requestKey)) {
      const cancel = this.pendingRequests.get(requestKey)
      if (cancel) {
        cancel(`取消重复请求: ${requestKey}`)
      }
    }

    // 添加新请求到待处理列表
    config.cancelToken = new axios.CancelToken(cancel => {
      this.pendingRequests.set(requestKey, cancel)
    })
  }

  // 移除待处理请求
  private removePendingRequest(config: AxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config)
    if (this.pendingRequests.has(requestKey)) {
      this.pendingRequests.delete(requestKey)
    }
  }

  // 设置全局拦截器
  private setupGlobalInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 启动进度条
        NProgress.start()

        // 处理重复请求
        if (config.cancelable !== false) {
          this.addPendingRequest(config)
        }

        // 添加时间戳防止缓存
        if (config.method?.toUpperCase() === 'GET') {
          config.params = {
            ...config.params,
            _t: Date.now()
          }
        }

        return config
      },
      (error: AxiosError) => {
        // 请求错误时结束进度条
        NProgress.done()
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 结束进度条
        NProgress.done()

        // 移除待处理请求
        this.removePendingRequest(response.config)

        // 返回响应数据
        return response.data
      },
      (error: AxiosError) => {
        // 结束进度条
        NProgress.done()

        // 如果不是取消请求的错误，移除待处理请求
        if (error.config && !axios.isCancel(error)) {
          this.removePendingRequest(error.config)
        }

        // 错误处理
        if (error.response) {
          // 服务器响应了但状态码不是2xx
          const { status, data } = error.response
          console.error(`请求失败: 状态码 ${status}`, data)

          // 根据状态码进行不同处理
          switch (status) {
            case 401:
              console.error('未授权，请登录')
              // 可以在这里跳转到登录页面
              break
            case 403:
              console.error('拒绝访问')
              break
            case 404:
              console.error('请求地址不存在')
              break
            case 500:
              console.error('服务器内部错误')
              break
            default:
              console.error(`请求失败: ${status}`)
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络错误，请检查您的网络连接')
        } else {
          // 请求配置出错
          console.error('请求配置错误:', error.message)
        }

        return Promise.reject(error)
      }
    )
  }

  // 设置实例拦截器
  private setupInstanceInterceptors(interceptors?: InterceptorsConfig): void {
    if (!interceptors) return

    const { requestInterceptor, requestInterceptorCatch, responseInterceptor, responseInterceptorCatch } = interceptors

    // 实例请求拦截器
    if (requestInterceptor || requestInterceptorCatch) {
      this.instance.interceptors.request.use(
        requestInterceptor,
        requestInterceptorCatch
      )
    }

    // 实例响应拦截器
    if (responseInterceptor || responseInterceptorCatch) {
      this.instance.interceptors.response.use(
        responseInterceptor,
        responseInterceptorCatch
      )
    }
  }

  // 带重试功能的请求方法
  private requestWithRetry<T = any>(config: RequestConfig<T>, retryCount: number = 0): Promise<T> {
    const { retry = 0, retryDelay = 300 } = config

    return this.instance.request<T>(config).catch((error: AxiosError) => {
      // 如果没有配置重试或者已经达到最大重试次数，或者是取消请求的错误，则不重试
      if (retry <= 0 || retryCount >= retry || axios.isCancel(error)) {
        return Promise.reject(error)
      }

      // 延迟重试
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.requestWithRetry(config, retryCount + 1))
        }, retryDelay)
      })
    })
  }

  // 通用请求方法
  request<T = any>(config: RequestConfig<T>): Promise<T> {
    // 支持单个请求的拦截器
    if (config.interceptors?.requestInterceptor) {
      try {
        config = config.interceptors.requestInterceptor(config)
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return new Promise<T>((resolve, reject) => {
      this.requestWithRetry(config)
        .then((response: T) => {
          // 响应拦截器
          if (config.interceptors?.responseInterceptor) {
            try {
              const processedResponse = config.interceptors.responseInterceptor(response)
              resolve(processedResponse)
            } catch (error) {
              reject(error)
            }
          } else {
            resolve(response)
          }
        })
        .catch((error: AxiosError) => {
          // 错误响应拦截器
          if (config.interceptors?.responseInterceptorCatch) {
            config.interceptors.responseInterceptorCatch(error).catch(reject)
          } else {
            reject(error)
          }
        })
    })
  }

  // GET请求
  get<T = any>(url: string, config?: Omit<RequestConfig<T>, 'url'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  // POST请求
  post<T = any>(url: string, data?: any, config?: Omit<RequestConfig<T>, 'url' | 'data'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  // PUT请求
  put<T = any>(url: string, data?: any, config?: Omit<RequestConfig<T>, 'url' | 'data'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  // DELETE请求
  delete<T = any>(url: string, config?: Omit<RequestConfig<T>, 'url'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  // PATCH请求
  patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig<T>, 'url' | 'data'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }

  // 清除所有待处理的请求
  clearPendingRequests(): void {
    this.pendingRequests.forEach((cancel) => {
      if (cancel) {
        cancel('清除所有请求')
      }
    })
    this.pendingRequests.clear()
  }
}

export default LRequest
