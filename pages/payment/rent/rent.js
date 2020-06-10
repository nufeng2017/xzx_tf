var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    ad:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var data = {unpaid:1};
    appInstance.getUtil.gongyuAjax('getLease_list', 'GET', data, function (res) {
      if (res.result == '1') {
        var list = res.data;
        list.forEach(function (val, index, arr) {
          arr[index]['title'] = val.lease_mode_ch + '|' + val.area + '·' + val.xiaoqu_name;
          arr[index]['rental'] = parseFloat(val.rental);
          arr[index]['housedetail'] = arr[index]['housedetail'].replace(arr[index]['xiaoqu_name'], '');
          if (arr[index]['roomname']) {
            arr[index]['housedetail'] += '-' + arr[index]['roomname'];
          }
        });
        console.log(list);
        that.setData({ list: list });
      }
    });

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 
  }


})