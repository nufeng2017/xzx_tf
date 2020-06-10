/**
 * 筛选弹出窗
 */
Component({
  properties: {
    media: {
      type: Array,
      value: []
    },
    active:{
      type:Number,
      value:0
    },
    location:{
      type:Object,
      value:{}
    },
    pageType:null,//1.详情页,2.查看大图页,
    detailType:null
  },
  data: {
    isHasVideo:false,//是否含有视频
    mediaData:[],//重组的轮播数据
    imgsFirstIndex:0,//图片组的序列号
    imgTypeFirstIndex:{},//每一类首张图片的序列号
    imgType:[],//图片种类数据
    imgTotal:0,//图片总数
    videoTotal:0,//视频总数
    scrollTo:'',//滚动位置
  }, 
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  observers: {
    'media': function (media){
      if (media.length>0){
        let isHasVideo, mediaData, imgsFirstIndex,videoTotal=0;
        if (media.length == 2) {
          isHasVideo = true;
          videoTotal = media[0].length;
          let imgs = this._setImgData(media[1], media[0].length);
          let arr = this.data.pageType==1 ? [] : media[0]
          mediaData = [...arr, ...imgs];
          imgsFirstIndex = this.data.pageType == 1?1:media[0].length;
        } else if (media.length == 1) {
          isHasVideo = false;
          let imgs = this._setImgData(media[0], 0);
          mediaData = [...imgs];
          imgsFirstIndex = 0;
        }
        this.setData({
          isHasVideo: isHasVideo,
          mediaData: mediaData,
          imgsFirstIndex: imgsFirstIndex,
          videoTotal: videoTotal
        });
        console.log(this.data)
      }
    },
    'active': function (active){//监视active让上面的tabs滚动到所在位置
      if (this.data.pageType == 2 && this.data.detailType==1){
        for (let i in this.data.imgTypeFirstIndex){
          if (this.data.imgTypeFirstIndex[i] == active){
            this.setData({
              scrollTo:'z' + this.data.mediaData[active].id
            });
            break;
          }
        }
      }
    }
  },
  methods: {
    _setImgData(imgs,videoLen){//获取图片种类、数量等信息
      let arr = [];
      let obj = {};
      let imgType= [];
      let count = videoLen - 1;
      imgs.map((i,index)=>{
        if (Array.isArray(i)){
          i.map((item)=>{
            count++;
            if (item.image_type_name) {
              if (typeof obj[item.image_type_name] != 'number') {
                obj[item.image_type_name] = count;
                imgType.push({
                  num:i.length,
                  title: item.image_type_name,
                  id: item.id
                })
              }
            }
            arr.push(item);
          })
        } else {
          arr.push(i);
        }
      });
      this.setData({
        imgTypeFirstIndex: obj,
        imgType: imgType,
        imgTotal:arr.length
      });
      return arr;
    },
    changeSwiper(e){//滑动轮播事件
      let index = e.detail.current;
      this.setData({
        active:index
      });
    },
    changeVideoImg(e){//点击下面的tabs事件
      let index = e.currentTarget.dataset.index;
      this.setData({
        active: index
      });
    },
    checkImg(){//详情页点击轮播进入查看大图
      if (this.data.pageType ==1){
        wx.navigateTo({
          url: '/shangban/pages/check-img/check-img?data=' + JSON.stringify(this.data.media) + '&active=' + this.data.active + '&location=' + JSON.stringify(this.data.location) + '&detailtype=' + this.data.detailType,
        })
      }
    },
    checkMap(){
      wx.navigateTo({
        url: '/shangban/pages/map/map?location=' + JSON.stringify(this.data.location),
      })
    }
  }
})