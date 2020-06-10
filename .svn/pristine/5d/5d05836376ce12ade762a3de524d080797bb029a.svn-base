var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ct_id:0,
    info:{},
    popup: { temp:'null',data:{}},
    agree: 'false',
    isIPX: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this; 
    that.setData({ isIPX: appInstance.globalData.isIPX })
    var ct_id = options.ct_id;
    this.setData({ ct_id: ct_id });
    var data = { ct_id: ct_id };
    appInstance.getUtil.gongyuAjax('getLease_info', 'GET', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        var periodstart = parseInt(info.periodstart + '000');
        var periodend = parseInt(info.periodend + '000');
        info.periodstart = appInstance.getUtil.formatDate(periodstart, 'YY.MM.DD');
        info.periodend = appInstance.getUtil.formatDate(periodend, 'YY.MM.DD');
        var next_pay_date = parseInt(info.next_pay_date + '000');
        info.next_pay_date = appInstance.getUtil.formatDate(next_pay_date, 'YY-MM-DD');
        var add_time = parseInt(info.add_time + '000');
        info.add_time = appInstance.getUtil.formatDate(add_time, 'YY-MM-DD hh:mm:ss');
        info.rental = parseFloat(info.rental);
        info.deposit = parseFloat(info.deposit);
        info.images = appInstance.getUtil.imgSrc(info.images);
        info.title = info.lease_mode_ch + '|' + info.xiaoqu_name;
        info.roomstr = info.room > 0 ? info.room + '室' : '';
        info.roomstr = info.hall > 0 ? info.hall + '厅' : '';
        info.acreage = Math.round(info.acreage);

        info.other_fee.forEach(function (val, index, arr) {
          arr[index]['money'] = parseFloat(val.money);
        });
        info.deposit_other.forEach(function (val, index, arr) {
          arr[index]['money'] = parseFloat(val.money);
        });
        info.contractimgsArr = info.contractimgs ? info.contractimgs.split(',') : [];
        info.sign_img_arr = info.sign_img.split(',');
        console.log(info);
        that.setData({ info: info });
      }
    });
  },
  previewImage: function (e) {
    var that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: that.data.info.sign_img_arr // 需要预览的图片http链接列表
    })
  },
  radioChange:function(event){
    var agree = event.detail.value;
    this.setData({ agree:agree});
  },
  signContract:function(){
    var that = this;
    var info = that.data.info;
    var popup = {};
    var agree = that.data.agree;
    if (agree == 'false'){
      wx.showToast({
        title: '请勾选同意协议',
        icon: 'none',
        duration: 2000
      })
    }else{
      popup.temp = 'signContract';
      popup.data = info;
      that.setData({ popup: popup });   
    }   
  },
  sign:function(){
    var that = this;
    var ct_id = this.data.ct_id;
    var t_id = this.data.info.t_id;
    var data = { ct_id: ct_id,t_id:t_id };
    console.log(data);
    appInstance.getUtil.gongyuAjax('sign_lease', 'GET', data, function (res) {
      if (res.result == '1'){
        //签约成功
        var popup = {};
        popup.temp = 'seePaids';
        popup.data = { ct_id: ct_id};
        that.setData({ popup: popup });        
      }else{
        //签约失败
        var popup = {};
        popup.temp = 'call_guanjia';
        popup.data = {};
        that.setData({ popup: popup});
      }
    });
  },
  callGuanjia:function(){
    var that = this;
    var manager_phone = this.data.info.manager_phone;
    var popup = {};
    popup.temp = 'call';
    popup.data = { phone: manager_phone};
    that.setData({ popup: popup });
  },
  call:function(){
    var that = this;
    var manager_phone = this.data.info.manager_phone;
    this.cancel();
    wx.makePhoneCall({
      phoneNumber: manager_phone,
      success: function () {
      }
    })
  },
  cancel:function(){
    var that = this;
    var popup = {};
    popup.temp = 'null';
    popup.data = {};
    that.setData({ popup: popup });
  }
})