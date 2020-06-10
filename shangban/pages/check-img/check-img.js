// shangban//pages/check-img/check-img.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mediaData:[],
    detailType:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._resetActive(options);
  },
  _resetActive(options){
    let media = JSON.parse(options.data);
    let active = parseInt(options.active);//因为详情页所有视频总数算作1，还有一张图片作为视频封面，所以重置ACTIVE
    if (media.length == 2){
      if (active > 0){
        active = active + media[0].length;
      } else {
        active = active;
      }
    } else if (media.length == 1){
      active = active;
    }
    this.setData({
      mediaData: media,
      active: active,
      location: JSON.parse(options.location),
      detailType: options.detailtype
    });
  }
})