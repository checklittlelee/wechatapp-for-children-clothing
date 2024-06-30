// pages/shop-cart/index.js
const TOOLS = require('../../utils/tools.js')
import Bigjs from 'big.js' // JS浮点运算容易出现精度问题，bigjs可以确保计算结果准确
import { goodsInfo, modifyNumber, goodSelect, delGoods } from '../../apis/products'

Page({
  data: {
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
  },

  // 根据窗口宽度计算元素的实际宽度 rpx
  getEleWidth: function (w) {
    var real = 0;
    try {
      // 获取屏幕可用宽度，像素为px
      var res = wx.getWindowInfo().windowWidth
      // 窗口是给的px单位，需要换算成rpx
      var scale = (750 / 2) / (w / 2)
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  // 初始化删除按钮的宽度
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  // 获取购入车详情，使用 Bigjs 精确计算总价，并更新状态
  async shoppingCarInfo() {
    const res = await goodsInfo()
    let totalPrice = 0
    res.items.forEach(ele => {
      if (ele.selected) {
        totalPrice += Bigjs(ele.number).times(ele.price).toNumber()
      }
    })
    res.price = totalPrice
    this.setData({
      shoppingCarInfo: res || []
    })
  },

  /**
   * 生命周期方法
   */
  // 页面加载时调用
  onLoad: function () {
    this.initEleWidth();
    this.setData({
      shopping_cart_vop_open: wx.getStorageSync('shopping_cart_vop_open')
    })
  },
  // 更新购物车信息并刷新标签栏徽章
  onShow: function () {
    this.shoppingCarInfo()
    TOOLS.showTabBarBadge()
  },

  // 导航到主页：wx.navigateTo不能用于跳到 tabbar 页面。使用wx.switchTab，跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  /**
   * 
   * 触摸事件
   * bindtouchstart 事件用于监听触摸屏幕的开始时刻
   * bindtouchmove 事件用于监听用户在触摸屏幕时的移动操作，在用户移动时会持续触发
   * bindtouchend 事件用于监听用户触摸结束时的操作
   */
  // 记录触摸起始的 X 坐标
  touchS: function (e) {
    // e.touches.length == 1：确保用户进行的是单点触摸。多点触控，典型的有双指缩放或双指滑动操作
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  // 处理触摸移动，调整购物车项目的位置以显示删除按钮
  touchM: function (e) {
    // 确定购物车中商品列表里被拖拽的商品的索引
    const index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      // 记录向左拖拽的距离
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      // 判断是否为向左拖拽
      if (disX == 0 || disX < 0) {
        left = "margin-left:0px";
      } else if (disX > 0) {
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      // 每次触摸都会触发更新，具有实时性
      // 不将index放在setData中主要是考虑性能：在触摸移动过程中，touchM 事件会被频繁触发，每次都更新视图层会带来不必要的性能开销
      this.data.shoppingCarInfo.items[index].left = left
      this.setData({
        shoppingCarInfo: this.data.shoppingCarInfo
      })
    }
  },
  // 在触摸结束时确定位置，决定是否显示删除按钮
  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      this.data.shoppingCarInfo.items[index].left = left
      this.setData({
        shoppingCarInfo: this.data.shoppingCarInfo
      })
    }
  },

  /**
   * 购物车相关操作
   */
  // 删除项目并刷新购物车
  async delItem(e) {
    const key = e.currentTarget.dataset.key
    this.delItemDone(key)
  },
  async delItemDone(key) {
    await delGoods({ key })
    this.shoppingCarInfo()
    TOOLS.showTabBarBadge()
  },

  // 增加数量，更新后端并刷新购物车
  async jiaBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shoppingCarInfo.items[index]
    const number = item.number + 1
    await modifyNumber({ key: item.pid || item.id, number })  
    this.shoppingCarInfo()
  },
  // 减少数量，数量为0时，确认删除
  async jianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.shoppingCarInfo.items[index]
    const number = item.number - 1
    if (number <= 0) {
      // 弹出删除确认
      wx.showModal({
        content: '确定要删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.delItemDone(item.pid || item.id)
          }
        }
      })
      return
    }
    await modifyNumber({ key: item.pid || item.id, number })
    this.shoppingCarInfo()
  },
  // 在+和- 之间的input中直接修改数值
  // async changeCarNumber(e) {
  //   const index = e.currentTarget.dataset.index;
  //   const item = this.data.shoppingCarInfo.items[index]
  //   const number = e.detail.value
  //   if(number) {
  //     await modifyNumber({key: item.pid || item.id, number})
  //     this.shoppingCarInfo()
  //   }
  // },
  // 切换购物车选中状态并更新购物车
  async radioClick(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.shoppingCarInfo.items[index]
    // 这里pid和id是针对商品是否有规格的情况
    // 可以选择规格的商品是pid，直接添加到购物车的商品是id
    await goodSelect({ key: item.pid || item.id, selected: !item.selected })
    this.shoppingCarInfo()
    TOOLS.showTabBarBadge()
  },
})