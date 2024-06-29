import request from '../utils/request'

// 判断token是否合法
export function checkToken(data) {
  return request.post('/checkToken', data)
}
// 获取 openid 和 session_key
export function loginApi(data) {
  return request.post('/login', data)
}
// 解密
export function encrypt(data) {
  return request.post('/encrypt', data)
}
// 解密
export function getPhone(data) {
  return request.get(`/getPhone?code=${data}`)
}

// 以下待注释
export function getUserInfo() {
  return request.get('/getUserInfo')
}
export function configValues() {
  return request.get('/config/values')
}
export function startBanner() {
  return request.get('/startBanner')
}
