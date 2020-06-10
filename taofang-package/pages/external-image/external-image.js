Page({

  /**
   * 页面的初始数据
   */
  data: {
      imgUrl:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ imgUrl: options.imgUrl});
  },
  saveNum(e){
    var num = e.currentTarget.dataset.num;
    wx.setClipboardData({
      data: num,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
  call(e){
    var num = e.currentTarget.dataset.num;
    wx.makePhoneCall({
      phoneNumber: num //仅为示例，并非真实的电话号码
    })
  },
  qrcode(e){
    console.log(e)
    wx.previewImage({
      urls:[e.currentTarget.dataset.url],
      current: e.currentTarget.dataset.url
    })
  },
})