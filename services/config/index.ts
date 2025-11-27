/**
 * 项目配置管理
 * 集中管理API基础路径、超时时间等配置
 */

// 获取当前环境类型
type EnvType = 'development' | 'production' | 'test';

// 获取当前环境
const getCurrentEnv = (): EnvType => {
  if (import.meta.env.DEV) {
    return 'development';
  }

  // 可以根据其他环境变量判断具体环境
  const env = import.meta.env.VITE_ENVIRONMENT as EnvType;
  return env || 'production';
};

// 当前环境
const currentEnv: EnvType = getCurrentEnv();

// API基础URL配置
const API_BASE_URLS = {
  development: import.meta.env.VITE_DEVELOPMENT || 'http://localhost:3000/api',
  production: import.meta.env.VITE_PRODUCTION || 'https://api.example.com',
  test: import.meta.env.VITE_TEST || 'https://test-api.example.com'
};

// 导出基础URL
export const BASE_URL: string = API_BASE_URLS[currentEnv];

// 请求超时时间配置（毫秒）
export const TIMEOUT: number = 10000;

// 重试配置
export const RETRY_CONFIG = {
  maxRetryCount: 3,  // 最大重试次数
  retryDelay: 1000,  // 重试间隔（毫秒）
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]  // 可重试的HTTP状态码
};

// API路径前缀
export const API_PREFIX: string = '/api';

// 是否启用mock数据
export const ENABLE_MOCK: boolean = import.meta.env.VITE_ENABLE_MOCK === 'true';

// 是否启用请求日志
export const ENABLE_REQUEST_LOG: boolean = import.meta.env.DEV;

// 默认请求头配置
export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// 导出当前环境信息
export const ENV_INFO = {
  current: currentEnv,
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production',
  isTest: currentEnv === 'test'
};

// 导出完整配置对象
export const API_CONFIG = {
  BASE_URL,
  TIMEOUT,
  RETRY_CONFIG,
  API_PREFIX,
  ENABLE_MOCK,
  ENABLE_REQUEST_LOG,
  DEFAULT_HEADERS,
  ENV_INFO
};

// 打印当前环境配置信息（仅在开发环境）
if (ENV_INFO.isDevelopment) {
  console.log('当前API环境配置:', {
    env: currentEnv,
    baseURL: BASE_URL
  });
}
