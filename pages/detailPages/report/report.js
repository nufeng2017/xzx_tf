var appInstance = getApp();
Page({
  data: {
    count:0,//输入框文字计数
    images:[],//上传的图片
    reason:[{id:1,reason:'房源已出租'},{id:2,reason:'房东是中介'},{id:3,reason:'房屋信息虚假'},{id:4,reason:'其它'}],
    reasonTxt:'请选择举报理由',
    more_txt:'',//更多补充信息
    r_reason:'',
    reportInfo:{},
    canSubmit:'false'//是否能提交
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.rander();
  },
  rander: function () {
    this.setData({ reportInfo: wx.getStorageSync('report') });
  },
  checkNum:function(event){//监控textarea输入文字数目函数
    this.setData({ count: event.detail.value.length});
    this.data.more_txt = event.detail.value;
    if (this.data.reasonTxt != '请选择举报理由' && event.detail.value.length > 0) {
      this.setData({ canSubmit: '' });
    } else {
      this.setData({ canSubmit: 'false' });
    }
  },
  uploadImg:function(){//上传图片
    var that = this;
    wx.chooseImage({
      count: 3 - that.data.images.length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;

        let arr = that.data.images
        appInstance.getUtil.uploadImages({
          city: appInstance.globalData.city,
          path: tempFilePaths,
          uploadSuccess: r => {
            
            let data = JSON.parse(r.data);
            if (data.code == "1") {
              arr.push(data.data.water_url)
              that.setData({
                images: arr
              })
            }
          }
        })

      }
    })
  },
  deleteImg:function(event){//删除上传图片
    var index = event.currentTarget.dataset.index;
    var arr = this.data.images;
    arr.splice(parseInt(index),1);
    this.setData({ images:arr});
  },
  formSubmit: function (e) {//表单提交
    this.data.reportInfo.reason = this.data.r_reason;
    this.data.reportInfo.content = this.data.more_txt;
    appInstance.getUtil.ajax({
      path:'',
      method:'GET',
      data: this.data.reportInfo,
      success:res=>{
            if (res.data.code == 1) {
                  wx.showToast({
                    title: '举报成功',
                    icon: 'none',
                    duration:3000
                  })
            } else {
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 3000
                  })
            }
      }
    })
  },
  selectReason:function(e){//选择举报理由
    this.setData({reasonTxt:this.data.reason[e.detail.value].reason});
    this.data.r_reason = this.data.reason[e.detail.value].id;
    if (this.data.more_txt != ''){
      this.setData({canSubmit:''});
    }
  },
})