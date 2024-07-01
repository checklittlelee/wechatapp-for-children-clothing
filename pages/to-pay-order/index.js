// pages/to-pay-order/index.js
const AUTH = require('../../utils/auth')
const Bigjs = require('big.js')
import { goodsInfo, createOrder } from '../../apis/products'

Page({
  data: {
    goodsList: [],
    allGoodsAndYunPrice: 0,
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车， buyNow 说明是立即购买
    peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
    remark: ''
  },
  onShow() {
    // 校验用户登录状态
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.doneShow()
      } else {
        AUTH.authorize().then(res => {
          // AUTH.bindSeller()
          this.doneShow()
        })
      }
    })
  },
  async doneShow() {
    let goodsList = []
    let shopList = []
    var totalPrice = 0
    //立即购买下单
    if ("buyNow" == this.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      this.data.kjId = buyNowInfoMem.kjId;
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        goodsList = buyNowInfoMem.shopList
        buyNowInfoMem.shopList.forEach(ele => {
          totalPrice += Bigjs(ele.number).times(ele.price).toNumber()
        })
      }
    } else {
      //购物车下单
      const res = await goodsInfo()
      goodsList = res.items.filter(ele => {
        return ele.selected
      })
      goodsList.forEach(ele => {
        totalPrice += Bigjs(ele.number).times(ele.price).toNumber()
      })
    }
    this.setData({
      shopList,
      goodsList,
      peisongType: this.data.peisongType,
      allGoodsAndYunPrice: totalPrice
    })
  },

  onLoad(e) {
    let _data = {}
    // 商品详情页立即下单
    if (e.orderType) {
      _data.orderType = e.orderType
    }
    this.setData(_data)
  },
  remarkChange(e) {
    this.data.remark = e.detail.value
  },
  async goCreateOrder() {
    const params = {
      remark: this.data.remark,
      peisongType: this.data.peisongType
    }
    if (this.data.peisongType === 'zq') {
      params.name = this.data.name
      params.mobile = this.data.mobile
    }
    // 如果是立即支付，需要传入商品数据
    if ("buyNow" == this.data.orderType) {
      params.goods = this.data.goodsList
    }
   
    const res = await createOrder(params)
    wx.requestPayment({
      timeStamp: res.timestamp,
      nonceStr: res.nonceStr,
      package: 'prepay_id=' + res.prepay_id,
      signType: 'RSA',
      paySign: res.paySign,
      success() {
        console.log('微信支付成功')
        wx.redirectTo({
          url: '/pages/order-list/index?type=1',
        })
      },
      fail () {
        console.log('微信支付失败')
      }
    })
  },
  radioChange(e) {
    this.setData({
      peisongType: e.detail.value
    })
  },
})