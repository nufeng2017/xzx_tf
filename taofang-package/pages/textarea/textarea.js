
//获取应用实例
const app = getApp();
let pageIndex; 
let prevPage;

var that;
var publish = true;
var lastPage;
var publishObj;
var houseTypeKey;

Page({
  data: {
    num: 0,
    noteTxt:'',
    publishObj:{
      detail_content:[]
    }
  },
  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  onLoad(options){
    
    that = this
    let pages = getCurrentPages();
    lastPage = pages[pages.length - 2]; //上一个页面
    publishObj = lastPage.data.publishObj
    publish = lastPage.data.publish //true：发布 false:编辑
   
    houseTypeKey = lastPage.data.houseTypeKey // 缓存数据的key
    console.log(houseTypeKey);

    this.setData({
      publishObj:publishObj,

    })
   
  },

  record:function(e){   

    publishObj.detail_content = e.detail.value

    this.setData({
      publishObj:publishObj
    })

    
  },

  onUnload(){

    this.editePushObj(houseTypeKey)
    lastPage.setData({
      publishObj: publishObj
    })

    lastPage.savePublishObj(this.data.publishObj);
  },

  finish(){
    wx.navigateBack({
      detail: 1
    })

  },

  editePushObj(key) {//当为发布时 保存数据
    
    if (publish) {
      
      let arr = app.getUtil.cacheGet(key)
      console.log(arr);
      for (let index in arr) {//找到对应的
        if (arr[index].uid == this.data.publishObj.uid) {
          arr.splice(index, 1, this.data.publishObj)

          break;
        }
      }
      app.getUtil.cachePut(key, arr)
    }
  }
  
})
