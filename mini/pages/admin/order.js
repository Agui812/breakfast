const api = require('../../utils/api')

Page({
  data: {
    orders: [],
    filteredOrders: [],
    filterStatus: 'all'
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders() {
    try {
      const res = await api.getOrders()
      const orders = res.data.map(item => ({
        id: item.id,
        orderNo: item.order_no,
        pickupCode: item.pickup_code,
        phone: item.phone,
        pickupTime: item.pickup_time,
        totalPrice: item.total_amount,
        status: item.order_status === 1 ? 'pending' : item.order_status === 2 ? 'completed' : 'picked',
        createTime: item.create_time
      }))
      this.setData({ orders })
      this.filterOrders()
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onFilter(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ filterStatus: status })
    this.filterOrders()
  },

  filterOrders() {
    const { orders, filterStatus } = this.data
    const filtered = filterStatus === 'all' 
      ? orders 
      : orders.filter(o => o.status === filterStatus)
    this.setData({ filteredOrders: filtered })
  },

  async onComplete(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orders.find(o => o.id === id)
    
    if (!order) return

    try {
      await api.updateOrderStatus(id, 2)
      wx.showToast({ title: '已标记完成', icon: 'success' })
      this.loadOrders()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async onPickup(e) {
    const id = e.currentTarget.dataset.id
    
    try {
      await api.updateOrderStatus(id, 3)
      wx.showToast({ title: '核销成功', icon: 'success' })
      this.loadOrders()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onReply(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orders.find(o => o.id === id)
    
    if (!order) return

    wx.showModal({
      title: '回复顾客',
      editable: true,
      placeholderText: '请输入回复内容',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const feedbacks = await api.getFeedbacks({ status: 0 })
            if (feedbacks.data && feedbacks.data.length > 0) {
              const feedback = feedbacks.data[0]
              await api.request(`/feedbacks/${feedback.id}/reply`, 'PUT', { reply: res.content })
              
              const messages = wx.getStorageSync('messages') || []
              const now = new Date()
              const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
              messages.unshift({
                id: Date.now(),
                type: 'reply',
                icon: '',
                title: '商家回复',
                desc: res.content,
                time: timeStr,
                action: null,
                actionText: '',
                unread: true
              })
              wx.setStorageSync('messages', messages)
              
              wx.showToast({ title: '已发送', icon: 'success' })
            } else {
              wx.showToast({ title: '暂无待处理反馈', icon: 'none' })
            }
          } catch (err) {
            wx.showToast({ title: '发送失败', icon: 'none' })
          }
        }
      }
    })
  },

  onPrint(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orders.find(o => o.id === id)
    
    if (!order) return

    let content = `订单号：${order.orderNo}\n`
    content += `取餐码：${order.pickupCode}\n`
    content += `自取时间：${order.pickupTime}\n`
    content += `----------------\n`
    
    for (const item of order.items) {
      content += `${item.name} x${item.quantity}\n`
    }
    
    content += `----------------\n`
    content += `总计：¥${order.totalPrice}`

    wx.showModal({
      title: '订单小票',
      content: content,
      showCancel: false,
      confirmText: '关闭'
    })
  }
})
