var app = getApp();
var that;
var publish = true;
var lastPage;
var publishObj;
var houseTypeKey;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    key:'',
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this
    let pages = getCurrentPages();
    lastPage = pages[pages.length - 2]; //上一个页面
    publishObj = lastPage.data.publishObj
    publish = lastPage.data.publish //true：发布 false:编辑
    houseTypeKey = lastPage.data.house_TypeK // 缓存数据的key
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  change(e){

    this.setData({
      key:e.detail.value
    })
    app.getUtil.ajax({
      path: '5cecf92e39fdc?city=' + app.globalData.city,
      method:"GET",
      data:{
        "blockname":e.detail.value,
        "city":app.globalData.city,
         "tbl":"rent"
      },success:res=>{

        console.log(res);
        if(res.data.code=="1"){

          this.setData({
            list:res.data.data
          })

          console.log(this.data.list)
        }
      }

    })

  },

  clickAction(e) {

    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let obj = this.data.list[index]

    publishObj.block_name = obj.name
    publishObj.district = obj.district
    publishObj.street = obj.street;
    publishObj.street_id = obj.streetid

   
    lastPage.setData({
      publishObj: publishObj
    })
    if (publish) {
      let cacheArr = app.getUtil.cacheGet(houseTypeKey)
      let hasCache = false
      let cachePublishObj;
      for (var i in cacheArr) {
        if (publishObj.uid == cacheArr[i].uid) {
          cachePublishObj = cacheArr[i]
          hasCache = true;
          break
        }
      }
      if (hasCache) {

        cachePublishObj.block_name = obj.name
        cachePublishObj.district = obj.district
        cachePublishObj.street = obj.street;
        cachePublishObj.street_id = obj.street_id
        // 保存到缓存中
        app.getUtil.cachePut(houseTypeKey, cacheArr)
      }
    }
    
    wx.navigateBack({
      detail: 1
    })
  }

  
})