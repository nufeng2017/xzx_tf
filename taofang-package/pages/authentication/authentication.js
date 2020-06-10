var appInstance = getApp();
var that;
let phone = "" //真实手机号码
Page({
  data:{
    "headImg": "/img/default-avatar.png",
    "phoneForShow":"", //用于UI显示  ps:"175****6836"
  
    isBankOk:false   //银行卡号认证成功
  },

  onLoad(option){
    that = this
  },

  onShow(){
    let data = {
      'city': appInstance.globalData.city
    };
    appInstance.getUtil.apiRequest('58d46faac03b6', 'GET', data, function (res) {
      let avatar = res.data.data.avatar || that.data.headImg;
      if (res.data.code == '1') {
        phone = res.data.data.phone.toString()
        that.setData({
          "headImg": avatar,
          "phoneForShow": phone.slice(0, 3)+"****"+ phone.slice(7, 11)
        })
      }
    });
    appInstance.getUtil.checkAuthentication(appInstance.globalData.city, function (result) {
      that.setData({
        isBankOk: result.bank
      })

    })

  }
});