// pages/detailpages/detailpages.js
import {tracking} from '../../../utils/burying-point.js'
var appInstance = getApp();
var obj = {};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    office_building: ['新房', '二手房'],
    office_building1: ['商铺新房', '二手商铺'],
    id:'',
    bus:'',//公交
    subway:'',//地铁
    b_other:'',//设备
    current:1,//轮播图游标
    isIPX: '',
    housePics: [],
    address:'',
    isreal: '',
    istag: '',
    price: '',
    priceUnit: "",
    payment: "",
    room: "",
    hall: "",
    toilet: "",
    buildarea: "",
    forward: "",
    renttype: "",
    fitment: "",
    district: "",
    streetName: "",
    subfloor: "",
    floor: "",
    totalfloor: "",
    lastFloor: "",
    infoType: "",
    creattime:"",
    blockshowname: "",
    remark: "",
    equipment: "",
    selectEqu: "",
    longitude: "",
    latitude: "",
    bus: "",
    subway: "",
    b_other: "",
    detail_address: "",
    sitename: "",
    goodHouseRecommend: "",
    phone:'',
    userPic:'',
    trueName:'',
    agentname:'',
    rentcount:'',
    starlevel:'',
    houseDesArr:true,
    otherDesArrow:true,
    isShowHouseDescription:false,
    isShowOther: false,
    loadOver:false
  },

  loadOver: function () {//加载结束
    this.setData({ loadOver: true });
  },
  onLoad(options){
    var scene = decodeURIComponent(options.scene);
    if(scene != 'undefined'){
      options.id = scene
    }
    this.setData({ isIPX: appInstance.globalData.isIPX })
    appInstance.getUtil.ajax({
      path: '5cecf9143ece2',
      method: "GET",
      check: true,
      data: { 'rid': options.id, 'city': appInstance.globalData.city },
      success:res=>{
        if (res.data.code == '1') {
          let data = res.data.data
          let equ = data.equipment.split(',')
          let selectedequ = data.equipment.split(",")
          var temp = [];
          selectedequ.forEach(function (val, index, arr) {
            if(val!=''){
            let t = { "name": val, "value": appInstance.globalData.equipment[val]}
            temp.push(t);
            }
          })

          let sex = data.userInfo.sex == 0 ? "先生" : '女士'
          let num = 0;
          if (data.infofrom=='1'){
            num = data.isstar
          }else{
            num = data.userInfo.starlevel
          }

          let starArr = [];//显示经纪人星星的个数
          for (let i = 0; i < parseInt(num);i++ ){
            starArr.push("1");
          }

          this.setData({
            id:options.id,
            options: options,
            housePics: data.rentImages,
            address:data.address,
            isreal:data.isreal,
            istag:data.istag,
            price:data.price.split('.')[0],
            priceUnit: appInstance.globalData.unit[data.priceunit],
            payment: data.payment,
            room:data.room,
            hall:data.hall,
            toilet:data.toilet,
            buildarea: data.buildarea.split('.')[0],
            forward: data.forward,
            renttype: data.renttype,
            house_special: data.house_special ? data.house_special.split(',') : null,
            rent_items: data.rent_items ? data.rent_items.split(',') : null,
            rental_condition: data.rental_condition ? data.rental_condition.split(',') : null,
            look_house_time: data.look_house_time_ch,
            office_type: data.office_type_ch,
            checkin_time: data.checkin_time,
            fitment: data.fitment,
            district: data.district,
            streetName: data.streetName,
            subfloor: data.subfloor,
            floor:data.floor,
            totalfloor: data.totalfloor,
            lastFloor: data.floor_type == 2 ? (data.subfloor + "-" + data.floor + "/" + data.totalfloor) : data.floor_type == 1 ? (data.floor + "/" + data.totalfloor) : data.totalfloor + '层 独栋',
            infoType: data.infoType,
            min_periods: data.min_periods,
            free_periods: data.free_periods,
            transferfee: parseFloat(data.transferfee),
            updatetime_ch: data.updatetime_ch,
            creattime: appInstance.getUtil.formatDate(parseInt(data.updatetime)*1000 , 'YY/MM/DD'),
            blockshowname: data.blockshowname,
            remark: removeHTMLTag(data.remark) ,
            equipment: equ,
            selectEqu:temp,
            longitude: data.blockInfo.b_map_x,
            latitude: data.blockInfo.b_map_y,
            bus: removeHTMLTag(data.blockInfo.b_bus) ,
            subway: removeHTMLTag(data.blockInfo.b_metro),
            b_other: removeHTMLTag(data.blockInfo.b_other),
            detail_address: data.blockInfo.address,
            around: data.around,
            goodHouseRecommend: data.goodHouseRecommend,
            phone: data.telno,
            infofrom: data.infofrom,
            trueName: data.infofrom == '1' ? data.contactor:data.userInfo.truename,
            agentname: data.infofrom == '5' ? data.userInfo.agencyInfo.agentname:'',
            headPic: data.infofrom == '1' ? data.userInfo.head_pic : data.userInfo.smallphoto,
            starlevel: starArr,
            rentcount: data.blockInfo.rentcount,
            office_building_value: parseInt(data.office_building)-1,
            division: data.division,
            frontage: data.frontage,
            registered: data.registered,
            is_money_house: data.is_money_house,
            housePropertyType:data.infotype
          })
          this.getViewInfo()
          this.getThreeLine()
            
          //**埋点 */ 
          tracking({pageId:2417,eventType:1},{id:options.id,type:data.infotype});
        }

      }
    })

  },

  swiperChange: function (e) {
    this.setData({ current: e.detail.current + 1 });
  },

  //举报
  report: function () {//转跳到举报页面
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      var obj = {};
      // obj.city = appInstance.globalData.city;
      obj.telno = data.passport_phone;
      obj.id = this.data.id
      // obj.h_id = this.data.houseInfo.h_id;
      // obj.r_id = this.data.houseInfo.r_id;
      // obj.passport_username = data.passport_username;
      obj.complain_id = data.passport_uid;
      // obj.from = appInstance.globalData.from;
      // obj.house_comefrom = this.data.houseInfo.house_comefrom;
      wx.setStorageSync('report', obj);
      wx.navigateTo({
        url: 'report/report'
      });
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },


  checkLgImg: function (event) {//查看大图
    var that = this;
    var index = event.target.dataset.index || 0;

      var imgUrls = new Array();
      that.data.housePics.forEach(function (val, index, arr) {
        if (val.ttype != '1') imgUrls.push(val.filename);
      })
      wx.setStorageSync('carouselPageIndex', index);
      wx.setStorageSync('imgUrls', imgUrls);
      wx.navigateTo({
        url: '/pages/detailPages/lgImg/lgImg',
      })
  },

  position: function (event) {//查看位置
   let markers = [{
      iconPath: "/img/position-market.png",
      id: 0,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      width: 25,
      height: 34,
      adr: this.data.district + this.data.streetName + this.data.detail_address
    }]

  console.log(markers[0].longitude)
  console.log(markers[0].latitude)
    wx.setStorageSync('markers', markers);
    wx.navigateTo({
      url: '/pages/detailPages/position/position',
    });
  },

  getViewInfo: function () {
    var that = this;
    
    wx.createSelectorQuery().select('#house-description').boundingClientRect(function (rect) {
      console.log(rect.height)  // 节点的高度  30*1.5*5
      let height = 225 / 750 * wx.getSystemInfoSync().windowWidth
      console.log(height)
      if (rect.height < height) {
        that.setData({ houseDesArr: false });
      } else {
        that.setData({ houseDesArr: true });
      }

      console.log(rect.height)
    }).exec()
  },

  getThreeLine(){

    var that = this;

    wx.createSelectorQuery().select('#threeLineView').boundingClientRect(function (rect) {
      rect.height  // 节点的高度 行高60
      
      let height = 380/750*wx.getSystemInfoSync().windowWidth
      console.log(height)
      if (rect.height < height) {
        that.setData({ otherDesArrow: false });

      } else {
        that.setData({ otherDesArrow: true });
      }

      console.log(rect.height)
    }).exec()

  }
,
  showHouse: function (event) {//展示所有文字

    console.log('show');
    if (this.data.isShowHouseDescription) {
      this.setData({ isShowHouseDescription: false });
    } else {
      this.setData({ isShowHouseDescription: true });
    }
  },

  showMoreLess(){

    if (this.data.isShowOther) {
      this.setData({ isShowOther: false });
    } else {
      this.setData({ isShowOther: true });
    }
  },

  call(){

    wx.makePhoneCall({
      phoneNumber:this.data.phone ,
    })

    //**埋点 */ 
    tracking({pageId:2417,eventType:6},{id:this.data.id,type:this.data.housePropertyType});
  },
  onShareAppMessage: function (res) {
    let options = this.data.options;
    let str = '?';
    let arr = Object.entries(options).map((item, index) => {
      return item.join('=');
    });
    str = str + arr.join('&');
    return {
      title: this.data.address,
      path: '/taofang-package/pages/details-page/details-page' + str,
      imageUrl: this.data.housePics[0].filename
    };
  },
   
})

function removeHTMLTag(str) {
  if(str){
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, ''); //去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
    str = str.replace(/&nbsp;/ig, '');//去掉&nbsp;
    return str;
  }else{
    return '';
  }
}