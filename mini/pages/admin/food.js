const storage = require('../../utils/storage')

Page({
  data: {
    foods: [],
    showModal: false,
    editingFood: null,
    formData: {
      name: '',
      price: '',
      dailyLimit: ''
    }
  },

  onShow() {
    this.loadFoods()
  },

  loadFoods() {
    const foods = storage.getFoods()
    this.setData({ foods })
  },

  onAdd() {
    this.setData({
      showModal: true,
      editingFood: null,
      formData: { name: '', price: '', dailyLimit: '' }
    })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    const food = this.data.foods.find(f => f.id === id)
    this.setData({
      showModal: true,
      editingFood: food,
      formData: {
        name: food.name,
        price: String(food.price),
        dailyLimit: String(food.dailyLimit)
      }
    })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个餐品吗？',
      success: (res) => {
        if (res.confirm) {
          const foods = this.data.foods.filter(f => f.id !== id)
          storage.saveFoods(foods)
          this.setData({ foods })
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onPriceInput(e) {
    this.setData({ 'formData.price': e.detail.value })
  },

  onLimitInput(e) {
    this.setData({ 'formData.dailyLimit': e.detail.value })
  },

  onCancel() {
    this.setData({ showModal: false })
  },

  onConfirm() {
    const { name, price, dailyLimit } = this.data.formData
    
    if (!name || !price || !dailyLimit) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    const foods = this.data.foods

    if (this.data.editingFood) {
      const index = foods.findIndex(f => f.id === this.data.editingFood.id)
      foods[index] = {
        ...foods[index],
        name,
        price: parseFloat(price),
        dailyLimit: parseInt(dailyLimit),
        stock: Math.min(foods[index].stock, parseInt(dailyLimit))
      }
    } else {
      const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id)) + 1 : 1
      foods.push({
        id: newId,
        name,
        price: parseFloat(price),
        dailyLimit: parseInt(dailyLimit),
        stock: parseInt(dailyLimit),
        image: '',
        status: 'onsale'
      })
    }

    storage.saveFoods(foods)
    this.setData({ foods, showModal: false })
    wx.showToast({ title: '保存成功', icon: 'success' })
  }
})
