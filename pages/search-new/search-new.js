var appInstance = getApp();
var historySearchPrefix = "historyword_new_";
var isHousListEnter = false //是否是从房源列表搜索进入的
Page({
  /**
   * 页面的初始数据
   */
  data: {
    search_result_show: false, //是否显示模糊搜索内容 当前状态
    lists: {}, //模糊搜索内容数据
    inputvalue: '',
    showclearinput: false,
    hotkeywords: [],
    historyWord: [],
    isShowHistoryWord: true,
    keyword: '',
    show: {
      search: false,
      quyu: false,
      ditie: false,
      xiaoqu: false
    },
    floatAdList: [], //浮动的广告信息
  },

  //清空历史搜索内容
  enptyHistory: function() {
    var that = this;
    var cacheKey = historySearchPrefix + appInstance.globalData.city;
    appInstance.getUtil.cacheRemove(cacheKey);
    that.setData({
      historyWord: [],
      isShowHistoryWord: false
    })
  },
  //清空输入框内容
  clearinput: function() {
    this.setData({
      keyword: '',
      search_result_show: false,
      showclearinput: false
    })
  },
  search: function(keyword) {
    this.setData({
      search_result_show: true,
      keyword: keyword,
      showclearinput: true
    })
    var that = this;
    appInstance.getUtil.ajax({
      path: '5cecf92e39fdc',
      method: 'GET',
      check: true,
      accessToken: true,
      data: {
        'city': appInstance.globalData.city,
        'blockname': keyword,
        'tbl': 'rent'
      },
      success: res => {
        if (res.data.code == 1) {
          var temp = res.data.data;
          var lists = {
            quyu: [],
            ditie: [],
            xiaoqu: []
          }

          for (var i in temp) {
            lists.xiaoqu.push(temp[i])
          }

          that.setData({
            lists: lists
          })
        } else {
          // that.showHint(res.data.msg)
        }
      },
      fail: error => {
        that.showHint("网络异常")
      }
    })


  },

  //历史搜索
  hisSearchInput: function(e) {
    this.doQueryList(e.currentTarget.dataset.value)
  },

  //热门搜索
  hotSearchInput: function (e) {
    let item = this.data.hotkeywords[e.currentTarget.dataset.index]
    if (isHousListEnter) {
      var pages = getCurrentPages();
      var houseListPage = pages[pages.length - 2];
      houseListPage.loadPage({
        district: item.district,
        streetid: item.streetid
      })
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '/taofang-package/pages/house-list/house-list?district=' + item.district + "&streetid=" + item.streetid + "&excludeApartment=" + false,
      })
    }
  },

  //输入框搜索监听
  confirm_input: function(e) {
 
    var keyword = e.detail.value;
    if (keyword == '') {
      // this.setData({
      //   search_result_show: false,
      //   keyword: '',
      //   showclearinput: false
      // })
    } else {
      this.search(keyword);
    }


  },
  //输入框点击回车
  confimSearch: function(e) {
    console.log("2测试:" + e)
    var keyword = e.detail.value;
    if (keyword == '') {

    }else{
      this.cacheKeyword(e.detail.value);
      this.doQueryList(e.detail.value)
    }
  
  },

  cacheKeyword: function(keyword) {
    var cacheKey = historySearchPrefix + appInstance.globalData.city;
    var historyWord = appInstance.getUtil.cacheGet(cacheKey, []);

    if (historyWord.length <= 5) {
      historyWord.unshift(keyword);
    } else {
      historyWord.splice(5, 1)
      historyWord.unshift(keyword);
    }

    function dedupe(array) {
      return Array.from(new Set(array));
    }
    appInstance.getUtil.cachePut(cacheKey, dedupe(historyWord));
  },

  //跳转到列表页
  navigatorList: function(e) {
    var that = this;
    // var key = e.currentTarget.dataset.type;
    var id = e.currentTarget.dataset.id;
    var keyword = e.currentTarget.dataset.name;

    var cacheKey = historySearchPrefix + appInstance.globalData.city;
    this.cacheKeyword(keyword);
    this.doQueryList(keyword)

  },

  doQueryList(keyword) {
    if (isHousListEnter) {
      var pages = getCurrentPages();
      var houseListPage = pages[pages.length - 2];
      houseListPage.setData({
        ["fiterSubmitData.keyword"]: keyword,
        keyword: keyword,
        excludeApartment:true
      })
      setTimeout(function() {
        houseListPage.showList({
          isFirst: true
        });
        wx.navigateBack()
      }, 200)

    } else {
      wx.navigateTo({
        url: '/taofang-package/pages/house-list/house-list?keyword=' + keyword + "&excludeApartment=" + true,
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    isHousListEnter = options.isHousListEnter ? true : false
    var that = this;
  


    appInstance.getUtil.ajax({
      path: '5cf865ee6c6ac',
      method: 'GET',
      check: true,
      accessToken: true,
      data: {
        'city': appInstance.globalData.city
      },
      success: res => {
        if (res.data.code == 1) {
          that.setData({
            hotkeywords: res.data.data
          })
        } else {
          // that.showHint(res.data.msg)
        }
      },
      fail: error => {
        that.showHint("网络异常")
      }
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var cacheKey = historySearchPrefix + appInstance.globalData.city;
    var historyWord = appInstance.getUtil.cacheGet(cacheKey, []);
    var isShowHistoryWord = historyWord.length > 0 ? true : false;
    this.setData({
      historyWord: historyWord,
      isShowHistoryWord: isShowHistoryWord
    });
    //浮动广告
    // if (that.data.floatAdList.length == 0) {
      // appInstance.getUtil.getAdList(appInstance.globalData.city, true, function(list) {
      //   that.setData({
      //     floatAdList: list
      //   });
      // })
    // }
  },

  showHint(title) {
    wx.showToast({
      title: title,
      icon: 'none',
    })
  },

  // 前往广告页
  goAdPage(e) {
    let url = e.currentTarget.dataset.url;
    let encodeUrl = encodeURIComponent(url);
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeUrl + "&needDecode=true",
    })
  },
})