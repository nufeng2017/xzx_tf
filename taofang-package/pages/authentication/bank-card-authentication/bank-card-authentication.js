var appInstance = getApp();
var that;
Page({
  data: {
    phone: "",
    codedisable:false,
    codename: '获取验证码'
  },

  onLoad(){
      that = this
  },

  inputPhoneChange(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  formSubmit: function (e) {
    // 银行卡号
    let cardNo = e.detail.value.cardNo
    // 持卡人姓名
    let name = e.detail.value.name
    //持卡人身份证号
    let certNo = e.detail.value.certNo
    // 银行预留手机号
    let phoneNo = e.detail.value.phoneNo
    //手机验证码
    let code = e.detail.value.code
    //是否同意协议
    let isAgree = e.detail.value.checkAgree.length == 1?true:false
    if (!cardNo){
      this.showHint("请输入银行卡号")
      return
    }else if (!name) {
      this.showHint("请输入持卡人姓名")
      return
    } else if (!certNo) {
      this.showHint("请输入持卡人身份证号")
      return
    } else if (!phoneNo) {
      this.showHint("请输入银行预留手机号")
      return
    } else if (!code) {
      this.showHint("请输入手机验证码")
      return
    } else if (!isAgree) {
      this.showHint("请阅读365淘房认证服务协议并勾选我已阅读")
      return
    }
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey)
    appInstance.getUtil.ajax({
      path: '5cf5c254cfd2c',
      method: 'POST',
      check: true,
      accessToken: true,
      passport_uid: userInfo.passport_uid,
      data: {
        cardNo: cardNo,
        certNo: certNo,
        name: name,
        phoneNo: phoneNo,
        user_phone: userInfo.passport_phone,
        code: code,
        city: appInstance.globalData.city
      },
      success: res => {

        if (res.data.code == 1) {
          that.showHint("认证成功")
          wx.navigateBack({
            detail:1
          })
        } else {
          that.showHint(res.data.msg)
        }
      },
      fail: error => {
        that.showHint("网络异常")
      }
    })
  },

  codeSuccess: function () {
    this.codedisable = true;
    var that = this;
    var i = 61;
    var timer = setInterval(function () {
      i -= 1;
      if (i < 1) {
        that.setData({ codename: '获取验证码' });
        that.codedisable = false;
        clearInterval(timer);
      } else {
        that.setData({ codename: i + 's' });
      }
    }, 1000);
  },  

  getCode() {
    if (this.codedisable) return false;
    if (!this.data.phone){
      this.showHint("手机号不能为空")
      return false
    }
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey)
    appInstance.getUtil.ajax({
      path: '5cf4f588114a7',
      method: 'POST',
      check: true,
      accessToken: true,
      passport_uid: userInfo.passport_uid,
      data: {
        phone: this.data.phone,
        secret: appInstance.getUtil.md5.hexMD5("azntp" + this.data.phone),
        city: appInstance.globalData.city
      },
      success: res => {
      
        if (res.data.code == 1) {
          // 验证码发送成功
          wx.showToast({
            title: '验证码已发送，请注意查收',
            icon: 'none',
            duration: 3000,
            success: function () {
              that.codeSuccess();
            }
          })
        }else{
          that.showHint(res.data.msg)
        }
      },
      fail: error => {
        that.showHint("网络异常")
      }
    })
  },


  showHint(title){
    wx.showToast({
      title: title,
      icon:'none'
    })
  }
});