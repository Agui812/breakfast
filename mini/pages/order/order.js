const api = require('../../utils/api')

Page({
  data: {
    orders: [],
    lastStatusMap: {},
    userId: null,
    userPhone: ''
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    const savedPhone = wx.getStorageSync('savedPhone') || ''
    this.setData({ 
      userId: userInfo ? userInfo.id : null,
      userPhone: savedPhone
    })
    this.loadOrders()
    this.startPolling()
  },

  onHide() {
    this.stopPolling()
  },

  onUnload() {
    this.stopPolling()
  },

  startPolling() {
    this.pollTimer = setInterval(() => {
      this.checkStatusChange()
    }, 10000)
  },

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  },

  async loadOrders() {
    const userId = this.data.userId
    const userPhone = this.data.userPhone
    
    try {
      const res = await api.getOrders()
      const allOrders = res.data.map(item => ({
        id: item.id,
        orderNo: item.order_no,
        pickupCode: item.pickup_code,
        phone: item.phone,
        pickupTime: item.pickup_time,
        totalPrice: item.total_amount,
        status: item.order_status === 1 ? 'pending' : item.order_status === 2 ? 'completed' : 'picked',
        createTime: item.create_time,
        userId: item.user_id
      }))
      
      const userOrders = allOrders.filter(order => {
        return order.userId === userId || (userPhone && order.phone === userPhone)
      })
      
      const lastStatusMap = this.data.lastStatusMap
      const newStatusMap = {}
      
      userOrders.forEach(order => {
        newStatusMap[order.id] = order.status
        
        if (lastStatusMap[order.id] && lastStatusMap[order.id] !== order.status) {
          this.handleStatusChange(order, lastStatusMap[order.id], order.status)
        }
      })
      
      this.setData({ 
        orders: userOrders,
        lastStatusMap: newStatusMap
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async checkStatusChange() {
    const userId = this.data.userId
    const userPhone = this.data.userPhone
    
    try {
      const res = await api.getOrders()
      const allOrders = res.data.map(item => ({
        id: item.id,
        status: item.order_status === 1 ? 'pending' : item.order_status === 2 ? 'completed' : 'picked',
        orderNo: item.order_no,
        pickupCode: item.pickup_code,
        phone: item.phone,
        userId: item.user_id
      }))
      
      const userOrders = allOrders.filter(order => {
        return order.userId === userId || (userPhone && order.phone === userPhone)
      })
      
      const lastStatusMap = this.data.lastStatusMap
      const newStatusMap = {}
      
      userOrders.forEach(order => {
        newStatusMap[order.id] = order.status
        
        if (lastStatusMap[order.id] && lastStatusMap[order.id] !== order.status) {
          this.handleStatusChange(order, lastStatusMap[order.id], order.status)
        }
      })
      
      this.setData({ lastStatusMap: newStatusMap })
    } catch (err) {
      console.error('轮询失败', err)
    }
  },

  handleStatusChange(order, oldStatus, newStatus) {
    const messages = wx.getStorageSync('messages') || []
    const now = new Date()
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (oldStatus === 'pending' && newStatus === 'completed') {
      messages.unshift({
        id: Date.now(),
        type: 'pickup',
        icon: '',
        title: '取餐啦',
        desc: `您的订单（取餐码：${order.pickupCode}）已制作完成，请尽快到店取餐`,
        time: timeStr,
        action: 'viewOrder',
        actionText: '查看订单',
        unread: true
      })
      wx.setStorageSync('messages', messages)
      
      wx.showToast({
        title: '取餐啦！',
        icon: 'success',
        duration: 2000
      })
    }
  }
})
