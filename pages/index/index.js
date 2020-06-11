//index.js
import {tracking} from '../../utils/burying-point.js'
import IMController from '../../controller/im.js'
var appInstance = getApp();
var that;
var historyKeyword = "&content="
Page({
  data: {
    animationData: {},
    priceUnitMap: {
      "1": "元/月",
      "2": "元/天*平方米"
    },
    rentHouseList: {}, //房东直租列表
    houseList: {}, //为你推荐列表
    city: '', //当前定位城市
    cityname: '', //当前定位城市
    searchHistory: [], //筛选配置历史
    adList: [], //广告页信息
    floatAdList: [],//浮动的广告信息
    c_id: '',  //365快租的公司id 
    left: '',//首页胶囊按钮左边距
    topTipsShow: false,//顶部添加小程序提示是否显示
    date: "",//当前日期
  },
  onShareAppMessage: function (res) {
    var title = '365淘房租房';
    var path = '/pages/index/index?city=' + appInstance.globalData.city;
    return appInstance.getShareReturn(title, path);
  },
  onLoad: function () {
    that = this;
    /*动画执行*/
    setInterval(function () {
      this.startAnimation();
    }.bind(this), 1000);
    
    /**埋点**/
    tracking({pageId:2425,eventType:1}); 

    /*检查进入IM系统*/ 
    this.connectIM();
  },
  onShow: function () {
    var that = this;
    if (!this.data.city || this.data.city != appInstance.globalData.city) {
      this.setData({
        city: appInstance.globalData.city,
        cityname: appInstance.globalData.cityname,
        selected: {},
        color: {},
        picker_index: '0'
      });
      appInstance.getConfig().then(function (config) {
        that.getHouse();
      });
    }

    /*
      记录搜索历史
    */
    that.recordHistory();
    that.getAdList();
    that.getCidConfig()

    /*
      获得右上角按钮信息
    */
    that.getMenuInfo();
  },
  getMenuInfo() {
    var info = wx.getMenuButtonBoundingClientRect();
    var left = info.left - 135;
    this.isShowTips(left);
  },
  isShowTips(left) {
    var topTipsShow = false;
    if (!wx.getStorageSync('notFirstOpenApp')) {
      topTipsShow = true;
      wx.setStorageSync('notFirstOpenApp', true);
    }
    this.setData({
      left: left + 'px',
      topTipsShow: topTipsShow
    });
  },
  startAnimation() {
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
    })
    animation.bottom('3rpx').step();
    animation.bottom('13rpx').step();
    this.setData({
      animationData: animation.export(),
      date: appInstance.getUtil.formatDate(Date.parse(new Date()), 'YY-MM-DD')
    })
  },
  /*
    查看历史记录中的房源
  */
  checkHouse(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.searchHistory[index]
    let url = item.url.replace(historyKeyword + item.desContent, "")
    wx.navigateTo({
      url: url,
    })
  },

  /*
    清空历史记录
  */
  clearHistory() {
    var that = this;
    appInstance.getUtil.clearHistory(appInstance.globalData.city);
    that.setData({
      searchHistory: []
    });
  },
  recordHistory() {
    var value = appInstance.getUtil.getHistory(appInstance.globalData.city);
    let arr = []
    for (var index in value) {
      let item = {}
      let url = value[index]
      item.url = url
      let keywordIndex = url.lastIndexOf(historyKeyword)
      if (keywordIndex != -1) {
        let startIndex = keywordIndex + historyKeyword.length
        item.desContent = url.slice(startIndex, url.length)
      }
      arr.push(item)
    }
    if (value) {
      this.setData({
        searchHistory: arr
      });
    }
  },
  getHouse: function () {
    var that = this;
    var data = {
      'city': appInstance.globalData.city
    };
    appInstance.getUtil.apiRequest('5aa75c753326b', 'GET', data, function (res) {
      if (res.data.code == '1') {
        var houseList = res.data.data;
        houseList.forEach(function (val, index, arr) {
          arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key, val.house_comefrom);
        });
        that.setData({
          houseList: res.data.data
        });
      }
    }, true);
  },

  getAdList() {
    // 固定广告
    // if (that.data.adList.length == 0) {
    appInstance.getUtil.getAdList(appInstance.globalData.city, false, function (list) {
      that.setData({
        adList: list
      });
    })
    // }
    //浮动广告
    // if (that.data.floatAdList.length == 0) {
    appInstance.getUtil.getAdList(appInstance.globalData.city, true, function (list) {
      that.setData({
        floatAdList: list
      });
    })
    // }
  },

  // 前往广告页
  goAdPage(e) {
    let url = e.currentTarget.dataset.url;
    let encodeUrl = encodeURIComponent(url);
    let webUrl = '/pages/web/web?url=' + encodeUrl + "&needDecode=true";
    wx.navigateTo({
      url: webUrl,
    })
  },

  getCidConfig() {
    that.setData({
      c_ids: '121,988,123,588,128,1126,1220,551,146,1139,1169,438,1217,1216,1215,1209,1208,1207,1206,1205,1204',

    })
  },

  showHint(title) {
    wx.hideToast()
    wx.showToast({
      title: title,
      icon: 'none',
    })
  },
  closeTips() {
    this.setData({
      topTipsShow: false
    });
  },

  connectIM(){
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey);
    let yunxin = wx.getStorageSync('yunxin');
    if (userInfo && !yunxin){
      wx.request({
        url: 'https://aznapi.house365.com/api/5ee08462d345e',
        data:{
          city:appInstance.globalData.city,
          uid:userInfo.passport_uid,
          phone:userInfo.passport_phone
        },
        header:{
          version:'v1.0'
        },
        success(res){
          if (res.data.code ==1){
            wx.setStorageSync('yunxin', res.data.data)
          }
          new IMController({
            token: wx.getStorageSync('yunxin').token,
            account: wx.getStorageSync('yunxin').accid
          })
        }
      })
    } else {
      new IMController({
        token: wx.getStorageSync('yunxin').token,
        account: wx.getStorageSync('yunxin').accid
      })
    }
  }
})