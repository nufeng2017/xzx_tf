// pages/my_collection.js
var appInstance = getApp();
var touchStartTime = 0;
var timer = '';//长按事件定时器
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "houses": false,
    "nowpage": 0,
    "nowpage1":0,
    "city":'',
    "ad":{},
    active:0,//tabs active,
    tabs:['公寓','写字楼'],
    officeBuild:[],//写字楼数据
    loadFinish:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({ 'city': appInstance.globalData.city })
    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.fetchData();
    this.getOfficeBuildingData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  fetchData: function () {
    let that = this;
    var nowpage = that.data.nowpage;
    nowpage += 1;
    let data = {
      'city': appInstance.globalData.city,
      'page': nowpage,
      'per_page': 10
    };
    appInstance.getUtil.apiRequest('58d109ae3082b', 'GET', data, function (res) {
      if (res.data.code == '1') {
        let houseList = res.data.data;
        houseList.forEach(function (val, index, arr) {
          arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key, val.house_comefrom);
        });
        let temp = that.data.houses || [];
        houseList = temp.concat(houseList);
        that.setData({
          "houses": houseList,
          nowpage:res.data.data.length>0?nowpage:nowpage-1,
          loadFinish:true
        })
      }
    });
  },
  getOfficeBuildingData(){
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey);
    let page = this.data.nowpage1 + 1;
    appInstance.getUtil.apiRequest('5eb8eab8c73df', 'GET', {passport_uid:userInfo.passport_uid,city: appInstance.globalData.city,page:page}, (res)=>{
      if (res.data.code == '1') {
        this.setData({
          officeBuild:this.data.officeBuild.concat(res.data.data),
          nowpage1:res.data.data.length>0?page:page-1,
          loadFinish:true
        });
      }
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadFinish){
      this.setData({
        loadFinish:false
      });
      if (this.data.active ==0 ){
        this.fetchData()//渲染列表数据
      } else {
        this.getOfficeBuildingData();
      }
    }
  },
  // 触摸开始事件 
  touchStart: function (e) {
    let that = this;
    touchStartTime = +new Date();
    timer = setTimeout(()=>{
      this.deleteBtn(e);
    },1000);
    
  },

  // 触摸结束事件 
  touchEnd: function (e) {
    let touchEndTime = +new Date();
    let item = e.currentTarget.dataset.item;
    clearTimeout(timer);
    if (touchEndTime - touchStartTime <= 200){//触发点击事件
      if (this.data.active == 0){
        wx.navigateTo({
          url: '/pages/detailPages/detailPages?h_id=' + item.h_id + '&r_id=' + item.r_id + '&house_comefrom=' + item.house_comefrom + '&l_id=' + item.l_id + '&city=' + appInstance.globalData.city,
        })
      } else {
        wx.navigateTo({
          url: '/shangban/pages/detail/detail?id=' + item.id + '&detailtype=2',
        })
      }
    }
  },
  deleteBtn: function (e) {
    console.log(e)
    let that = this;
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '删除',
      confirmColor: "#ffa229",
      content: '是否确定删除？',
      success: function (res) {
        if (res.confirm) {
          if (that.data.active == 0){
            let temp = that.data.houses;
            let data = {
              'city': appInstance.globalData.city,
              'house_comefrom': temp[index].house_comefrom,
              'h_id': temp[index].h_id,
              'r_id': temp[index].r_id ? temp[index].r_id : 0,
              'c_id': temp[index].c_id ? temp[index].c_id : 0,
              'collect_status': temp[index].collect_status == 0 ? 1 : 0,
            };
            appInstance.getUtil.apiRequest('58d271498fa6d', 'POST', data, function (res) {
              if (res.data.code == '1') {
                temp.splice(index,1);
                that.setData({
                  "houses": temp
                })
              }
            });
          } else {
            var cacheKey = appInstance.getUtil.getUserinfoKey();
            var data = appInstance.getUtil.cacheGet(cacheKey);
            wx.request({
              url: 'https://mtsapi.house365.com', //仅为示例，并非真实的接口地址
              data: {
                city: appInstance.globalData.city,
                client:'azn_xcx',
                version:'v1.0',
                v: 'v1.0',
                id: item.id,
                api_key:'azn_xcx',
                phone: data.passport_phone,
                passport_uid: data.passport_uid,
                tbl: 'rent',
                method: 'secondhouse.cancelHouse',
                name: 'UserCenter'
              },
              success (res) {
                if (res.data.result == 1){
                  let listData = that.data.officeBuild;
                  listData.splice(index,1);
                  that.setData({
                    officeBuild: listData
                  })
                }
              }
            })
          }
        } 
      }
    })
  },
  changeActive(e){//切换tabs
    console.log(e)
    let index = e.currentTarget.dataset.index;
    this.setData({
      active:index
    });
  }
})