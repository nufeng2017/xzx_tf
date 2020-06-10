var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleSelected: 'unpaid',
    isShowAllpaids: false,
    hasWeilai: false,
    info: {},
    selectArr:{},
    all:'false',
    result:{total:0,money:0,bids:[]},
    ad:{},
    isIPX:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ isIPX: appInstance.globalData.isIPX})
    var ct_id = options.ct_id;
    var tab = options.tab;
    if(tab) this.setData({ titleSelected: tab});
    var data = { ct_id: ct_id };
    var selectArr = {}; 
    var nextMonth = appInstance.getUtil.getNextMonth(new Date(),1);
    appInstance.getUtil.gongyuAjax('getPaymentList', 'GET', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        info.title = info.lease_mode_ch + '|' + info.area + '·' + info.xiaoqu_name;
        info.rental = parseFloat(info.rental);
        info.housedetail = info.housedetail.replace(info.xiaoqu_name, '');
        if (info.roomname) {
          info.housedetail += '-' + info.roomname;
        }
        if (info.ct_status == '5'){
          info.sign_status_ch = info.ct_status_ch;
        }
        info.unpaid.forEach(function (val, index, arr) {
          arr[index]['now'] = true;
          val.detail.forEach(function (v, i, a) {
            if (a[i]['periodstart'] && a[i]['periodend']){
              var periodstart = parseInt(a[i]['periodstart'] + '000');
              var periodend = parseInt(a[i]['periodend'] + '000');
              a[i]['period_str'] = appInstance.getUtil.formatDate(periodstart, 'YY-MM-DD');
              a[i]['period_str'] += '至';
              a[i]['period_str'] += appInstance.getUtil.formatDate(periodend, 'YY-MM-DD');
            }
            a[i]['p_money'] = parseFloat(a[i]['p_money']);
            var p_date = parseInt(a[i]['p_date'] + '000');
            if (p_date > nextMonth) {
              arr[index]['now'] = false;
              a[i]['now'] = false;
              if (that.data.hasWeilai == false){
                that.setData({ hasWeilai: true});
              }
            }
            a[i]['p_date'] = appInstance.getUtil.formatDate(p_date, 'YY-MM-DD');
            a[i].selected = 'false';
          }); 
        });
        info.paid.forEach(function (val, index, arr) {
          val.detail.forEach(function (v, i, a) {
            if (a[i]['periodstart'] && a[i]['periodend']) {
              var periodstart = parseInt(a[i]['periodstart'] + '000');
              var periodend = parseInt(a[i]['periodend'] + '000');
              a[i]['period_str'] = appInstance.getUtil.formatDate(periodstart, 'YY-MM-DD');
              a[i]['period_str'] += '至';
              a[i]['period_str'] += appInstance.getUtil.formatDate(periodend, 'YY-MM-DD');
            }
            a[i]['p_money'] = parseFloat(a[i]['p_money']);
            var p_date = parseInt(a[i]['p_date'] + '000');
            a[i]['p_date'] = appInstance.getUtil.formatDate(p_date, 'YY-MM-DD');
          });
        });
        info.cancel.forEach(function (val, index, arr) {
          val.detail.forEach(function (v, i, a) {
            if (a[i]['periodstart'] && a[i]['periodend']) {
              var periodstart = parseInt(a[i]['periodstart'] + '000');
              var periodend = parseInt(a[i]['periodend'] + '000');
              a[i]['period_str'] = appInstance.getUtil.formatDate(periodstart, 'YY-MM-DD');
              a[i]['period_str'] += '至';
              a[i]['period_str'] += appInstance.getUtil.formatDate(periodend, 'YY-MM-DD');
            }
            a[i]['p_money'] = parseFloat(a[i]['p_money']);
            var p_date = parseInt(a[i]['p_date'] + '000');
            a[i]['p_date'] = appInstance.getUtil.formatDate(p_date, 'YY-MM-DD');
          });
        });   
        that.setData({ info: info, selectArr: selectArr });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },
  /**
   * tab切换
   */
  changeSelect: function (event) {
    var that = this;
    var index = event.currentTarget.dataset.index;
    var titleSelected = index;
    that.setData({
      titleSelected: titleSelected
    })
  },
  /**
   * 展示所有账单
   */
  showallpaids:function(){
    var that = this;
    var isShowAllpaids = that.data.isShowAllpaids;
    var info = that.data.info;
    if (isShowAllpaids == true){
      info.unpaid.forEach(function (val, index, arr) {
        val.detail.forEach(function (v, i, a) {
          if (!arr[index]['now']) a[i]['selected'] = 'false';
        });
      });
      that.setData({ info: info });
      isShowAllpaids = false;
    }else{
      isShowAllpaids = true;
    }
    that.setData({
      isShowAllpaids: isShowAllpaids
    })
    this.chooseMoney();
  },
  /**
   *
   */
  choosePaid:function (event) {
    var that = this;
    var bid = event.currentTarget.dataset.index;
    var selected = event.currentTarget.dataset.selected;

    var info = that.data.info;
    if (selected == 'false') {
      info.unpaid.forEach(function (val, index, arr) {
        val.detail.forEach(function (v, i, a) {
          if (a[i]['bid'] == bid) a[i]['selected'] = 'true';
        });
      });
    }
    if (selected == 'true') {
      info.unpaid.forEach(function (val, index, arr) {
        val.detail.forEach(function (v, i, a) {
          if (a[i]['bid'] == bid) a[i]['selected'] = 'false';
        });
      });
    }
    that.setData({ info: info });
    this.chooseMoney();
  },
  chooseAll: function (event){
    var that = this;
    var selected = event.currentTarget.dataset.selected;

    var info = that.data.info;
    var isShowAllpaids = that.data.isShowAllpaids;
    if (selected == 'false'){
      that.setData({ all: 'true' });
      info.unpaid.forEach(function (val, index, arr) {
        val.detail.forEach(function (v, i, a) {
          if (isShowAllpaids){
            a[i]['selected'] = 'true';
          }else{
            if (arr[index]['now']) a[i]['selected'] = 'true';
          }
        });
      });
    }
    if (selected == 'true') {
      that.setData({ all: 'false' });
      info.unpaid.forEach(function (val, index, arr) {
        val.detail.forEach(function (v, i, a) {
          if (isShowAllpaids) {
            a[i]['selected'] = 'false';
          } else {
            if (arr[index]['now']) a[i]['selected'] = 'false';
          }
        });
      });
    }
    that.setData({ info: info});
    this.chooseMoney();
  },
  chooseMoney:function(){
    var that = this;
    var total = 0;
    var money = 0;
    var bids = [];
    var info = that.data.info;



    var allcount = 0;
    var totalcount = 0;
    var isShowAllpaids = that.data.isShowAllpaids;

    info.unpaid.forEach(function (val, index, arr) {
      val.detail.forEach(function (v, i, a) {
        if (isShowAllpaids) {
          totalcount += 1;
        } else {
          if (arr[index]['now']) totalcount += 1;
        }
        if (a[i]['selected'] == 'true'){
          total += 1;
          money += parseFloat(a[i]['p_money']);
          bids.push(a[i]['bid']);
        }     
      });
    });

    if (total == totalcount) {
      that.setData({ all: 'true' });
    } else {
      that.setData({ all: 'false' });
    }

    var result = {};
    result.total = total;
    result.money = money;
    result.bids = bids;
    this.setData({ result: result});
  },
  confirmPay:function(){
    var that = this;
    var ct_id = this.data.info.ct_id;
    var bids = this.data.result.bids.join(',');
    var open_id = appInstance.getUtil.cacheGet('openid'); 
    var data = { ct_id: ct_id, bids: bids,open_id: open_id };
    appInstance.getUtil.gongyuAjax('confirm_pay', 'POST', data, function (res) {
      if (res.result == '1') {
        var info = res.data;
        wx.redirectTo({
          url: '/pages/payment/payMode/payMode' + '?m_id=' + info.m_id
        })
      }
    });    
  }
})