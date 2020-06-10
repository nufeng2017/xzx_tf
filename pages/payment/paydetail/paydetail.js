var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ct_id:0,
    info:{},
    hasHistory:false,
    history:[],
    more:false,
    ad: {},
    isIPX: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ isIPX: appInstance.globalData.isIPX })
    var ct_id = options.ct_id;
    that.setData({ct_id:ct_id});
    var data = { ct_id: ct_id};
    appInstance.getUtil.gongyuAjax('getLease_info', 'GET', data, function (res) {
      if (res.result == '1') {
          var info = res.data;
          var periodstart = parseInt(info.periodstart + '000');
          var periodend = parseInt(info.periodend + '000');
          info.periodstart = appInstance.getUtil.formatDate(periodstart, 'YY.MM.DD');
          info.periodend = appInstance.getUtil.formatDate(periodend, 'YY.MM.DD');
          if (info.next_pay_date > 0) {
            var next_pay_date = parseInt(info.next_pay_date + '000');
            info.next_pay_date = appInstance.getUtil.formatDate(next_pay_date, 'YY-MM-DD');
          }
          var add_time = parseInt(info.add_time + '000');
          info.add_time = appInstance.getUtil.formatDate(add_time, 'YY-MM-DD hh:mm:ss'); 
          info.rental = parseFloat(info.rental);
          info.deposit = parseFloat(info.deposit);
          info.images = appInstance.getUtil.imgSrc(info.images);
          info.title = info.lease_mode_ch + '|' + info.area + '·' + info.xiaoqu_name;
          info.roomstr = info.room > 0 ? info.room + '室' : '';
          info.roomstr += info.hall > 0 ? info.hall + '厅' : '';
          info.acreage = Math.round(info.acreage);
          info.housedetail = info.housedetail.replace(info.xiaoqu_name,'');
          if (info.roomname){
            info.housedetail += '-' + info.roomname;
          }

          info.deposit_other.forEach(function (val, index, arr) {
            arr[index]['money'] = parseFloat(val.money);
          });
          info.other_fee.forEach(function (val, index, arr) {
            arr[index]['money'] = parseFloat(val.money);
          });
        info.contractimgsArr = info.contractimgs ? info.contractimgs.split(',') : [];
        if (info.ct_status == 5){
            info.sign_status_ch = info.ct_status_ch;
        }
        var history = [];
        if(info.history.length > 0){
          history = info.history;
          history.forEach(function (val, index, arr) {
            var periodstart = parseInt(val['periodstart'] + '000');
            var periodend = parseInt(val['periodend'] + '000');
            arr[index]['periodstart'] = appInstance.getUtil.formatDate(periodstart, 'YY.MM.DD');
            arr[index]['periodend'] = appInstance.getUtil.formatDate(periodend, 'YY.MM.DD');
            arr[index]['rental'] = parseFloat(val['rental']);
            arr[index]['deposit'] = parseFloat(val['deposit']);

            arr[index].deposit_other.forEach(function (v, i, a) {
              a[i]['money'] = parseFloat(v.money);
            });
            arr[index].other_fee.forEach(function (v, i, a) {
              a[i]['money'] = parseFloat(v.money);
            });

            arr[index].show = false;
            if (index == 0) arr[index].show = true;
          });
          that.setData({ history: history });
          if (history.length > 1){
            that.setData({ hasHistory: true });
          }            
        }

        //推房信息
        info.return_money = parseFloat(info.return_money);
        var stop_time = parseInt(info.stop_time + '000');
        info.stop_time = appInstance.getUtil.formatDate(stop_time, 'YY.MM.DD');
        console.log(info);
        that.setData({ info: info });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },
  call: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.info.manager_phone,
      success: function () {
      }
    })
  },
  pdf:function(){
    var that = this;
    var url = that.data.info.sign_pdf;
    url = url.replace("http:", "https:");
    wx.downloadFile({
      url: url,
      success: function (res) {
        var filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  },
  hetong:function () {
    var that = this;
    var ct_id = that.data.info.ct_id;
    wx.navigateTo({
      url: '/pages/payment/hetong/hetong?ct_id='+ct_id
    })
  },
  pay:function(){
    var that = this;
    var ct_id = that.data.info.ct_id;
    wx.redirectTo({
      url: '/pages/payment/pay/pay?ct_id=' + ct_id
    })    
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.info.contractimgsArr
    })
  },
  showhistory:function(){
    this.setData({ more: true });
  }
})