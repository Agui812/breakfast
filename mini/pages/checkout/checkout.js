const api = require('../../utils/api')

Page({
  data: {
    cartItems: [],
    timeSlots: [],
    selectedTimeSlot: '',
    dineType: '',
    selectedSeat: '',
    phone: '',
    totalQuantity: 0,
    totalPrice: '0.00'
  },

  async onLoad(options) {
    const cartItems = JSON.parse(decodeURIComponent(options.cart))
    const savedPhone = wx.getStorageSync('savedPhone') || ''

    try {
      const res = await api.getConfig()
      const config = res.data
      const startTime = config.business_start.substring(0, 5)
      const endTime = config.business_end.substring(0, 5)
      const timeSlots = this.generateTimeSlots(startTime, endTime)

      this.setData({
        cartItems,
        timeSlots,
        selectedTimeSlot: options.timeSlot || '',
        dineType: options.dineType || 'takeout',
        phone: savedPhone
      })
    } catch (err) {
      const defaultSlots = ['06:00-06:30', '06:30-07:00', '07:00-07:30', '07:30-08:00', '08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00']
      this.setData({
        cartItems,
        timeSlots: defaultSlots,
        selectedTimeSlot: options.timeSlot || '',
        phone: savedPhone
      })
    }

    this.calculateTotal()
  },

  generateTimeSlots(start, end) {
    const slots = []
    let [h, m] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    const endTotal = endH * 60 + endM

    while (h * 60 + m < endTotal) {
      const slotStart = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      m += 30
      if (m >= 60) {
        h += Math.floor(m / 60)
        m = m % 60
      }
      const slotEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      slots.push(`${slotStart}-${slotEnd}`)
    }
    return slots
  },

  onSelectTime(e) {
    this.setData({
      selectedTimeSlot: e.currentTarget.dataset.slot
    })
  },

  onSelectDineType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ dineType: type, selectedSeat: '' })

    if (type === 'dinein') {
      wx.navigateTo({
        url: `/pages/seat/seat?cart=${encodeURIComponent(JSON.stringify(this.data.cartItems))}&timeSlot=${this.data.selectedTimeSlot}&phone=${this.data.phone}&totalPrice=${this.data.totalPrice}`
      })
    }
  },

  onSelectSeat() {
    if (this.data.dineType === 'dinein') {
      wx.navigateTo({
        url: `/pages/seat/seat?cart=${encodeURIComponent(JSON.stringify(this.data.cartItems))}&timeSlot=${this.data.selectedTimeSlot}&phone=${this.data.phone}&totalPrice=${this.data.totalPrice}`
      })
    }
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  onShow() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      const currentPage = pages[pages.length - 1]
      if (currentPage.data.selectedSeat) {
        this.setData({
          selectedSeat: currentPage.data.selectedSeat
        })
      }
    }
  },

  calculateTotal() {
    let totalQuantity = 0
    let totalPrice = 0

    for (const item of this.data.cartItems) {
      totalQuantity += item.quantity
      totalPrice += item.price * item.quantity
    }

    this.setData({
      totalQuantity,
      totalPrice: totalPrice.toFixed(2)
    })
  },

  async onSubmit() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再下单',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }

    if (!this.data.dineType) {
      wx.showToast({ title: '请选择用餐方式', icon: 'none' })
      return
    }

    if (this.data.dineType === 'dinein' && !this.data.selectedSeat) {
      wx.showToast({ title: '请先选择座位', icon: 'none' })
      return
    }

    if (!this.data.selectedTimeSlot) {
      wx.showToast({ title: '请选择自取时间', icon: 'none' })
      return
    }

    if (!this.data.phone) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })

    try {
      const [startTime] = this.data.selectedTimeSlot.split('-')
      const orderData = {
        phone: this.data.phone,
        pickup_time: `${startTime}:00`,
        total_amount: this.data.totalPrice,
        dine_type: this.data.dineType,
        seat_number: this.data.selectedSeat || '',
        user_id: userInfo.id,
        nickname: userInfo.nickName,
        items: this.data.cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }

      const res = await api.createOrder(orderData)

      wx.hideLoading()
      wx.setStorageSync('savedPhone', this.data.phone)

      wx.showModal({
        title: '下单成功',
        content: this.data.selectedSeat 
          ? `座位：${this.data.selectedSeat}\n取餐码：${res.data.pickup_code}\n请到店用餐`
          : `取餐码：${res.data.pickup_code}\n请按时到店取餐`,
        showCancel: false,
        success: () => {
          wx.switchTab({ url: '/pages/order/order' })
        }
      })
    } catch (err) {
      wx.hideLoading()
    }
  }
})
