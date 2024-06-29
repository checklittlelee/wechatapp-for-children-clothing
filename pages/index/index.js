// index.js
const { bannerList, goodsDynamic, category, notice, seckill, hotGoods, discount, collage, goodlist} = require('../../apis/products')

Page({
  data: {
    banner: [],
    goodsDynamic: [],
    category: [],
    noticeList: [],
    miaoshaGoods: [],
    goodsRecommend: [],
    kanjiaList: [],
    pintuanList: [],
    page: 1,
    pageSize: 20,
    categoryId: '',
    totalRow : 0,
    goods: []
  },
  goSearch() {
    console.log('aaa')
  },

  // 点击金刚区商品分类进行跳转
  tabClick(e) {
    const sel_category = this.data.category.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    // sel_category是点击的分类的对象，将id存储到缓存中
    wx.setStorageSync("_categoryId", sel_category.id)
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  
  // 分页获取商品列表
  async getGoodsList() {
    const {page, pageSize, categoryId} = this.data
    wx.showLoading({
      mask: true
    })
    const res = await goodlist({page, pageSize, categoryId})
    wx.hideLoading()
    this.setData({
      goods: [...this.data.goods, ...res.data.result],
      totalRow: res.data.totalRow
    })
  },

  onLoad: function(options) {
    bannerList().then(res => {
      if(res.code === 10000) {
        this.setData({
          banner: res.data
        })
      }
    })
    goodsDynamic().then(res => {
      if(res.code === 10000) {
        this.setData({
          goodsDynamic: res.data
        })
      }
    })
    category().then(res => {
      if(res.code === 10000) {
        this.setData({
          category: res.data
        })
      }
    })

    notice().then(res => {
      if(res.code === 10000) {
        this.setData({
          noticeList: res.data
        })
      }
    })
    seckill().then(res => {
      if(res.code === 10000) {
        res.data.result.forEach(el => {
          const _now = Date.now()
          // 模拟假数据
          el.dateStart = '2024-06-25 12:00:00'
          el.dateEnd = '2024-07-02 12:00:00'
          // 设置的活动开始时间大于当前时间 说明活动未开始
          if(el.dateStart) {
            el.dateStartInt = new Date(el.dateStart.replace(/-/g, '/')).getTime() - _now
          }
          if(el.dateEnd) {
            el.dateEndInt = new Date(el.dateEnd.replace(/-/g, '/')).getTime() -_now
          }
        })
        this.setData({
          miaoshaGoods: res.data.result
        })
      }
    })
    hotGoods().then(res => {
      this.setData({
        goodsRecommend: res.data.result
      })
    })
    discount().then(res => {
      this.setData({
        kanjiaList: res.data.result
      })
    })
    collage().then(res => {
      this.setData({
        pintuanList: res.data.result
      })
    })
    this.getGoodsList()
  },
  
  onReachBottom: function() {
    if(this.data.goods.length >= this.data.totalRow) return
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.getGoodsList()
    })
  }
})
