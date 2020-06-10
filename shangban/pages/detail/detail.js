import { getOfficeList, getRentDetail } from "../../network/detail.js";
import { sharePage } from '../../common/share.js';
import { resetRichTxt } from '../../common/reset-rich-txt.js';
import { message } from '../../common/common.js';
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},//详情页信息,detail.infofrom 1 个人、5 中介
    mediaData:[],//轮播图数据
    location:{},//地址信息
    detailType:1,//详情页面种类 1、楼盘；2、房源详情
    showLoad:true,//显示加载页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.detailtype == 1){
      this.getData(options);
    } else if (options.detailtype == 2){
      this.gethouseData(options);
    }
    wx.setNavigationBarTitle({
      title: options.detailtype == 1?'楼盘详情':'房源详情'
    })
  },
  gethouseData(options){//获取房源数据
    getRentDetail({
      rid: options.id,
      channl:'azn_xcx'
    }).then((res)=>{
      console.log(res)
      if (Array.isArray(res.data.data.rentImages)){//获取图片数据
        var mediaData = res.data.data.rentImages.map((item,index)=>{
          let o = {};
          o.type = 1;
          o.url = item.filename;
          return o;
        });
      }
      if (res.data.data.blockInfo && res.data.data.blockInfo.b_map_x) {//获取位置信息
        var location = this._getLocation(res.data.data.blockInfo.b_map_x, res.data.data.blockInfo.b_map_y, res.data.data.blockInfo.address);
      }
      if (res.data.data.district) {//获取三数据
        var averagePrice = this._houseGetData(res.data.data);
      }
      if (res.data.data.remark) {//处理
        res.data.data.remark = resetRichTxt(res.data.data.remark);
      }
      res.data.data.nearHouseTotal = parseInt(res.data.data.nearHouseTotal);
      this.setData({
        detail: res.data.data,
        mediaData: [mediaData],
        detailType: options.detailtype,
        location: location,
        averagePrice: averagePrice,
        showLoad:false
      });
    });
  },
  _houseGetData(data){
    let arr = [{
      price: parseFloat(data.price_day),
      title: data.payment,
      unit: data.priceUnit_day
    }, {
      price: parseFloat(data.price_month),
      title: '月租金',
      unit: data.priceUnit_month
    }, {
      price: parseFloat(data.buildarea),
      title: '面积',
      unit: '㎡'
    }];
    return arr;
  },
  getData(options){//获取楼盘数据
    getOfficeList({
      office_id: options.id
    }).then((res)=>{
      if (res.data.data.media){//获取媒体数据
        var mediaData = this._resetMidia(res.data.data.media);
      }
      if (res.data.data.b_map_x) {//获取位置信息
        var location = this._getLocation(res.data.data.b_map_x, res.data.data.b_map_y, res.data.data.address);
      }
      if (res.data.data.district){//获取三种均价
        var averagePrice = this._getAveragePrice(res.data.data);
      }
      this.setData({
        detail:res.data.data,
        mediaData: mediaData,
        location: location,
        averagePrice: averagePrice,
        detailType: options.detailtype,
        showLoad: false
      });
    })
  },
  _getAveragePrice(data){
    let arr = [{
      price: parseFloat(data.price) ,//本楼盘均价
      title: '本楼盘均价',
      unit: data.price_unit
    },{
      price: parseFloat(data.districtAveragePrice) ,
      title: data.district + '均价',
      unit: data.price_unit
    }];
    if (data.streetname){
      arr.push({
        price: parseFloat(data.streetidAveragePrice) ,
        title: data.streetname + '均价',
        unit: data.price_unit
      });
    }
    return arr;
  },
  _getLocation(longitude, latitude, address){
    return {
      longitude: longitude,
      latitude: latitude,
      address: address
    }
  },
  _resetMidia(data){
    if (typeof data === 'object'){
      if (typeof data.image === 'object'){
        var imgs = [];
        Object.values(data.image).map((item,index)=>{
          imgs.push(item);
        });    
      }
    }
    var arr = [];
    if (data.video.length>0){
      arr = [data.video, imgs];
    } else {
      arr = [imgs];
    }
    return arr;
  },
  checkMap(){
    wx.navigateTo({
      url: '/shangban/pages/map/map?location=' + JSON.stringify(this.data.location),
    })
  },
  enterList(){
    wx.navigateTo({
      url: '/shangban/pages/house-list/house-list?listType=2&blockid=' + this.data.detail.blockid,
    })
  },
  onShareAppMessage: function (ops) {//分享
    let shareTitle = (this.data.detail.blockshowname || this.data.detail.blockname) + ' ' + this.data.detail.district + ' ' + (this.data.detail.streetName || this.data.detail.streetname) + ' ' + (this.data.detail.total_area || this.data.detail.buildarea + '平方米') + ' ' + (this.data.detail.price_day + this.data.detail.priceUnit_day || this.data.detail.price + this.data.detail.price_unit)
    let o = sharePage({
      detailtype: this.data.detailType,
      id:this.data.detail.id
    }, '/shangban/pages/detail/detail', shareTitle, this.data.detail.cover_url || this.data.detail.pic1);
    return o;
  },
  report(){//举报
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      var obj = {};
      obj.telno = data.passport_phone;
      obj.id = this.data.detail.id
      obj.complain_id = data.passport_uid;
      wx.setStorageSync('report', obj);
      wx.navigateTo({
        url: '/taofang-package/pages/details-page/report/report'
      });
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
  checkLp(){//查看附近
    wx.navigateTo({
      url: '/shangban/pages/house-list/house-list?listType=' + this.data.detailType + '&district=' + (this.data.detail.districtID || this.data.detail.district_id) + '&streetid=' + this.data.detail.streetid,
    })
  },
  checkLpDetail(e){//查看所属楼盘
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/shangban/pages/detail/detail?detailtype=1&id=' + id,
    })
  },
  message(){
    message(this.data.detail);
  }
})