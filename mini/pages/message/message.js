const api = require('../../utils/api')

Page({
  data: {
    messages: [],
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
    this.loadMessages()
  },

  async loadMessages() {
    const userId = this.data.userId
    const userPhone = this.data.userPhone
    
    if (!userId && !userPhone) {
      this.setData({ messages: [] })
      return
    }

    try {
      const [ordersRes, feedbacksRes] = await Promise.all([
        api.getOrders(),
        api.getFeedbacks({ status: 1 })
      ])

      const messages = []

      ordersRes.data.forEach(order => {
        const isCurrentUserOrder = order.user_id === userId || (userPhone && order.phone === userPhone)
        
        if (!isCurrentUserOrder) return

        const createTime = new Date(order.create_time)

        messages.push({
          id: `order_${order.id}`,
          type: 'order',
          icon: '',
          title: '下单成功',
          desc: `取餐码：${order.pickup_code}，请按时到店取餐`,
          time: this.formatTime(createTime),
          action: 'viewOrder',
          actionText: '查看订单',
          unread: false,
          timestamp: createTime.getTime()
        })

        if (order.order_status === 2) {
          const updateTime = new Date(order.update_time || order.create_time)
          messages.push({
            id: `pickup_${order.id}`,
            type: 'pickup',
            icon: '',
            title: '取餐啦',
            desc: `您的订单（取餐码：${order.pickup_code}）已制作完成，请尽快到店取餐`,
            time: this.formatTime(updateTime),
            action: 'viewOrder',
            actionText: '查看订单',
            unread: false,
            timestamp: updateTime.getTime()
          })
        }
      })

      feedbacksRes.data.forEach(fb => {
        if (fb.reply && fb.user_id === userId) {
          const updateTime = new Date(fb.update_time)
          messages.push({
            id: `reply_${fb.id}`,
            type: 'reply',
            icon: '',
            title: '商家回复',
            desc: fb.reply,
            time: this.formatTime(updateTime),
            action: null,
            actionText: '',
            unread: false,
            timestamp: updateTime.getTime()
          })
        }
      })

      messages.sort((a, b) => b.timestamp - a.timestamp)

      this.setData({ messages })
    } catch (err) {
      console.error('加载消息失败', err)
      this.setData({ messages: [] })
    }
  },

  formatTime(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  onActionTap(e) {
    const action = e.currentTarget.dataset.action
    if (action === 'viewOrder') {
      wx.switchTab({ url: '/pages/order/order' })
    }
  }
})
