import request from '../utils/request'

// 轮播图
export function bannerList() {
  return request.get('/bannerList')
}
// 轮播图左下角 购买记录 通知提醒
export function goodsDynamic() {
  return request.get('/goodsDynamic')
}
// 金刚区
export function category() {
  return request.get('/category')
}
// 优惠资讯公告
export function notice(pageSize=5) {
  return request.get(`/notice?pageSize=${pageSize}`)
}
// 限时秒杀
export function seckill() {
  return request.get('/seckill')
}
// 爆品推荐
export function hotGoods() {
  return request.get('/hotGoods')
}
// 疯狂砍价
export function discount() {
  return request.get('/discount')
}
// 全民拼团
export function collage() {
  return request.get('/collage')
}
// 商品列表
export function goodlist({page, pageSize, categoryId}) {
  return request.get(`/goodlist?page=${page}&pageSize=${pageSize}&categoryId=${categoryId}`)
}
// 商品添加到购物车
export function addGoods (data) {
  return request.post('/shopping-cart/addGoods', data)
}
// Popup 弹出层中需要更多商品sku的信息
export function getGoodDetail(id) {
  return request.get(`/getGoodDetail?id=${id}`)
}

export function selectGoods() {
  return request.get('/shopping-cart/selectGoods')
}