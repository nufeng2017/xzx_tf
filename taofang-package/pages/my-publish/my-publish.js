import {tracking} from '../../../utils/burying-point.js'
var appInstance = getApp();
var that;
var initPage = 1;
var page = initPage;
var pagesize = 20;
var enableLoadMore = true;
var houseTypeMap = {};
var authentication = false;
var pageIndex = 1;
var isLoad = false;
Page({
  data: {
    priceUnitMap: [],
    isAuthentication: true, //是否实名认证
    publishList: [], //我的发布列表
    backControl: false,
    dataRequested: false,
    tabIndex: 0,
    rentList:[],//求租列表
    showPublishBtn:false,
    ss_title:[],
    street_title:[],
  },
  onLoad(options) {
    that = this;
    houseTypeMap = appInstance.getUtil.cacheGet("initConfig").house_type_map
    this.setData({
      priceUnitMap: appInstance.getUtil.cacheGet("initConfig").price_unit_map,
      tabIndex: options.tabIndex ? parseInt(options.tabIndex):0
    })
    this.getPublishRecord(true);
    this.getRentList(pageIndex=1);//获取求租列表

      
    //**埋点 */ 
    tracking({pageId:2420,eventType:1});
  },

  onShow() {
    appInstance.getUtil.checkAuthentication(appInstance.globalData.city, function (result) {
      that.setData({
        isAuthentication: result.auth
      })
    })
  },

  //上滑加载下一页列表数据
  onReachBottom: function () {
    if (this.data.tabIndex === 0){
      this.getPublishRecord(false);
    } else { 
      this.getRentList();
    }
  },

  // 获取我的发布列表
  getPublishRecord(isRefresh) {
    if (isRefresh) {
      that.setData({
        dataRequested: false,
        publishList: []
      })
      page = initPage;
      enableLoadMore = true
    } else {
      if (!enableLoadMore) {
        this.showHint("暂无更多数据")
        return
      }
      page++;
    }
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey)
    appInstance.getUtil.ajax({
      path: '5cef7067240f8',
      method: 'GET',
      check: true,
      accessToken: true,
      data: {
        city: appInstance.globalData.city,
        telno: userInfo.passport_phone,
        page: page,
        page_size: pagesize
      },
      success: res => {
        console.log(res)
        if (res.data.code == 1) {
          if (res.data.data.length != 0) {
            let arr = that.data.publishList.concat(res.data.data)
            that.setData({
              publishList: arr
            })
            if (res.data.data.length < pagesize) {
              // 已经全部加载完
              enableLoadMore = false
            }
          } else {
            // 已经全部加载完
            enableLoadMore = false
          }
          if (!that.data.dataRequested) {
            that.setData({
              dataRequested: true
            })
          }
        } else {
          that.showHint(res.data.msg)
        }
      },
      fail: error => {
        that.showHint("网络异常")
      }
    })
  },

  showHint(title) {
    wx.showToast({
      title: title,
      icon: 'none',
    })
  },


  itemClick(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index]
    if (item.status == 1) {
      //     已发布
      // todo  详情页跳转
      wx.navigateTo({
        url: '/taofang-package/pages/details-page/details-page?id=' + item.id,
      })
    } else if (item.status == 0) {
      //     审核中
      this.showHint("房源审核中暂时无法查看房源详情")
    } else if (item.status == 2) {
      //     审核中
      this.showHint("房源已失效暂时无法查看房源详情")
    } else if (item.status == 3) {
      //     未通过
      this.showHint("房源审核未通过暂时无法查看房源详情")
    }
  },

  itemRefresh(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index]
    if (item.status == 0) {
      //     审核中
      this.showHint("房源审核中，无法刷新")
    } else if (item.status == 1) {
      //     已发布  
      if (parseInt(item.refrashnum) == 0) {
        this.showHint("刷新次数不足")
      } else {
        var cacheKey = appInstance.getUtil.getUserinfoKey();
        let userInfo = appInstance.getUtil.cacheGet(cacheKey)
        appInstance.getUtil.ajax({
          path: '5cef70a58b66c',
          method: 'GET',
          check: true,
          accessToken: true,
          data: {
            id: item.id,
            city: appInstance.globalData.city,
            telno: userInfo.passport_phone
          },
          success: res => {
            if (res.data.code == 1) {
              that.showHint("刷新成功")
              item.updatetime = res.data.data.time
              that.setData({
                publishList: that.data.publishList
              })
            } else {
              that.showHint(res.data.msg)
            }
          },
          fail: error => {
            that.showHint("网络异常")
          }
        })
      }
    }
  },
  itemEdit(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index]
    console.log(item.id)
    if (item.status == 0) {
      //     审核中
      this.showHint("房源审核中，无法修改")
    } else if (item.status == 1) {
      //     已发布
      wx.navigateTo({
        url: "/taofang-package/pages/publish-form/publish-form?houseType=" + findHouseName(item.infotype) + "&publish=" + false + "&id=" + item.id,
      })
    }
  },
  itemShare(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index]
    if (item.status == 0) {
      //     审核中
      this.showHint("房源审核中，无法分享")
    }
  },
  itemDelete(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index]
    if (item.status == 0) {
      //     审核中
      this.showHint("房源审核中，无法删除")
    } else {
      wx.showModal({
        title: '',
        content: '确认删除此发布？',
        confirmText: "确认",
        confirmColor: "#ff9000",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            var cacheKey = appInstance.getUtil.getUserinfoKey();
            let userInfo = appInstance.getUtil.cacheGet(cacheKey)
            appInstance.getUtil.ajax({
              path: '5cef70c40c9c8',
              method: 'GET',
              isHideLoad: true,
              check: true,
              accessToken: true,
              data: {
                id: item.id,
                telno: userInfo.passport_phone,
                // tbl: "rent",
                city: appInstance.globalData.city
              },
              success: res => {
                that.showHint(res.data.msg)
                if (res.data.code == 1) {
                  that.data.publishList.splice(index, 1)
                  that.setData({
                    publishList: that.data.publishList
                  })
                } else {

                }
              },
              fail: error => {
                that.showHint("网络异常")
              }
            })
          }
        }
      })

    }
  },
  itemRepublication(e) {
    let index = e.currentTarget.dataset.index;
    let item = this.data.publishList[index];
    appInstance.getUtil.checkAuthentication(appInstance.globalData.city, function (result) {
      if (result.auth) {
        // 已实名认证
        if (item.republish == "1") {
          // 可再发布
          wx.showModal({
            title: '',
            content: '您确定要再发布这套房源吗？',
            confirmText: "确定",
            confirmColor: "#ff9000",
            cancelText: "取消",
            success(res) {
              if (res.confirm) {
                var cacheKey = appInstance.getUtil.getUserinfoKey();
                let userInfo = appInstance.getUtil.cacheGet(cacheKey)
                appInstance.getUtil.ajax({
                  path: '5d13292af19ff',
                  method: 'GET',
                  check: true,
                  accessToken: true,
                  data: {
                    id: item.id,
                    uid: appInstance.getUtil.cacheGet("changeUid"),
                    infotype: item.infotype,
                    city: appInstance.globalData.city
                  },
                  success: res => {
                    if (res.data.code == 1) {
                      that.getPublishRecord(true)
                      that.showHint(res.data.msg)
                    } else {
                      that.showHint(res.data.msg)
                    }
                  },
                  fail: error => {
                    that.showHint("网络异常")
                  }
                })
              }
            }
          })



        } else {
          that.showHint("您当前无法再发布")
        }
      } else {
        //未实名认证
        wx.showModal({
          title: '',
          content: '实名认证后可进行再发布',
          confirmText: "进行认证",
          confirmColor: "#ff9000",
          cancelText: "取消",
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/taofang-package/pages/authentication/authentication',
              })
            }
          }
        })
      }
    })

  },


  //转发
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      let index = res.target.dataset.index;
      let item = this.data.publishList[index]
      // todo 分享详情页面
      return {
        title: item.title,
        path: '/taofang-package/pages/details-page/details-page?id=' + item.id,
        imageUrl: item.pic,
        success: function (res) { }

      }
    } else {
      return {
        title: '转发',
        path: "/pages/index/index",
        success: function (res) { }
      }
    }

  },

  refreshHint() {
    wx.showModal({
      title: '',
      content: '实名认证并上传房源图片可获得免费刷新机会',
      confirmText: "去认证",
      confirmColor: "#000000",
      cancelText: "再看看",
      cancelColor: "#ff9000",
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/taofang-package/pages/authentication/authentication',
          })
        }
      }
    })
  },

  makePhone(e) {
    let phone = e.target.dataset.phone;
    console.log(phone)
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  onUnload() {
    if (!this.data.backControl) {
      wx.switchTab({
        url: '/pages/my/my'
      })
    }

  },

  doPublish() {
    this.setData({
      backControl: true
    })
    wx.switchTab({
      url: '/pages/publish/publish'
    })
  },
  changeTab(e){
    console.log(e)
    this.setData({
      tabIndex:e.currentTarget.dataset.index
    });
  },

  /**
   * 获取求租列表
   * */ 
  getRentList(){
    var that = this;
    if (isLoad){
      return;
    } else {
      isLoad = true;
    }
    appInstance.getUtil.ajax({
      path: '58d32417b8a14',
      method: 'GET',
      data: {
        city: appInstance.globalData.city,
        page: pageIndex,
        perpage: pagesize
      },
      accessToken: true,
      userinfo: true,
      success: res => {
        if (res.data.code == '1') {
          console.log(res.data.data.data)
          pageIndex++;
          isLoad = false;
          this.readyData(res.data.data.data);
        } 
      }
    });
  },
  readyData(data){
    if (data.length === 0){
      var showPublishBtn = this.data.rentList.length>0? false : true; 
      pageIndex--;
      this.setData({
        showPublishBtn: showPublishBtn
      });
      return;
    }
    for (var i = 0; i < data.length ; i ++){
      data[i].street = data[i].street_title ? data[i].street_title.split(',') : data[i].area_title.split(',');//地铁和区域
      data[i].station = data[i].ss_title ? data[i].ss_title.split(',') : data[i].subway_name ? data[i].subway_name.split(','):[];
      data[i].time = this.resetTime(data[i].add_time);//更新时间
    }
    data = this.data.rentList.concat(data);
    var showPublishBtn = data.length > 0? false :true; 
    this.setData({
      rentList:data,
      showPublishBtn: showPublishBtn
    });
  },
  resetTime(t){
    var time = new Date(parseInt(t*1000));
    var y = time.getFullYear();
    var m = this.isTwo(time.getMonth() + 1);
    var d = this.isTwo(time.getDate());
    var h = this.isTwo(time.getHours());
    var min = this.isTwo(time.getMinutes());
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  },
  isTwo(n){
    n = n.toFixed(0);
    if (n.length < 2){
      n = '0' + n;
    }
    return n;
  },
  /***
   * 删除求租信息
  */

  delete(e){
    var that = this;
    wx.showModal({
      title: '',
      content: '确认删除此发布？',
      confirmText: "确认",
      confirmColor: "#ff9000",
      cancelText: "取消",
      success(res) {
        if (res.confirm) {
          that.deleteItem(e);
        }
      }
    })
  },
  deleteItem(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    appInstance.getUtil.ajax({
      path: '58d330b5c3142',
      method: 'GET',
      data: {
        city: appInstance.globalData.city,
        seek_id:id
      },
      accessToken: true,
      userinfo: true,
      success: res => {
        if (res.data.code == '1') {
          wx.showToast({
            title: '删除成功',
            icon: 'none',
            duration: 2000
          });
          that.deleteData(id);
        } else {
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },
  deleteData(id){
    var list = this.data.rentList;
    for (var i = 0 ; i < list.length ; i ++){
      if (list[i].id === id){
        list.splice(i,1);
      }
    }
    var showPublishBtn = list.length > 0 ? false:true;
    this.setData({
      rentList:list,
      showPublishBtn: showPublishBtn
    });
  },
  doRent() {
    wx.navigateTo({
      url: '/taofang-package/pages/rent-seeking-type/rent-seeking-type',
    });
  }
})

function findHouseName(houseType) {
  return houseTypeMap[houseType]
}