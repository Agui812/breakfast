const storage = require('./utils/storage')

App({
  onLaunch() {
    storage.getFoods()
    storage.getShopConfig()
  },
  globalData: {
    userInfo: null
  }
})
