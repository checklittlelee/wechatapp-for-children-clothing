// pages/category/category.js
const TOOLS = require('../../utils/tools.js')
const { category, addGoods, goodlist } = require('../../apis/products')

Page({
  data: {
    value: '', // 搜索框
    activeCategory: 0, // 左侧菜单栏中具体点击的分类的索引
    firstCategories: [], // 左侧菜单栏数组，默认返回的数据都是一级菜单，但是逻辑中也实现了筛选
    categorySelected: {
      name: '',
      id: ''
    },
    page: 1,
    pageSize: 20,
    currentGoods: [], // 右侧商品数组
    scrolltop: 0,
    skuCurGoods: undefined,
  },

  // 生命周期：页面首次加载完成
  onLoad() {
    this.categorys()
  },
  // 生命周期：页面被激活唤醒
  onShow() {
    // 首页金刚区商品分类点击跳转后，分类的id被存储到了换成，在category页面进行读取
    const _categoryId = wx.getStorageSync('_categoryId')
    wx.removeStorageSync('_categoryId')
    if(_categoryId) {
      this.data.categorySelected.id = _categoryId
      this.categorys()
    }
  },

  // 搜索框右侧扫码
  searchScan() {
    scanType: ['QR_CODE'],
    wx.scanCode({
      success (res) {
        wx.navigateTo({
          url: `/pages/goods/list?name=${res.result}`,
        })
      }
    })
  },
  // 获取右侧分类侧边导航
  async categorys() {
    wx.showLoading({
      title: '加载中',
    })
    // 调用异步函数获取分类数据
    const res = await category()
    wx.hideLoading()
    // 当前激活的一级分类的索引，默认为第一个
    let activeCategory = 0
    // 当前选中的分类的具体信息，用于后续页面显示和操作
    let categorySelected = this.data.categorySelected
    if(res.code === 10000) {
      const categories = res.data
      // 从返回的数据中的分类数组中筛选出一级菜单数组，包含所有一级分类菜单对象，数组中共有10个元素
      const firstCategories = categories.filter(el => (el.level ===1))
      // 判断当前是否有选中的分类
      if(this.data.categorySelected.id) {
        // 找到当前选中分类在一级分类数组中的索引，van-sidebar中属性active-key需要
        activeCategory = firstCategories.findIndex(el => {
          return el.id === this.data.categorySelected.id
        })
        categorySelected = firstCategories[activeCategory]
      } else {
        // 如果没有选中的分类，默认选中第一个一级分类
        categorySelected = firstCategories[0]
      }
      this.setData({
        activeCategory,
        firstCategories,
        categorySelected
      })
      this.getGoodsList()
    }
  },

  // 点击左侧分类右侧跳转
  onCategoryClick(e) {
    const idx = e.currentTarget.dataset.idx
    const categorySelected = this.data.firstCategories[idx]
    this.setData({
      page: 1,
      activeCategory: idx,
      categorySelected,
    });
    this.getGoodsList();
  },
  // 请求商品数据
  async getGoodsList() {
    wx.showLoading({
      title: '加载中',
    })
    // 获取当前类目id 举例：1875
    const categoryId = this.data.categorySelected.id
    const res = await goodlist({
      page: this.data.page,
      pageSize: this.data.pageSize,
      categoryId
    })
    wx.hideLoading()
    if(res.code === 10000) {
      // 处理分页
      if(this.data.page == 1) {
        this.setData({
          currentGoods: res.data.result
        })
      } else {
        this.setData({
          currentGoods: this.data.currentGoods.concat(res.data.result)
        })
      }
    }
    // 当前列表没有数据
    if (res.code == 700) {
      if (this.data.page == 1) {
        this.setData({
          currentGoods: null
        });
      } else {
        wx.showToast({
          title: '没有更多了',
          icon: 'none'
        })
      }
      return
    }
  },
  // 商品列表滚动到底部触发事件
  goodsGoBottom() {
    this.setData({
      page: this.data.page + 1
    })
    this.getGoodsList()
  },
  // 点击商品按钮选择规格或者跳转购物车
  async addShopCar(e) {
    // 找到具体点击了哪一个商品的加号或者购物车
    const curGood = this.data.currentGoods.find(ele => {
      return ele.id == e.currentTarget.dataset.id
    })
    // 商品当前id
    if (!curGood) {
      return
    }
    if (!curGood.propertyIds && !curGood.hasAddition) {
      // 不需要选择sku的商品直接调接口，添加到购物车
      await addGoods(curGood)
      TOOLS.showTabBarBadge()
    } else {
      // 如果是需要勾选的sku，赋值skuCurGoods，子组件goods-pop接收这个数据后，内部observers监听变化，触发Popup 弹出层
      this.setData({
        skuCurGoods: curGood
      })
    }
  },
})