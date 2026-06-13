const api = require('../../utils/api')

Page({
  data: {
    foods: [],
    allFoods: [],
    categories: [{ name: '全部' }],
    activeCategory: 0,
    cart: {},
    totalQuantity: 0,
    totalPrice: '0.00',
    cartExpanded: false,
    cartItems: []
  },

  onShow() {
    this.setData({
      cart: {},
      totalQuantity: 0,
      totalPrice: '0.00',
      cartExpanded: false,
      cartItems: []
    })
    this.loadData()
  },

  async loadData() {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ])

      const categories = [
        { id: 0, name: '全部' },
        ...categoriesRes.data.map(item => ({ id: item.id, name: item.name }))
      ]

      const foods = productsRes.data.map(item => ({
        id: item.id,
        category_id: item.category_id || 0,
        name: item.name,
        price: parseFloat(item.price),
        dailyLimit: item.daily_stock,
        stock: item.current_stock,
        image: item.image ? (item.image.startsWith('http') ? item.image : api.IMAGE_BASE + item.image) : '',
        status: item.status === 1 ? 'onsale' : 'soldout'
      }))

      this.setData({
        categories,
        allFoods: foods,
        foods: foods
      })
      this.calculateTotal()
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onPlus(e) {
    const id = e.currentTarget.dataset.id
    const cart = { ...this.data.cart }
    cart[id] = (cart[id] || 0) + 1
    this.setData({ cart })
    this.calculateTotal()
  },

  onMinus(e) {
    const id = e.currentTarget.dataset.id
    const cart = { ...this.data.cart }
    if (cart[id] > 0) {
      cart[id] = cart[id] - 1
      this.setData({ cart })
      this.calculateTotal()
    }
  },

  calculateTotal() {
    const foods = this.data.foods
    const cart = this.data.cart
    let totalQuantity = 0
    let totalPrice = 0
    const cartItems = []

    for (const id in cart) {
      const food = foods.find(f => f.id === parseInt(id))
      if (food && cart[id] > 0) {
        totalQuantity += cart[id]
        totalPrice += food.price * cart[id]
        cartItems.push({
          id: food.id,
          name: food.name,
          price: food.price,
          quantity: cart[id]
        })
      }
    }

    this.setData({
      totalQuantity,
      totalPrice: totalPrice.toFixed(2),
      cartItems
    })
  },

  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index
    const categoryId = this.data.categories[index].id

    let foods
    if (categoryId === 0) {
      foods = this.data.allFoods
    } else {
      foods = this.data.allFoods.filter(f => f.category_id === categoryId)
    }

    this.setData({
      activeCategory: index,
      foods
    })
  },

  onCheckout() {
    if (this.data.totalQuantity === 0) return

    const cartItems = []
    for (const id in this.data.cart) {
      if (this.data.cart[id] > 0) {
        const food = this.data.foods.find(f => f.id === parseInt(id))
        cartItems.push({
          id: food.id,
          name: food.name,
          price: food.price,
          quantity: this.data.cart[id]
        })
      }
    }

    wx.navigateTo({
      url: `/pages/checkout/checkout?cart=${encodeURIComponent(JSON.stringify(cartItems))}`
    })
  },

  onCartTap() {
    this.setData({
      cartExpanded: !this.data.cartExpanded
    })
  },

  onStopPropagation() {},

  onClearCart() {
    this.setData({
      cart: {},
      cartExpanded: false
    })
    this.calculateTotal()
  },

  onPlusDetail(e) {
    const id = e.currentTarget.dataset.id
    const cart = { ...this.data.cart }
    cart[id] = (cart[id] || 0) + 1
    this.setData({ cart })
    this.calculateTotal()
  },

  onMinusDetail(e) {
    const id = e.currentTarget.dataset.id
    const cart = { ...this.data.cart }
    if (cart[id] > 1) {
      cart[id] = cart[id] - 1
      this.setData({ cart })
      this.calculateTotal()
    } else {
      delete cart[id]
      this.setData({ cart })
      this.calculateTotal()
    }
  }
})
