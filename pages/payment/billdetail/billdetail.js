var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bid:0,
    info:{},
    ad: {},
    isIPX: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this; 
    that.setData({ isIPX: appInstance.globalData.isIPX })
    var bid = options.bid;
    var data = { bid: bid };
    appInstance.getUtil.gongyuAjax('getPay_info', 'GET', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        var p_date = parseInt(info.p_date + '000');
        info.p_date = appInstance.getUtil.formatDate(p_date, 'YY-MM-DD');
        if (info.periodstart && info.periodend) {
          var periodstart = parseInt(info.periodstart + '000');
          var periodend = parseInt(info.periodend + '000');
          info.period_str = appInstance.getUtil.formatDate(periodstart, 'YY-MM-DD');
          info.period_str += '至';
          info.period_str += appInstance.getUtil.formatDate(periodend, 'YY-MM-DD');
        }
        var add_time = parseInt(info.add_time + '000');
        info.add_time = appInstance.getUtil.formatDate(add_time, 'YY-MM-DD hh:mm:ss');
        if (info.pay_status == 1){
          var pay_real_date = parseInt(info.pay_real_date + '000');
          info.pay_real_date = appInstance.getUtil.formatDate(pay_real_date, 'YY-MM-DD hh:mm:ss');
          info.p_money = info.pay_real_money;
        }
        info.p_money = parseFloat(info.p_money);
        that.setData({ info: info });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },
  confirmPay: function () {
    var that = this;
    var ct_id = this.data.info.ct_id;
    var bids = this.data.info.bid;
    var open_id = appInstance.getUtil.cacheGet('openid');
    var data = { ct_id: ct_id, bids: bids, open_id: open_id };
    appInstance.getUtil.gongyuAjax('confirm_pay', 'POST', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        wx.redirectTo({
          url: '/pages/payment/payMode/payMode' + '?m_id=' + info.m_id
        })
      }
    });
  },
  call: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.info.manager_phone,
      success: function () {
      }
    })
  }
})