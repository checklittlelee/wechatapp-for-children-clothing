const WXAPI = require('apifm-wxapi')
import { selectGoods } from '../apis/products'

// 显示购物车tabBar的Badge
async function showTabBarBadge(noTabBarPage){
  let number = 0
  let res = await selectGoods()
  if (res.code === -1) return
  number += res.number
  // 如果当前页面显示了tabBar，再去更新；如果没有tabBar，出于性能考虑，不需要更新数字或红点
  if (!noTabBarPage) {
    if (number == 0) {
      // 删除红点点
      wx.removeTabBarBadge({
        index: 3
      })
    } else {
      // 显示红点点
      wx.setTabBarBadge({
        index: 3,
        text: number + ''
      })
    }
  }
  return number
}

module.exports = {
  showTabBarBadge: showTabBarBadge
}