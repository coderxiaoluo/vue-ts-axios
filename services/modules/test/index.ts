import { lRequest } from '../../index'

// 登录
export function userLogin(username: string, password: string) {
  return lRequest.post("", {
    username,
    password
  })
}; 