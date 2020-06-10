var appInstance = getApp();
var that;
var canvasContext;


var imgDownLoadUrl = "https://m.aizuna.com/Home/Tools/downLoadImg?url="
let imgInfo = {
  imgWidth: 0,
  imgHeight: 0,
  originImgUrl: "",
  originImgIndex: 0 //图片数组的索引

};

Page({
  data: {

    imageWidth: wx.getSystemInfoSync().windowWidth,
    pageMode: 0, //0:是编辑图片  1:预览图片
    angle: 0, //旋转的角度
    enableSave: false, //能够点击完成按钮
    imgUrlPath: "",
    showImg: false,
    // canvasWidth: wx.getSystemInfoSync().windowWidth,
    canvasWidth: 0,
    canvasHeight: 0,
    /** previewImgArr:[{
       url:"",  
       title:"",
       isSelected:false  //是否是默认预览的图片
     }]*/
    previewImgArr: [], //预览模式下的图片数组
    currentIndex: 0,//预览模式下的当前图片索引
    imgUrl:"",
  
  },
  onLoad(options) {
    that = this
    if (options.pageMode) {
      that.setData({
        pageMode: options.pageMode
      })
    }
    if (that.data.pageMode == 0) {
      // 编辑模式
      imgInfo.originImgUrl = options.imgUrl
      imgInfo.originImgIndex = options.imgIndex
      wx.showLoading({
        title: '图片加载中',
        mask:true
      })
      wx.getImageInfo({
        src: imgDownLoadUrl+imgInfo.originImgUrl,
        success: function (res) {
          wx.hideLoading()
          that.setData({
            imgUrlPath: res.path,
            originImgIndex: imgInfo.originImgIndex,
            imgUrl: options.imgUrl
          })
          imgInfo.imgWidth = res.width
          imgInfo.imgHeight = res.height

        },
        fail: function () {
          wx.hideLoading()
          that.showHint("图片加载失败")
        }
      })


  
    } else if (that.data.pageMode == 1) {
      //    预览模式
      let previewImgArr = JSON.parse(options.previewImgArr)
      let currentIndex = 0;
      for(var index in previewImgArr){
        if (previewImgArr[index].isSelected){
          currentIndex = parseInt(index)
        }
      }
      wx.setNavigationBarTitle({
        title: previewImgArr[currentIndex].title + " " + (currentIndex + 1) + "/" + previewImgArr.length,
      })
      that.setData({
        previewImgArr: previewImgArr,
        currentIndex:currentIndex
      })
    }

  },

 



  cancel(e) {
    wx.navigateBack({
      detail: 1
    })
  },

  //**********编辑图片逻辑 start************* */

  /**
   * 旋转操作
   * 
   */
  doRotate(e) {
    let rotateDuration = e.currentTarget.dataset.rotateduration;
    switch (rotateDuration) {
      case "left":
        this.setData({
          angle: this.data.angle - 90
        })
        break;
      case "right":
        this.setData({
          angle: this.data.angle + 90
        })
        break;
    }
    if (this.data.angle % 360 == 0) {
      this.setData({
        enableSave: false
      })
    } else {
      this.setData({
        enableSave: true
      })
    }
    // this.showImg();
  },
  // 保存
  doSave(e) {
    // if (canvasContext) {
    wx.showLoading({
      title: '图片处理中',
      mask: true
    })
      canvasContext = wx.createCanvasContext('canvasImg');
      let imgWidth = imgInfo.imgWidth;
      let imgHeight = imgInfo.imgHeight;
      var originX = imgInfo.imgWidth / 2;
      var originY = imgInfo.imgHeight / 2;
      if (that.data.angle % 180 != 0) {
        that.setData({
          canvasWidth: imgInfo.imgHeight,
          canvasHeight: imgInfo.imgWidth
        })
        originX = imgInfo.imgHeight / 2;
        originY = imgInfo.imgWidth / 2;
      } else {
        that.setData({
          canvasWidth: imgInfo.imgWidth,
          canvasHeight: imgInfo.imgHeight
        })
      }
      canvasContext.translate(originX, originY)
      canvasContext.rotate(that.data.angle * Math.PI / 180)
      var x = -imgWidth / 2;
      var y = -imgHeight / 2;
      canvasContext.drawImage(that.data.imgUrlPath, x, y, imgWidth, imgHeight);
      canvasContext.draw(true, setTimeout(() => {
        let width = imgInfo.imgWidth
        let height = imgInfo.imgHeight
        if (that.data.angle % 180 != 0) {
          width = imgInfo.imgHeight
          height = imgInfo.imgWidth
        }
        wx.canvasToTempFilePath({
          fileType: "jpg",
          width: width,
          height: height,
          destWidth: width,
          destHeight: height,
          quality: 1,
          canvasId: 'canvasImg',
          success: function(res) {
            console.log("保存成功：")
            wx.hideLoading()
            // 获得图片临时路径
            let imgPathArr = [res.tempFilePath]
            appInstance.getUtil.uploadImages({
              city: appInstance.globalData.city,
              path: imgPathArr, //这里是选取的图片的地址数组
              uploadSuccess: r => {
                console.log(r)
                let data = JSON.parse(r.data);
                if (data.code == "1") {
                  let imageUrl = data.pic_url
                  console.log("上传图片成功" + imageUrl)
                  let pages = getCurrentPages();
                  let lastPage = pages[pages.length - 2]; //上一个页面
                  let selectedImg = lastPage.data.imgUrls[that.data.originImgIndex]

                
                  selectedImg.imgUrl = data.data.imgurl
                  selectedImg.waterImgUrl = data.data.water_url
                  selectedImg.isUploaded = true

                  lastPage.setData({
                    imgUrls: lastPage.data.imgUrls
                  })
                  wx.navigateBack({
                    detail: 1
                  })
                }
              },
              uploadFail: function(r) {
                console.log("保存失败")
              },
              complete() {
                console.log("保存完成")
              }
            })
          },
          fail(e) {
            console.log(e)
          }
        })
      }, 500));

    // }
  },

  //**********编辑图片逻辑 end************* */

 //**********预览图片逻辑 start************* */
  swiperChange(e){
    let index = e.detail.current;
    wx.setNavigationBarTitle({
      title: this.data.previewImgArr[index].title + " " + (index + 1) + "/" + this.data.previewImgArr.length,
    })
  },


 
//**********预览图片逻辑 end************* */

  showHint(title) {
    wx.showToast({
      title: title,
      icon: 'none',
    })
  },
});