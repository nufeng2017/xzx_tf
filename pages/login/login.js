import IMController from '../../controller/im.js'
import { connect } from '../../redux/index.js'
import { tracking } from '../../utils/tracking.js'
var appInstance = getApp();
let store = appInstance.store;
let pageConfig = {
  data: {
    phone: '',
    code: '',
    codename: '获取验证码',
    codedisable: false,
    scene: '',
    wx_code: '',
    loginEnable: true,
    hidephone:false,
    options:{}
  },
  //事件处理函数
  onLoad: function (options) {
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    //appInstance.getUtil.cacheRemove(cacheKey);
    var scene_str = decodeURIComponent(options.scene);
    if (scene_str) {
      var sceneArr = scene_str.split('_');
      if (sceneArr.length == 2) {
        this.setData({ 'scene': scene_str });
      }
    }
    this.resetStore();

    /*隐藏手机登陆*/
    if (options.hidephone == 1 && wx.getStorageSync(cacheKey)){
      this.setData({
        hidephone:true,
      });
    } 
    this.setData({
      options: options
    });
  },
  onShow() {
    this.resetStore()
  },
  /**
   * 重置store数据
   */
  resetStore: function () {
    store.dispatch({
      type: 'Reset_All_State'
    })
  },
  /**
   * 执行登录逻辑
   */
  doLogin: function () {
    new IMController({
      token: wx.getStorageSync('yunxin').token,
      account: wx.getStorageSync('yunxin').accid
    })
  },
  inputPhone: function (e) {
    this.setData({ 'phone': e.detail.value });
  },
  inputCode: function (e) {
    this.setData({ 'code': e.detail.value });
  },
  codeSuccess: function () {
    this.codedisable = true;
    var that = this;
    var i = 61;
    var timer = setInterval(function () {
      i -= 1;
      if (i < 1) {
        that.setData({ 'codename': '重新获取' });
        that.codedisable = false;
        clearInterval(timer);
      } else {
        that.setData({ 'codename': i + 's' });
      }
    }, 1000);
  },
  getCode: function (e) {
    if (this.codedisable) return false;
    var that = this;
    var data = {
      'city': appInstance.globalData.city,
      'phone': this.data.phone,
      'comefrom': 1,
      'type': 1
    };
    appInstance.getUtil.apiRequest('58ccb9b1df240', 'GET', data, function (res) {
      if (res.data.code == '1') {
        wx.showToast({
          title: '验证码已发送，请注意查收',
          icon: 'none',
          duration: 3000,
          success: function () {
            that.codeSuccess();
          }
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
      }
    }, 1, 1);
  },
  passportLogin: function () {
    if (!this.data.loginEnable) {
      return
    }

    var data = {
      'city': appInstance.globalData.city,
      'phone': this.data.phone,
      'code': this.data.code,
      'scene': this.data.scene
    };
    this.setData({ loginEnable: false })
    var that = this
    var openid = appInstance.getUtil.cacheGet('openid');
    if (openid) data.openid = openid;
    appInstance.getUtil.apiRequest('58cba5c50272c', 'GET', data, function (res) {
      that.setData({ loginEnable: true })
      if (res.data.code == '1') {
        var userinfo = {
          passport_phone: res.data.data.passport_phone,
          passport_uid: res.data.data.passport_uid,
          passport_username: res.data.data.passport_username,
          sso_token: res.data.data.sso_token,
          openid :res.data.data.openid
        }
        tracking({ uid: res.data.data.passport_uid, phont: res.data.data.passport_phone, from: that.data.options.sourcefrom });//埋点
        var cacheKey = appInstance.getUtil.getUserinfoKey();
        appInstance.getUtil.cachePut(cacheKey, userinfo);

        let esf_user_id = res.data.data.esf_user_id
        appInstance.getUtil.cachePut("changeUid", esf_user_id);

        that.getTfToken(esf_user_id);
        wx.setStorageSync('yunxin', res.data.data.YunXin);
        //下载配置文件
        appInstance.getUtil.ajax({
          path: '5cecf972d1f56?city=' + appInstance.globalData.city,
          method: "GET",
          data: { esf_user_id: esf_user_id },
          check: true,
          passport_uid: esf_user_id,
          success: res => {
            if (res.data.code == 1) {
              appInstance.getUtil.cachePut("initConfig", res.data.data.initConfig);
              wx.showToast({
                title: '登录成功',
                icon: 'none',
                duration: 3000,
                success: function () {
                  appInstance.getUtil.cacheRemove('gongyu_access_token')
                  if (that.data.options.hidephone == 1) {
                    wx.redirectTo({
                      url: '/pages/login/login?hidephone=1',
                    })
                  } else {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
              new IMController({
                token: wx.getStorageSync('yunxin').token,
                account: wx.getStorageSync('yunxin').accid
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 3000
              })

            }

          }, fail: error => {

          }
        })
      } else if (res.data.code == '-12') {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none',
          duration: 3000
        })
      } else if (res.data.code == '-11') {
        wx.showToast({
          title: '请输入正确的验证码',
          icon: 'none',
          duration: 3000
        })
      } else if (res.data.code == '-1') {
        wx.showToast({
          title: '验证码错误，请重新输入',
          icon: 'none',
          duration: 3000
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
      }
    }, 1, 1, function () {
      that.setData({ loginEnable: true })
    });
  },
  getWxCode(){
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.setStorageSync('code', res.code);
        }
      }
    });
  },
  getPhoneNumber: function (e) {
    let that = this;
    if (e.detail.errMsg) {

      var data = {
        'city': appInstance.globalData.city,
        'code': wx.getStorageSync('code'),
        'iv': e.detail.iv,
        'encryptedData': e.detail.encryptedData,
        'scene': that.data.scene
      };

      appInstance.getUtil.apiRequest('5aa1f93704a0f', 'POST', data, function (res) {
        if (res.data.code == '1') {
          var userinfo = {
            passport_phone: res.data.data.passport_phone,
            passport_uid: res.data.data.passport_uid,
            passport_username: res.data.data.passport_username,
            sso_token: res.data.data.sso_token,
            openid :res.data.data.openid
          }
          tracking({ uid: res.data.data.passport_uid, phont: res.data.data.passport_phone, from: that.data.options.sourcefrom });//埋点
          var cacheKey = appInstance.getUtil.getUserinfoKey();
          appInstance.getUtil.cachePut(cacheKey, userinfo);
          appInstance.getUtil.cacheRemove('gongyu_access_token')

          let esf_user_id = res.data.data.esf_user_id
          appInstance.getUtil.cachePut("changeUid", esf_user_id);

          that.getTfToken(esf_user_id)
          wx.setStorageSync('yunxin', res.data.data.YunXin);
          //下载配置文件
          appInstance.getUtil.ajax({
            path: '5cecf972d1f56?city=' + appInstance.globalData.city,
            method: "GET",
            check: true,
            data: { esf_user_id: esf_user_id },
            passport_uid: esf_user_id,
            success: res => {
              if (res.data.code == 1) {
                appInstance.getUtil.cachePut("initConfig", res.data.data.initConfig);
                if (that.data.options.hidephone == 1) {
                  wx.redirectTo({
                    url: '/pages/login/login?hidephone=1',
                  })
                } else {
                  wx.navigateBack({
                    delta: 1
                  })
                }
                new IMController({
                  token: wx.getStorageSync('yunxin').token,
                  account: wx.getStorageSync('yunxin').accid
                })
              } else {

                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 3000
                })

              }
            }, fail: error => {

            }
          })
        } else {
          wx.showToast({
            title: '请求失败，请重试',
            icon: 'none',
            duration: 3000
          })
        }
      }, 1, 1);

    }
  },
  getTfToken(id){//获取淘房用户令牌
    appInstance.getUtil.ajax({
      path: '5ea8e2a818634?city=' + appInstance.globalData.city,
      method: "GET",
      check: true,
      data: { user_id: id },
      success: res => {
        console.log(res)
        if (res.data.code==1){
          wx.setStorageSync('esf_auth_token', res.data.data.data.esf_auth_token);
        }
      }, 
      fail: error => {

      }
    })
  },
  getUserInfo(){
    wx.getUserInfo({
      success(res) {
        console.log(res)
        wx.setStorageSync('user_info', res);
        wx.navigateBack({
          delta: 1
        })
      },
      fail(res) {
        wx.setStorageSync('user_info', 'get userinfo err');
        wx.navigateBack({
          delta: 1
        })
      }
    })
  }
}
let mapStateToData = (state) => {
  return {
    isLogin: state.isLogin || store.getState().isLogin
  }
}
const mapDispatchToPage = (dispatch) => ({
  loginClick: function () {
    this.doLogin()
    return
  }
})
let connectedPageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(connectedPageConfig)