const { checkToken, loginApi } = require('../apis/login')

// 校验登录态session_key是否过期
async function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true)
      },
      fail() {
        return reject(false)
      }
    })
  })
}
// 检查token是否存在、session_key是否过期、token是否合法
async function checkHasLogined() {
  // 判断token是否存在
  const token = wx.getStorageSync('token')
  if(!token) return false
  // 判断登录态是否失效
  const logined = await checkSession()
  if(!logined) {
    wx.removeStorageSync('token')
    return false
  }
  // 判断token是否合法，调用后端接口
  const checkTokenRes = await checkToken({ token })
  if(checkTokenRes.code == -1) {
    wx.removeStorageSync('token')
    return false
  }
  return true
}

// 微信登录：wx.login向微信服务器请求一个临时登录凭证code
async function wxCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        // console.log(res.code) 0e12Ik0008YtmS1Fl9200fImtY32Ik0T
        return resolve(res.code)
      },
      fail() {
        wx.showToast({
          title: '获取code失败',
          icon: 'none'
        })
        return reject('获取code失败')
      }
    })
  })
}
// 静默登录
async function authorize () {
  return new Promise(async (resolve, reject) => {
    // 获取code
    const code = await wxCode()
    // 获取 openid 和 session_key
    const res = await loginApi({ code })
    // 用户如果存在于后端数据库，会返回token；如果不存在，后端会自动创建用户再返回token
    wx.setStorageSync('token', res.token)
    wx.setStorageSync('uid', res.uid)
    resolve()
  })
}

// 
async function bindSeller() {
  const token = wx.getStorageSync('token')
  const referrer = wx.getStorageSync('referrer')
  if (!token) {
    return
  }
  if (!referrer) {
    return
  }
  const res = await WXAPI.bindSeller({
    token,
    uid: referrer
  })
}

module.exports = {
  checkHasLogined,
  authorize,
  bindSeller
}