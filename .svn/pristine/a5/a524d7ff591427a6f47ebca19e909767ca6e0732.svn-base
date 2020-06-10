var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasShowallThings:false,
    isShowallThings:false,
    info:{},
    ad: {},
    isIPX: '',
    error:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ isIPX: appInstance.globalData.isIPX })
    var m_id = options.m_id;
    var data = {};
    data.m_id = m_id;
    appInstance.getUtil.gongyuAjax('getConfirm_info', 'POST', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        var money = 0;
        info.title = info.lease_mode + '|' + info.area + '·' + info.xiaoqu_name;
        info.detail.forEach(function (val, index, arr) {
          var p_period_start = parseInt(arr[index]['p_period_start'] + '000');
          arr[index]['p_period_start'] = appInstance.getUtil.formatDate(p_period_start,'YY-MM-DD');
          var p_period_end = parseInt(arr[index]['p_period_end'] + '000');
          arr[index]['p_period_end'] = appInstance.getUtil.formatDate(p_period_end, 'YY-MM-DD');
          arr[index]['p_money'] = parseFloat(arr[index]['p_money']);
          money += parseFloat(arr[index]['p_money']);
        });
        info.money = money;
        info.m_id = m_id;
        that.setData({info:info});
        if (info.detail.length > 3) that.setData({ hasShowallThings: true });
      }else{

        that.setData({ error: res.msg });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },
  /**
   * 展开显示更多
   */
  showMore:function(params) {
    var that= this;
      if (that.data.isShowallThings == true){
        that.setData({ isShowallThings:false})
      }else{
        that.setData({ isShowallThings: true })
      }
  },
  pay:function(){
    var that = this;
    var m_id = this.data.info.m_id;
    var ct_id = this.data.info.ct_id;
    var data = {};
    data.m_id = m_id;
    appInstance.getUtil.gongyuAjax('payOrder', 'POST', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        var pay_info = JSON.parse(info.pay_info);
        wx.requestPayment({
          'timeStamp': pay_info.timeStamp,
          'nonceStr': pay_info.nonceStr,
          'package': pay_info.package,
          'signType': pay_info.signType,
          'paySign': pay_info.paySign,
          'success': function (res) {            
            console.log(res);
            wx.redirectTo({
              url: '/pages/payment/pay/pay?ct_id=' + ct_id + '&tab=paid'
            })
          },
          'fail': function (res) {
            console.log(res);
            wx.redirectTo({
              url: '/pages/payment/pay/pay?ct_id=' + ct_id + '&tab=unpaid'
            })
          }
        })
      }else{
        wx.showToast({
          title: that.data.error,
          icon: 'none',
          duration: 2000
        })
      }
    }); 
  }
})