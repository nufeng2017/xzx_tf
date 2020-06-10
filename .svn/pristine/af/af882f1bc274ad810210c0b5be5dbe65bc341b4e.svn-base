var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:{
      sign_status:1
    },
    list:[],
    ad:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var data = {sign_status:that.data.title.sign_status};
    appInstance.getUtil.gongyuAjax('getLease_list', 'GET', data, function (res) {
      if (res.result == '1') {
        var list = res.data;
        list.forEach(function (val, index, arr) {
          arr[index]['title'] = val.lease_mode_ch + '|' + val.area + '·' + val.xiaoqu_name;
          arr[index]['roomstr'] = val.room > 0 ? val.room + '室':'';
          arr[index]['roomstr'] += val.hall > 0 ? val.hall + '厅':'';
          arr[index]['acreage'] = Math.round(val.acreage);
          arr[index]['images'] = appInstance.getUtil.imgSrc(val.images);
          if (arr[index]['ct_status'] == 5) {
            arr[index]['sign_status_ch'] = arr[index]['ct_status_ch'];
          }
          arr[index]['rental'] = parseFloat(arr[index]['rental']);
          arr[index]['housedetail'] = arr[index]['housedetail'].replace(arr[index]['xiaoqu_name'],'');
          if(arr[index]['roomname']){
            arr[index]['housedetail'] += '-' + arr[index]['roomname'];
          }
        });
        that.setData({ list: list });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  },
  /**
   * tab切换
   */
  changeSelect:function (event) {
    var that = this;
    var index = event.currentTarget.dataset.index;
    that.setData({
      title: {
        sign_status: index
      }
    })
    this.onLoad();
  }
})