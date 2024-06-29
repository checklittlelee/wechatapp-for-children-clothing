// pages/my/my.js
const { checkHasLogined, authorize } = require('../../utils/auth')
const { encrypt, getPhone } = require('../../apis/login')

Page({
  data: {
    avatarUrl: '',
    userName: ''
  },

  async login() {
    // 检查token是否存在、session_key是否过期、token是否合法
    const islogin = await checkHasLogined()
    // 如果返回false，就去获取code、openid session_key、token，以及存储token
    // if(!islogin) {
    //   await authorize()
    //   // 处理登录成功后的逻辑
    // }
    await authorize()
  },
  // 获取用户信息，弹出授权窗口
  getUserInfo() {
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        // 对加密数据进行解密
        encrypt(res).then(data => {
          console.log('res', res)
          this.setData({
            avatarUrl: data.avatarUrl,
            userName: data.userName
          })
        })
      },
      fail: err => {
        console.log('接口调用失败的回调函数', err)
      }
    })
  },
  // 手机号
  // getPhoneNumber(e) {
  //   console.log('e', e)
  //   getPhone(e.detail.code).then(res => {
  //     console.log('res', res)
  //   })
  // },
})