// pages/detailpages/detailpages.js
import {tracking} from '../../../utils/burying-point.js'
var appInstance = getApp();
var obj = {};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    markers: [{
      iconPath: "/img/position-market.png",
      id: 0,
      latitude: 0,
      longitude: 0,
      width: 25,
      height: 34,
    }],
    imgUrls: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    imgsNum: 0,//轮播图总量
    current: 1,//当前页
    isShowHouseDescription: true,//是否展示房源描述
    isShowAllHouselist: false,//是否展示在租房型
    isShowArrow: true,//是否展示箭头
    isShowRule: false,//是否展示优惠券规则
    isShowCoupon: false,//是否展示优惠券
    houseInfo: {},//房源信息
    card_index: 0,//优惠券下标
    card_start: 0,//有效期开始时间
    card_end: 0,//有效期结束时间
    house_comefrom: '',//房源（个人2，公寓1）
    orientation: [],//朝向
    loadOver: false,
    options: {},
    is_show_index: false,
    ad: {},
    isIPX: '',
    acode: false,
    phone: 0,
    otherPhoneNum: 0,
    isShowPhonePopup: false//是否显示电话弹窗
  },
  swiperChange: function (e) {
    this.setData({ current: e.detail.current + 1 });
  },
  onShareAppMessage: function (res) {
    var title = this.data.houseInfo.company.companyid + this.data.houseInfo.name;
    var path = '/pages/apartment/detailPages/detailPages?a_id=' + this.data.houseInfo.id + '&house_comefrom=1' + '&city=' + appInstance.globalData.city;
    return appInstance.getShareReturn(title, path);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ isIPX: appInstance.globalData.isIPX });
    this.setData({ options: options });
    this.loadData(options);//加载数据 
    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // });

  },
  onShow: function () {
    var current = getCurrentPages();
    if (current.length == 1) this.setData({ is_show_index: true });
  },
  onReady: function () {
    var that = this;
  },
  loadData: function (options) {//加载数据
    var that = this;
    options.city = appInstance.globalData.city;
    obj = options;
    this.setData({ house_comefrom: options.house_comefrom });

    appInstance.getUtil.apiRequest('5c00fe9844077', 'GET', options, function (res) {
      if (res.data.code == 1) {
        that.resetTime(res.data.data);//更新时间
        that.map(res.data.data);//注入地图信息
        res.data.data.city = appInstance.globalData.city;
        that.setData({ houseInfo: res.data.data }, function () {
          that.getViewInfo();
          
          //**埋点 */ 
          tracking({pageId:2424,eventType:1},{id:res.data.data.id});
        });
      } 
    }, 1);
  },
  getViewInfo: function () {
    var that = this;
    wx.createSelectorQuery().select('#view').boundingClientRect(function (rect) {
      rect.height  // 节点的高度
      if (rect.height <= 45) {
        that.setData({ isShowArrow: false });
      } else {
        that.setData({ isShowHouseDescription: false });
      }
    }).exec()
  },
  showIcon: function (arr, data) {//可以展示的标签
    var a = [];
    var obj = {};
    obj.key = 0;
    if (data.house_comefrom == 1) {
      obj.value = '公寓';
    } else if (data.house_comefrom == 2) {
      obj.value = '个人好房';
    }
    a.push(obj);
    if (data.c_business == '爱租月付') {
      var o = {};
      o.key = 999;
      o.value = '爱租月付';
      a.push(o);
    }
    if (arr) {
      a = a.concat(arr);
    }
    return data.house_comefrom == 1 ? a.slice(0, 4) : a.slice(0, 1);
  },
  map: function (data) {//地图信息
    var that = this;
    this.data.markers[0].latitude = data.lat;
    this.data.markers[0].longitude = data.lng;
    this.setData({ markers: this.data.markers });
  },
  checkData: function (data, info) {//查找数据
    if (data) {
      var arr = [];
      for (var i = 0; i < info.length; i++) {
        if (data.indexOf(info[i].key.toString()) > -1) {
          arr.push(info[i]);
        }
      }
    }
    return arr;
  },
  resetTime: function (data) {//更新时间
    if (data.edit_time) {
      var oldTime = data.edit_time * 1000;
      var now = +new Date();
      var eTime = now - oldTime;
      var y = 365 * 24 * 60 * 60 * 1000;
      var m = 30 * 24 * 60 * 60 * 1000;
      var d = 24 * 60 * 60 * 1000;
      var h = 60 * 60 * 1000;
      var mi = 60 * 1000;
      if (eTime > y) {
        var time = parseInt(eTime / y) + '年前更新';
      } else if (eTime > m) {
        var time = parseInt(eTime / m) + '月前更新';
      } else if (eTime > d) {
        var time = parseInt(eTime / d) + '天前更新';
      } else if (eTime > h) {
        var time = parseInt(eTime / h) + '小时前更新';
      } else if (eTime > mi) {
        var theT = parseInt(eTime / mi);
        if (theT == 0) {
          theT = 1;
        }
        var time = theT + '分钟前更新';
      }
      data.edit_time = time;
    }
  },
  keep: function (event) {//收藏事件函数
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      obj.collect_status = this.data.houseInfo.hasCollected;//0 收藏 1取消收藏
      this.data.houseInfo.hasCollected = this.data.houseInfo.hasCollected ? 0 : 1;//0未收藏 1已收藏
      obj.house_comefrom = this.data.houseInfo.house_comefrom;
      var that = this;
      appInstance.getUtil.apiRequest('58d271498fa6d', 'POST', obj, function (res) {
        if (res.data.code == 1) {
          that.setData({ houseInfo: that.data.houseInfo });
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }, 1);
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  showAll: function (event) {//展示所有文字
    if (this.data.isShowHouseDescription) {
      this.setData({ isShowHouseDescription: false });
    } else {
      this.setData({ isShowHouseDescription: true });
    }
  },
  showAllhouse: function (event) {//查看更多房型
    if (this.data.isShowAllHouselist) {
      this.setData({ isShowAllHouselist: false });
    } else {
      this.setData({ isShowAllHouselist: true });
    }
  },
  checkLgImg: function (event) {//查看大图
    var current = event.target.dataset.url || 0;
    var urls = this.data.houseInfo.public_area_imgs;
    var images = [];
    for (var i = 0; i < urls.length; i++) {
      images.push(urls[i].image)
    }
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: images // 需要预览的图片http链接列表
    })
  },
  position: function (event) {//查看位置
    this.data.markers[0].adr = this.data.houseInfo.xdistrict_name + this.data.houseInfo.xstreet_name + this.data.houseInfo.xaddress;
    wx.setStorageSync('markers', this.data.markers);
    wx.navigateTo({
      url: '/pages/detailPages/position/position',
    });
  },
  report: function () {//转跳到举报页面
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      var obj = {};
      obj.city = this.data.houseInfo.city;
      obj.phone = data.passport_phone;
      obj.h_id = this.data.houseInfo.h_id;
      obj.r_id = this.data.houseInfo.r_id;
      obj.passport_username = data.passport_username;
      obj.passport_uid = data.passport_uid;
      obj.from = appInstance.globalData.from;
      obj.house_comefrom = this.data.houseInfo.house_comefrom;
      wx.setStorageSync('report', obj);
      wx.navigateTo({
        url: 'report/report'
      });
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  viewHouse: function (event) {//预约看房
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      wx.setStorageSync('houseInfo', this.data.houseInfo);
      wx.navigateTo({
        url: 'viewHouse/viewHouse'
      });
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  isShowRule: function () {//展示优惠券规则
    this.setData({ isShowRule: !this.data.isShowRule });
  },
  close: function (event) {//关闭优惠券弹窗
    this.setData({ isShowCoupon: !this.data.isShowCoupon });
    if (this.data.isShowCoupon) {
      this.setData({ card_index: event.currentTarget.dataset.index });
      this.resetTimeStyle(this.data.houseInfo.cardList[event.currentTarget.dataset.index]);
    }
  },
  resetTimeStyle: function (data) {//重置时间格式
    this.setData({ card_start: this.resetTimer(parseInt(data.card_keyStart)) });
    this.setData({ card_end: this.resetTimer(parseInt(data.card_keyEnd)) });
  },
  resetTimer: function (t) {
    t *= 1000;
    var sy = new Date(t).getFullYear();
    var sm = new Date(t).getMonth() + 1;
    var sd = new Date(t).getDate();
    return sy + '-' + sm + '-' + sd;
  },
  getCard: function () {//领取优惠券
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      var that = this;
      var obj = {};
      obj.city = this.data.houseInfo.city;
      obj.card_id = this.data.houseInfo.cardList[this.data.card_index].card_id;
      obj.c_id = this.data.houseInfo.c_id;
      obj.cdkey_from = appInstance.globalData.from;
      appInstance.getUtil.apiRequest('58d272361fb78', 'POST', obj, function (res) {
        if (res.data.code == 1) {
          that.data.houseInfo.cardList[that.data.card_index].hasActived = 1;
          that.setData({ houseInfo: that.data.houseInfo });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })

        }
      }, 1);
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  checkHouse: function (event) {//房间信息查看未出租的房间
    wx.redirectTo({
      url: '/pages/detailPages/detailPages?'
      + event.currentTarget.dataset.key + '=' + event.currentTarget.dataset.id + '&h_id=' + obj.h_id + '&city='
      + obj.city + '&house_comefrom=' + this.data.houseInfo.house_comefrom
    });
  },
  closeImg: function (event) {//关闭爱租月付图片
    this.setData({ isShowPay: false });
  },
  checkmore: function () {//查看更多房源
    wx.redirectTo({
      url: '/pages/list/list?fromdetail=1&xiaoqu_id=' + this.data.houseInfo.xiaoqu_id + '&xname=' + this.data.houseInfo.xname
    });
  },
  checkMoreHouse: function () {//查看更多品牌房源
    wx.redirectTo({
      url: '/pages/apartment/apartment_list/apartment_list?c_id=' + this.data.houseInfo.company.cid + '&companyid=' +      this.data.houseInfo.company.companyid
    });
  },
  call: function () {//拨打房东电话
    var that = this;
    wx.getSystemInfo({
      success(res) {
        if (res.system.indexOf('Android') > -1){
          that.resetPhoneNum();
        } else {
          that.ringUp();
        }
      }
    })

    //**埋点 */ 
    tracking({pageId:2424,eventType:6},{id:this.data.houseInfo.id});
    
  },
  ringUp:function(){
    var that = this;
    if (this.data.houseInfo.house_comefrom == 2){      
      var cacheKey = appInstance.getUtil.getUserinfoKey();
      var data = appInstance.getUtil.cacheGet(cacheKey);
      if (data) {
        wx.makePhoneCall({
          phoneNumber: this.data.houseInfo.telephone,
          success:function(){
            var data = { 'city': that.data.houseInfo.city};
            appInstance.getUtil.apiRequest('5acd72105bef3', 'POST', data, function (res) { }, 1);
          }
        })
      } else {
        wx.navigateTo({
          url: '../login/login'
        });
      }
    } else {
      wx.makePhoneCall({
        phoneNumber: this.data.houseInfo.telephone,
        success: function () {
          var data = { 'city': that.data.houseInfo.city };
          data.phone_400 = that.data.houseInfo.phone;
          data.house_id = that.data.houseInfo.h_id;
          data.room_id = that.data.houseInfo.r_id;
          data.house_comefrom = that.data.houseInfo.house_comefrom;
          data.sem_referer = 'aznwx';
          data.sem_keyword = 'aznwx';
          appInstance.getUtil.apiRequest('5a7d37f752d28', 'POST', data, function (res) { }, 1);          
        }
      })
    }
    this.setData({ isShowPhonePopup: false });
  },
  phonePopupNone: function () {
    this.setData({ isShowPhonePopup: false });
  },
  resetPhoneNum: function () {
    var phone1 = this.data.houseInfo.telephone.match(/^\d+/i)[0];
    phone1 = this.resetNum(phone1);
    var phone2 = this.data.houseInfo.telephone.match(/\d+$/i)[0];
    this.setData({ phone: phone1, otherPhoneNum: phone2, isShowPhonePopup: true });
  },
  resetNum: function (e) {
    var index = 0;
    var step = 3;
    var str = '';
    for (var i = 0; i < 2; i ++) {
      str += e.slice(index, index + step) + ' ';
      index += step;
    }
    return str + e.slice(index);
  },
  loadOver: function () {//加载结束
    this.setData({ loadOver: true });
  },
  mPay: function () {//转跳至爱租月付介绍页
    wx.navigateTo({
      url: 'm_pay/m_pay'
    });
  }
})