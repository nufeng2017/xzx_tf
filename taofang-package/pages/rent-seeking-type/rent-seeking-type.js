var appInstance = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  onShow: function () {},

  doPublish(e) {
    let changeUid = appInstance.getUtil.cacheGet("changeUid")
    console.log(changeUid)
    if (changeUid) {
      wx.redirectTo({
        url: "/taofang-package/pages/rent-seeking-form/rent-seeking-form?infotype=" + e.currentTarget.dataset.type,
      });
    } else {
      // 没有登录过
      this.navigateTo("/pages/login/login")
    }
  },

  navigateTo(url) {
    wx.navigateTo({
      url: url,
    })
  }
});