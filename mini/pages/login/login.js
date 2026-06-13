const api = require('../../utils/api')

Page({
  data: {},

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: async (profileRes) => {
        wx.showLoading({ title: '登录中...' })
        try {
          const res = await api.wxLogin({
            openid: 'wx_' + Date.now(),
            nickname: profileRes.userInfo.nickName,
            avatar: profileRes.userInfo.avatarUrl
          })

          const userInfo = {
            id: res.data.user_id,
            nickName: res.data.nickname,
            avatarUrl: res.data.avatar
          }
          wx.setStorageSync('userInfo', userInfo)

          wx.hideLoading()
          wx.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            const pages = getCurrentPages()
            if (pages.length > 1) {
              wx.navigateBack()
            } else {
              wx.switchTab({ url: '/pages/index/index' })
            }
          }, 1000)
        } catch (err) {
          wx.hideLoading()
        }
      },
      fail: () => {
        wx.showToast({ title: '登录已取消', icon: 'none' })
      }
    })
  },

  onGuestLogin() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
