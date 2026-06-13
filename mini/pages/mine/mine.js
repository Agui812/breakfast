const api = require('../../utils/api')
const storage = require('../../utils/storage')

Page({
  data: {
    isLogin: false,
    avatarUrl: '',
    nickName: '',
    openTime: '06:00',
    closeTime: '10:00',
    presets: [],
    showModal: false,
    editingPreset: null,
    formData: { name: '', timeSlot: '', dineType: 'takeout' },
    availableFoods: [],
    selectedFoods: {},
    timeSlots: []
  },

  async onShow() {
    try {
      const res = await api.getConfig()
      const config = res.data
      this.setData({
        openTime: config.business_start.substring(0, 5),
        closeTime: config.business_end.substring(0, 5)
      })
    } catch (err) {
      this.setData({ openTime: '06:00', closeTime: '10:00' })
    }

    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        isLogin: true,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      })
      this.loadPresets()
    }
  },

  onLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  loadPresets() {
    const presets = storage.getPresets()
    this.setData({ presets })
  },

  async onAddPreset() {
    try {
      const [productsRes, configRes] = await Promise.all([
        api.getProducts(),
        api.getConfig()
      ])

      const foods = productsRes.data.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        dailyLimit: item.daily_stock,
        stock: item.current_stock,
        image: item.image ? (item.image.startsWith('http') ? item.image : api.IMAGE_BASE + item.image) : '',
        status: item.status === 1 ? 'onsale' : 'soldout'
      }))

      const config = configRes.data
      const startTime = config.business_start.substring(0, 5)
      const endTime = config.business_end.substring(0, 5)
      const timeSlots = this.generateTimeSlots(startTime, endTime)

      this.setData({
        showModal: true,
        editingPreset: null,
        formData: { name: '', timeSlot: '', dineType: 'takeout' },
        availableFoods: foods,
        selectedFoods: {},
        timeSlots
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async onEditPreset(e) {
    const id = e.currentTarget.dataset.id
    const preset = this.data.presets.find(p => p.id === id)

    try {
      const [productsRes, configRes] = await Promise.all([
        api.getProducts(),
        api.getConfig()
      ])

      const foods = productsRes.data.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        dailyLimit: item.daily_stock,
        stock: item.current_stock,
        image: item.image ? (item.image.startsWith('http') ? item.image : api.IMAGE_BASE + item.image) : '',
        status: item.status === 1 ? 'onsale' : 'soldout'
      }))

      const config = configRes.data
      const startTime = config.business_start.substring(0, 5)
      const endTime = config.business_end.substring(0, 5)
      const timeSlots = this.generateTimeSlots(startTime, endTime)

      const selectedFoods = {}
      preset.foodList.forEach(item => {
        selectedFoods[item.id] = item.quantity
      })

      this.setData({
        showModal: true,
        editingPreset: preset,
        formData: { name: preset.name, timeSlot: preset.timeSlot || '', dineType: preset.dineType || 'takeout' },
        availableFoods: foods,
        selectedFoods,
        timeSlots
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
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

  onDeletePreset(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个预设吗？',
      success: (res) => {
        if (res.confirm) {
          const presets = storage.deletePreset(id)
          this.setData({ presets })
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  onToggleFood(e) {
    const id = e.currentTarget.dataset.id
    const selectedFoods = { ...this.data.selectedFoods }
    if (selectedFoods[id]) {
      delete selectedFoods[id]
    } else {
      selectedFoods[id] = 1
    }
    this.setData({ selectedFoods })
  },

  onPlusFood(e) {
    const id = e.currentTarget.dataset.id
    const selectedFoods = { ...this.data.selectedFoods }
    selectedFoods[id] = (selectedFoods[id] || 0) + 1
    this.setData({ selectedFoods })
  },

  onMinusFood(e) {
    const id = e.currentTarget.dataset.id
    const selectedFoods = { ...this.data.selectedFoods }
    if (selectedFoods[id] > 1) {
      selectedFoods[id]--
    } else {
      delete selectedFoods[id]
    }
    this.setData({ selectedFoods })
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onSelectTime(e) {
    this.setData({ 'formData.timeSlot': e.currentTarget.dataset.slot })
  },

  onSelectDineType(e) {
    this.setData({ 'formData.dineType': e.currentTarget.dataset.type })
  },

  onCancel() {
    this.setData({ showModal: false })
  },

  onConfirm() {
    if (Object.keys(this.data.selectedFoods).length === 0) {
      wx.showToast({ title: '请至少选择一个餐品', icon: 'none' })
      return
    }

    let name = this.data.formData.name
    if (!name) {
      const presets = storage.getPresets()
      name = `套餐${presets.length + 1}`
    }

    const foods = this.data.availableFoods
    const foodList = []
    let totalPrice = 0
    let itemsText = []

    for (const id in this.data.selectedFoods) {
      const food = foods.find(f => f.id === parseInt(id))
      if (food) {
        const qty = this.data.selectedFoods[id]
        foodList.push({ id: food.id, name: food.name, price: food.price, quantity: qty })
        totalPrice += food.price * qty
        itemsText.push(`${food.name}x${qty}`)
      }
    }

    const preset = {
      name,
      foodList,
      items: itemsText.join('、'),
      totalPrice: totalPrice.toFixed(2),
      timeSlot: this.data.formData.timeSlot,
      dineType: this.data.formData.dineType
    }

    let presets
    if (this.data.editingPreset) {
      presets = storage.updatePreset(this.data.editingPreset.id, preset)
    } else {
      presets = storage.addPreset(preset)
    }

    this.setData({ presets, showModal: false })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  onQuickOrder(e) {
    const id = e.currentTarget.dataset.id
    const preset = this.data.presets.find(p => p.id === id)

    if (!preset) return

    const cartItems = preset.foodList.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))

    let url = `/pages/checkout/checkout?cart=${encodeURIComponent(JSON.stringify(cartItems))}`
    if (preset.timeSlot) {
      url += `&timeSlot=${preset.timeSlot}`
    }
    if (preset.dineType) {
      url += `&dineType=${preset.dineType}`
    }

    wx.navigateTo({ url })
  },

  onFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  }
})
