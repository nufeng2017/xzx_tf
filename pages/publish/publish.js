import {tracking} from '../../utils/burying-point.js'
var appInstance = getApp();
var that;
var isVerified= true//是否实名认证 
Page({
  /**
   * 页面的初始数据
   */
  data: {
 
    isShowVerified:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    var promise = new Promise(function (resolve, reject) {
      setTimeout(function(){
        return reject(1);
      },5000);
    });
    promise.then(function(res){
      console.log(res)
    }).catch(err=>{
      console.log(err)
    });
  },

  onShow: function() {
    let changeUid = appInstance.getUtil.cacheGet("changeUid")
    if (changeUid) {
      appInstance.getUtil.checkAuthentication(appInstance.globalData.city, function(result) {
        isVerified: result.auth
        that.setData({
          isShowVerified: !result.auth
        })

      })
    }else{
      that.setData({
        isShowVerified: false
      })
    }

  },

  doPublish(info) {
    let changeUid = appInstance.getUtil.cacheGet("changeUid")
    if (changeUid) {
      let houseName = info.currentTarget.dataset.housetype
      // 登录过
      if (isVerified) {
        // 已经实名认证
        if (this.getUserPublishState()) {
          // 用户之前发布过房源
          this.navigateTo("/taofang-package/pages/publish-form/publish-form?houseType=" + houseName + "&publish=" + true)
        } else {
          // 用户之前没有发布过房源
          this.navigateTo("/taofang-package/pages/publish-promise/publish-promise?houseType=" + houseName + "&publish=" + true)
        }
      } else {
        // 没有实名认证
        wx.showModal({
          title: '',
          content: '您还不是实名认证用户，实名认证可优先审核',
          confirmText: "去认证",
          confirmColor: "#ff9000",
          cancelText: "继续发布",
          cancelColor: "#000",
          success(res) {
            if (res.confirm) {
              // 去认证
              wx.navigateTo({
                url: '/taofang-package/pages/authentication/authentication',
              })
            } else if (res.cancel) {
              // 继续发布
              if (that.getUserPublishState()) {
                // 用户之前发布过房源
                that.navigateTo("/taofang-package/pages/publish-form/publish-form?houseType=" + houseName + "&publish=" + true)
              } else {
                // 用户之前没有发布过房源
                that.navigateTo("/taofang-package/pages/publish-promise/publish-promise?houseType=" + houseName + "&publish=" + true)
              }
            }
          }
        })
      }

      //**埋点 */ 
      tracking({pageId:2418,eventType:4});
    } else {
      // 没有登录过
      this.navigateTo("/pages/login/login")
    }
  },

  /**
   * 更新是否点击过立即发布提示
   * @return true:用户之前发布过房源  false 用户之前没有发布过房源
   * 
   * userPublishInfos:[
   * {
   *  changeUid:"4479037"
   * }
   * ]
   */
  getUserPublishState() {
    let userPublishInfoArr = appInstance.getUtil.cacheGet("userPublishInfos")
    let publish = false
    let changeUid = appInstance.getUtil.cacheGet("changeUid")
    if (userPublishInfoArr) {
      var index
      for (index in userPublishInfoArr) {
        if (userPublishInfoArr[index].changeUid == changeUid) {
          // 已经点击过发布
          publish = true
          break
        }
      }
    }
    return publish
  },

  navigateTo(url) {
    wx.navigateTo({
      url: url,
    })
  }
});