const api = require('../../utils/api')

Page({
  data: {
    cartItems: [],
    timeSlot: '',
    phone: '',
    totalPrice: '0.00',
    seatRows: [],
    selectedSeat: null
  },

  onLoad(options) {
    this.setData({
      cartItems: JSON.parse(decodeURIComponent(options.cart)),
      timeSlot: options.timeSlot,
      phone: options.phone,
      totalPrice: options.totalPrice
    })
    this.generateSeats()
  },

  generateSeats() {
    const rows = []
    const occupiedSeats = this.getOccupiedSeats()

    for (let r = 0; r < 4; r++) {
      const seats = []
      for (let c = 0; c < 6; c++) {
        const label = `${String.fromCharCode(65 + r)}${c + 1}`
        const isOccupied = occupiedSeats.includes(label)
        seats.push({
          id: `${r}-${c}`,
          label,
          colIndex: c,
          status: isOccupied ? 'occupied' : 'available'
        })
      }
      rows.push({ rowIndex: r, seats })
    }

    this.setData({ seatRows: rows })
  },

  getOccupiedSeats() {
    const occupied = wx.getStorageSync('occupiedSeats') || []
    return occupied
  },

  onSelectSeat(e) {
    const { row, col } = e.currentTarget.dataset
    const seat = this.data.seatRows[row].seats[col]

    if (seat.status === 'occupied') return

    const seatRows = this.data.seatRows.map((r, ri) => ({
      ...r,
      seats: r.seats.map((s, ci) => {
        if (ri === row && ci === col) {
          return { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
        }
        if (s.status === 'selected') {
          return { ...s, status: 'available' }
        }
        return s
      })
    }))

    const selectedSeat = seat.status === 'selected' ? null : seat
    this.setData({ seatRows, selectedSeat })
  },

  onConfirm() {
    if (!this.data.selectedSeat) {
      wx.showToast({ title: '请选择座位', icon: 'none' })
      return
    }

    const occupied = wx.getStorageSync('occupiedSeats') || []
    occupied.push(this.data.selectedSeat.label)
    wx.setStorageSync('occupiedSeats', occupied)

    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({
        selectedSeat: this.data.selectedSeat.label
      })
    }

    wx.navigateBack()
  }
})
