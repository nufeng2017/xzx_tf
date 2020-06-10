// map.js
Page({
  data: {
    address: '',
  },
  onLoad(options) {
    let item = JSON.parse(options.location)
    this.showMap(item);
  },
  checkMap() {
    wx.openLocation({
      latitude: this.data.markers[0].latitude,
      longitude: this.data.markers[0].longitude,
      scale: 18
    })
  },
  bMapTransQQMap: function  (lng, lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng - 0.0065;
    var y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var lngs = z * Math.cos(theta);
    var lats = z * Math.sin(theta);

    return {
      lng: lngs,
      lat: lats
    }
  },
  showMap: function (item) {
    var markers = [{
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      }];
    var lnglat = this.bMapTransQQMap(markers[0].longitude, markers[0].latitude);
    markers[0].longitude = lnglat.lng;
    markers[0].latitude = lnglat.lat;
    this.setData({ markers: markers, address: item.address});
  },
  gohere: function () {//导航
    wx.openLocation({
      latitude: this.data.markers[0].latitude,
      longitude: this.data.markers[0].longitude,
      scale: 14,
    })
  }
})