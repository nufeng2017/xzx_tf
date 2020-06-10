var appInstance = getApp();
var that;
var publish = true;
var lastPage;
var publishObj;
var houseTypeKey;
Page({
  data: {
    /**
     * imgUrls:[{
     *  imgUrl:"",//不带水印图片url
     *  waterImgUrl:"",//带水印的url
     *  isUploaded:false  //是否被上传  true :上传成功
     *  isLoadComplete:false //图片是否加载完成
     * // imgPath:"" //图片的本地路径，仅在该图片是本地上传时有值
      * }]
    */
    imgUrls: [] //已经上传或正在上传的图片数组
  },
  onLoad(options) {
    that = this
    let pages = getCurrentPages();
    lastPage = pages[pages.length - 2]; //上一个页面
    publishObj = lastPage.data.publishObj
    publish = lastPage.data.publish //true：发布 false:编辑
    houseTypeKey = lastPage.data.house_TypeK // 缓存数据的key
    if (publishObj.house_pics && publishObj.house_pics.length > 0){
      for (var index in publishObj.house_pics){
        this.data.imgUrls.push({
          imgUrl: publishObj.house_pics[index].replace("_w", ""),
          waterImgUrl: publishObj.house_pics[index],
          isUploaded:true,
          isLoadComplete:false
        })
      }
      this.setData({ imgUrls: this.data.imgUrls })
    }
  
  },

  uploadImg() {//上传照片选项
  if(that.data.imgUrls.length == 9){
    wx.showToast({
      title: '上传图片最多9张！',
      icon:'none',
      duration:2000
    })
  }else{
   
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success(res) {
        let sourceType= ['camera']
        if(res.tapIndex == 1){
          sourceType[0] = "album"
        }
        wx.chooseImage({
          sizeType: ['original', 'compressed'],
          sourceType: sourceType,
          count: 9 - that.data.imgUrls.length,
          success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            let tempFilePaths = res.tempFilePaths
            console.log(tempFilePaths)
            //当前已经上传或正在上传的图片数量
            let currentImgCount = that.data.imgUrls.length
            var index = 0
            let tempImgUrl = that.data.imgUrls
            for (index in tempFilePaths) {
              tempImgUrl.push({
                imgUrl: "",//不带水印图片url
                waterImgUrl: "",//带水印的url
                isUploaded: false
              })
              that.uploadImgToServer(currentImgCount + parseInt(index), tempFilePaths[index])
            }
            that.setData({
              imgUrls: tempImgUrl
            })
          },
          fail(e) {
            console.log(e)
          },
          complete(e) {
            console.log(e)
          }
        })
      }
    })
  }
    
  },

/**
 * @param imgIndex 该图片在数组中的位置
 * @param imgPath 图片的本地路径
 * 
*/
  uploadImgToServer(imgIndex,imgPath){
    appInstance.getUtil.uploadImages({
      isHiddenLoading:true,
      city: appInstance.globalData.city,
      path: [imgPath], 
      uploadSuccess: r => {
        console.log(r)
        let data = JSON.parse(r.data);
        if (data.code == "1") {
          let imgInfo = that.data.imgUrls[imgIndex]
          imgInfo.imgUrl = data.data.imgurl
          imgInfo.waterImgUrl = data.data.water_url
          imgInfo.isUploaded = true
          imgInfo.isLoadComplete =  false
          that.setData({
            imgUrls : that.data.imgUrls
          })
        }
      },
      uploadFail: function (r) {
        console.log(r);
      },
      complete(){
        
      }
    })
  },

  deleteImg(e){
    let imgIndex = e.currentTarget.dataset.index;
    let imgArr = that.data.imgUrls
    imgArr.splice(imgIndex, 1)
    that.setData({ imgUrls: imgArr})
  },

  doComplete(){
    let imgCount = that.data.imgUrls.length 
    if(imgCount == 0){
        wx.navigateBack({
          detail:1
        })
    }else if (imgCount <= 6){
      wx.showModal({
        title: '您上传了' + that.data.imgUrls.length+'张图片',
        content: '数据显示超过6张可以提升电话量哦!',
        cancelText:"不需要",
        confirmText:"再传几张",
        confirmColor:"#ffa229",
        success(res) {
          if (res.cancel) {
//            todo 完成的事件
             wx.navigateBack({
               detail:1
             })
          }
        }
      })
    }else{
//            todo 完成的事件
      wx.navigateBack({
        detail: 1
      })
    }
  },

  loadComplete(e){
    let index = e.currentTarget.dataset.index
    that.data.imgUrls[index].isLoadComplete = true
    that.setData({imgUrls:that.data.imgUrls})
  },

  onUnload(){
    let tempImgArr = [];
    for(var index in this.data.imgUrls){
      if(this.data.imgUrls[index].isUploaded){
        tempImgArr.push(this.data.imgUrls[index].waterImgUrl)
      }
    }
    publishObj.house_pics = tempImgArr
    lastPage.setData({
      publishObj: publishObj
    })
    if (publish) {
      let cacheArr = appInstance.getUtil.cacheGet(houseTypeKey)
      let hasCache = false
      let cachePublishObj;
      for (var index in cacheArr) {
        if (publishObj.uid == cacheArr[index].uid) {
          cachePublishObj = cacheArr[index]
          hasCache = true;
          break
        }
      }
      if (hasCache) {
        // 图片url
        cachePublishObj.house_pics = tempImgArr
        // 保存到缓存中
        appInstance.getUtil.cachePut(houseTypeKey, cacheArr)
      }
    }
  },
});