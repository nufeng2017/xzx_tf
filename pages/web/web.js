// pages/web/web.js
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    img:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ options: options, img: options.img ? decodeURIComponent(options.img) : '0'});
  },
  onShow(){
    this.sendUserInfo();
  },
  sendUserInfo(){
    let that = this;
    let url = decodeURIComponent(that.data.options.url);
    let cacheKey = appInstance.getUtil.getUserinfoKey();
    let loginInfo = appInstance.getUtil.cacheGet(cacheKey);
    console.log(cacheKey)
    console.log(loginInfo)
    setTimeout(function(){
      that.setData({
        url:''
      });
      if (typeof wx.getStorageSync('user_info') == 'object') {
        that.setData({ url: url + '&uid=' + (loginInfo?loginInfo.passport_uid:'0') +'&avatar=' + encodeURIComponent(wx.getStorageSync('user_info').userInfo.avatarUrl) + '&nickname=' + wx.getStorageSync('user_info').userInfo.nickName});
      } else if (wx.getStorageSync('user_info') == 'get userinfo err'){
        that.setData({ url: url + '&uid=' + (loginInfo ? loginInfo.passport_uid : '0') + '&userinfo=err'});
      } else {
        that.setData({ url: url + '&uid=' + (loginInfo ? loginInfo.passport_uid : '0')});
      }
    },500);
  },
  // 分享
  onShareAppMessage(options) {
    let that = this;
    let o = {};
    if (that.data.img == 0){
      o = {
        title: that.title,
        desc: that.description,
        path: '/pages/web/web?url=' + that.data.options.url,
        success: function (res) {
          console.log(res, options)
        }
      }
    } else {
      o = {
        title: that.title,
        desc: that.description,
        path: '/pages/web/web?url=' + that.data.options.url + '&img=' + that.data.options.img,
        imageUrl: that.data.img,
        success: function (res) {
          console.log(res, options)
        }
      }
    }
    return o
  },
  
})