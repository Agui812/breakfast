function getFoods() {
  const foods = wx.getStorageSync('foods')
  if (!foods) {
    const defaultFoods = [
      { id: 1, name: '鲜肉包', price: 2.5, dailyLimit: 300, stock: 300, image: '', status: 'onsale' },
      { id: 2, name: '菜包', price: 2, dailyLimit: 200, stock: 200, image: '', status: 'onsale' },
      { id: 3, name: '豆浆', price: 3, dailyLimit: 150, stock: 150, image: '', status: 'onsale' },
      { id: 4, name: '油条', price: 2, dailyLimit: 200, stock: 200, image: '', status: 'onsale' },
      { id: 5, name: '茶叶蛋', price: 2.5, dailyLimit: 100, stock: 100, image: '', status: 'onsale' },
      { id: 6, name: '粥', price: 4, dailyLimit: 100, stock: 100, image: '', status: 'onsale' }
    ]
    wx.setStorageSync('foods', defaultFoods)
    return defaultFoods
  }
  return foods
}

function saveFoods(foods) {
  wx.setStorageSync('foods', foods)
}

function getOrders() {
  return wx.getStorageSync('orders') || []
}

function saveOrders(orders) {
  wx.setStorageSync('orders', orders)
}

function addOrder(order) {
  const orders = getOrders()
  orders.unshift(order)
  saveOrders(orders)
  return order
}

function updateOrder(orderId, updates) {
  const orders = getOrders()
  const index = orders.findIndex(o => o.id === orderId)
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updateTime: new Date().toISOString() }
    saveOrders(orders)
    return orders[index]
  }
  return null
}

function generateOrderNo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `${year}${month}${day}${hour}${minute}${second}${random}`
}

function generatePickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function deductStock(cartItems) {
  const foods = getFoods()
  for (const item of cartItems) {
    const food = foods.find(f => f.id === item.id)
    if (food) {
      food.stock = Math.max(0, food.stock - item.quantity)
      food.status = food.stock === 0 ? 'soldout' : 'onsale'
    }
  }
  saveFoods(foods)
}

function restoreStock(cartItems) {
  const foods = getFoods()
  for (const item of cartItems) {
    const food = foods.find(f => f.id === item.id)
    if (food) {
      food.stock = Math.min(food.dailyLimit, food.stock + item.quantity)
      food.status = food.stock > 0 ? 'onsale' : 'soldout'
    }
  }
  saveFoods(foods)
}

function resetDailyStock() {
  const foods = getFoods()
  for (const food of foods) {
    food.stock = food.dailyLimit
    food.status = 'onsale'
  }
  saveFoods(foods)
}

function getShopConfig() {
  const config = wx.getStorageSync('shopConfig')
  if (!config) {
    const defaultConfig = {
      openTime: '06:00',
      closeTime: '10:00',
      timeSlots: ['06:00-06:30', '06:30-07:00', '07:00-07:30', '07:30-08:00', '08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00']
    }
    wx.setStorageSync('shopConfig', defaultConfig)
    return defaultConfig
  }
  return config
}

function saveShopConfig(config) {
  wx.setStorageSync('shopConfig', config)
}

function getPresets() {
  return wx.getStorageSync('presets') || []
}

function savePresets(presets) {
  wx.setStorageSync('presets', presets)
}

function addPreset(preset) {
  const presets = getPresets()
  preset.id = Date.now()
  presets.push(preset)
  savePresets(presets)
  return presets
}

function updatePreset(id, updates) {
  const presets = getPresets()
  const index = presets.findIndex(p => p.id === id)
  if (index !== -1) {
    presets[index] = { ...presets[index], ...updates }
    savePresets(presets)
  }
  return presets
}

function deletePreset(id) {
  const presets = getPresets().filter(p => p.id !== id)
  savePresets(presets)
  return presets
}

module.exports = {
  getFoods,
  saveFoods,
  getOrders,
  saveOrders,
  addOrder,
  updateOrder,
  generateOrderNo,
  generatePickupCode,
  deductStock,
  restoreStock,
  resetDailyStock,
  getShopConfig,
  saveShopConfig,
  getPresets,
  savePresets,
  addPreset,
  updatePreset,
  deletePreset
}
