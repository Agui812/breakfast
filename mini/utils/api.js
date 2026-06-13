const BASE_URL = 'http://localhost:3001/api'
const IMAGE_BASE = 'http://localhost:3001'

function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data)
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail(err) {
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

function login(username, password) {
  return request('/auth/login', 'POST', { username, password })
}

function getProducts(params = {}) {
  return request('/products', 'GET', params)
}

function getProduct(id) {
  return request(`/products/${id}`)
}

function addProduct(data) {
  return request('/products', 'POST', data)
}

function updateProduct(id, data) {
  return request(`/products/${id}`, 'PUT', data)
}

function deleteProduct(id) {
  return request(`/products/${id}`, 'DELETE')
}

function getCategories() {
  return request('/categories')
}

function getAllCategories() {
  return request('/categories/all')
}

function addCategory(data) {
  return request('/categories', 'POST', data)
}

function updateCategory(id, data) {
  return request(`/categories/${id}`, 'PUT', data)
}

function deleteCategory(id) {
  return request(`/categories/${id}`, 'DELETE')
}

function getOrders(params = {}) {
  return request('/orders', 'GET', params)
}

function getOrderDetail(orderNo) {
  return request(`/orders/${orderNo}`)
}

function createOrder(data) {
  return request('/orders', 'POST', data)
}

function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, 'PUT', { order_status: status })
}

function recordPrint(orderNo) {
  return request(`/orders/${orderNo}/print`, 'POST')
}

function getConfig() {
  return request('/config')
}

function updateConfig(data) {
  return request('/config', 'PUT', data)
}

function getDashboard() {
  return request('/dashboard')
}

function getPrintLogs(params = {}) {
  return request('/print-logs', 'GET', params)
}

function wxLogin(data) {
  return request('/users/login', 'POST', data)
}

function getUserInfo(id) {
  return request(`/users/${id}`)
}

function updateUserInfo(id, data) {
  return request(`/users/${id}`, 'PUT', data)
}

function submitFeedback(data) {
  return request('/feedbacks', 'POST', data)
}

function getFeedbacks(params = {}) {
  return request('/feedbacks', 'GET', params)
}

module.exports = {
  BASE_URL,
  IMAGE_BASE,
  request,
  login,
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getOrders,
  getOrderDetail,
  createOrder,
  updateOrderStatus,
  recordPrint,
  getConfig,
  updateConfig,
  getDashboard,
  getPrintLogs,
  wxLogin,
  getUserInfo,
  updateUserInfo,
  submitFeedback,
  getFeedbacks
}
