const api = require('../../utils/api')

Page({
  data: {
    feedbackTypes: ['功能建议', '使用体验', '问题反馈', '其他'],
    feedbackType: '',
    content: '',
    contact: ''
  },

  onSelectType(e) {
    this.setData({
      feedbackType: e.currentTarget.dataset.type
    })
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  async onSubmit() {
    if (!this.data.feedbackType) {
      wx.showToast({ title: '请选择反馈类型', icon: 'none' })
      return
    }

    if (!this.data.content) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })

    try {
      const userInfo = wx.getStorageSync('userInfo')
      const userId = userInfo ? userInfo.id : null

      await api.submitFeedback({
        user_id: userId,
        content: this.data.content,
        contact: this.data.contact
      })

      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
    }
  }
})
