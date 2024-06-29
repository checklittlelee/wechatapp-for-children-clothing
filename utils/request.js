import Fly from 'flyio'

const fly = new Fly

// 请求配置选项
fly.config.baseURL= "https://www.winweb.cloud/mall"
fly.config.timeout = 1000 * 20

export class RequestError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
//添加请求拦截器
fly.interceptors.request.use((request)=>{
  //给所有请求添加自定义header
  const uid = wx.getStorageSync('uid')
  const token = wx.getStorageSync('token')
  if(uid || token) {
    request.headers['uid'] = uid
    request.headers['token'] = token
  }
  return request;
})

//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
  (response) => {
    const {status, data} = response
    if(status !== 200) {
      const message = "[Fetch]: 网络开了小差"
    return Promise.reject(new RequestError(message))
    }
    return data
  },
  (err) => {
    if(!err) err={}
    err.message = "网络异常，请稍后重试"
    setTimeout(() => {
      wx.showToast({
        title: err.message,
        icon: "none"
      })
    }, 100)
    return Promise.resolve(err)
  }
)

export default fly