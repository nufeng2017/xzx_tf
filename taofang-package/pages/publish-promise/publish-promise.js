var appInstance = getApp();
var that
Page({
  /**
   * 页面的初始数据
   */
  data: {
    disabled:true,
    houseType:"",
    publish:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that  = this
    this.setData({
      houseType:options.houseType,
      publish:options.publish
    })
  },
 
  onShow: function () {

  },

  checkboxChange(e){
    let tempDisabled = true
    if (e.detail.value.length > 0) {
      tempDisabled = false
    } else {
      tempDisabled = true
    }
    that.setData({
      disabled:tempDisabled
    })
  },

  doPublish(e){
    let userPublishInfoArr = appInstance.getUtil.cacheGet("userPublishInfos")
    let publish = false
    let changeUid = appInstance.getUtil.cacheGet("changeUid")
    if (userPublishInfoArr) {
      let hasCurrentUser = false
      var index
      for (index in userPublishInfoArr) {
        if (userPublishInfoArr[index].changeUid == changeUid ) {
          // userPublishInfoArr[index].publish = true
          hasCurrentUser = true
          break
        }
      }
      userPublishInfoArr.push({
        changeUid: changeUid
      })
    }else{
      userPublishInfoArr = [{
        changeUid: changeUid
        // publish:true
      }]
    }
    appInstance.getUtil.cachePut("userPublishInfos", userPublishInfoArr)
    wx.redirectTo({
      url: "/taofang-package/pages/publish-form/publish-form?houseType=" + that.data.houseType 
      + "&publish=" + that.data.publish
    })
  }
});