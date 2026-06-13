const storage = require('../../utils/storage')

Page({
  data: {
    todayOrders: 0,
    todayRevenue: '0.00',
    todayItems: 0
  },

  onShow() {
    this.loadStats()
  },

  loadStats() {
    const orders = storage.getOrders()
    const today = new Date().toDateString()
    
    const todayOrders = orders.filter(o => new Date(o.createTime).toDateString() === today)
    
    let totalRevenue = 0
    let totalItems = 0
    
    for (const order of todayOrders) {
      totalRevenue += parseFloat(order.totalPrice)
      totalItems += order.totalQuantity
    }
    
    this.setData({
      todayOrders: todayOrders.length,
      todayRevenue: totalRevenue.toFixed(2),
      todayItems: totalItems
    })
  },

  goToFood() {
    wx.navigateTo({ url: '/pages/admin/food' })
  },

  goToOrder() {
    wx.navigateTo({ url: '/pages/admin/order' })
  }
})
