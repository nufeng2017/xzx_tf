// taofang-package//pages/house-list/house-list.js
import {tracking} from '../../../utils/burying-point.js'
var appInstance = getApp();
var loadPage = 1;//准备加载的页数
var pageSize = 20;//当前页长
var isLoading = false;//列表是否在加载
var thatObj = null;
var dataConfig = {
  "room": "roomIndex",//房型
  "infotype": "infotypeIndex",//物业类型
  "special": "specialIndex",//特色
  "fitment": "fitmentIndex",//装饰
  "originFrom": "originFromIndex",//来源
  "renttype": "rentTypeIndex",//出租方式
  "keyword":"keyword",//关键字
  "price":"priceIndex",//租金
  "district":"positionDataIndex",//区域或者地铁
  "railway":"positionDataIndex",
  "streetid":"positionChildDataIndex",//街道和地铁站
  "railPosition": "positionChildDataIndex",
}

var needKey = ['district', 'streetid', 'railway', 'railPosition', 'price', 'diy_price_start','diy_price_end', 'renttype'];//筛选后需要做历史记录的字段
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showPopup:'0',//弹窗是否显示 0消失，1位置过滤窗口出现，2租金，3户型，4筛选，5排序
    filterData:{},//过滤配置项数据
    positionMenu:'0',//位置选项菜单0区域 1地铁
    positionField: [{ "0": "district", "1": "streets" }, { "0": "railway", "1":"railPosition"}],//过滤条件位置配置字段
    positionField1: [{ "0": "district", "1": "streetid" }, { "0": "railway", "1": "railPosition" }],//过滤条件位置上传字段
    positionData:[],//区域或地铁的数据
    positionDataIndex:0,//区域或地铁数据选择序列
    positionChildDataIndex: {},//区域或地铁子选项数据选择序列
    priceIndex:'',//租金序列号
    roomIndex:0,//户型筛选序列
    originFromIndex:0,//来源筛选序列
    infotypeIndex:1000,//物业类型筛选序列
    rentTypeIndex:0,//出租方式筛选序列
    fitmentIndex: 0,//装修筛选序列
    specialIndex:10,//特色
    fiterSubmitData:{//需要提交的过滤条件数据
      district: '',//区域
      streetid: '',//街道
      railway: '',//地铁
      railPosition: '',//地铁站点
      price: '',//租金
      diy_price_start: '',//自定义价格
      diy_price_end: '',//自定义价格
      infotype: '',//物业类型
      room: '',//户型
      fitment: '',//装饰
      originFrom: '',//来源
      renttype: '',//出租方式
      keyword:'',//关键字
      special:0,//特色
      order:1
    },
    expandSubmitData:{
        area_name: "",//区域名
        street_name: "",//街道名
        station: "",//地铁站名
        sub_way: ""//地铁线路名
    },
    options:{},
    listData:[],//列表数据
    keyword:'请输入小区、区域、地铁站名称',
    orderItem: [//列表排序
      { key: '默认排序', value: 1 }, 
      { key:'价格从低到高',value:3},
      { key: '价格从高到低', value:4},
      { key:'面积从小到大', value:5},
      { key: '面积从大到小', value:6}
    ],
    city:'',
    excludeApartment:false//是否排除公寓房源
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    thatObj = this
    this.loadPage(options);

    /*埋点*/ 
    tracking({pageId:2416,eventType:1});
  },
  loadPage(options){
    this.setData({
      options: options,
      unit: appInstance.globalData.unit,
      city: appInstance.globalData.cityList[appInstance.globalData.city],
      excludeApartment:options.excludeApartment,
      ["fiterSubmitData.keyword"]: options.keyword ? options.keyword:"",
      keyword: options.keyword ? options.keyword : '请输入小区、区域、地铁站名称',
    });
    this.screenConfig();//筛选条件配置
  },
  /*
    页面滚动到底部监听
  */
  scrollLower() {
    this.showList({
      isPages:true
    });
  },
  /*
    筛选条件配置
  */
  screenConfig() {
    var that =this;
    appInstance.getUtil.ajax({
      data: {
        city: appInstance.globalData.city
      },
      isHideLoad: true,
      method: 'GET',
      path: '5cecf8ea42ab5',
      success(res) {
        console.log('筛选配置', res);
        if (res.data.code == 1){
          that.configFilterCondition(res.data.data);
          that.showList({
            isFirst:true
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    });
  },
  configFilterCondition(data){
    data.price = (!this.data.options.infotype || this.data.options.infotype == 1 || this.data.options.infotype == 5 || this.data.options.infotype == 6 || this.data.options.infotype == 7) ? data.price_default : (this.data.options.infotype == 3 ? data.price_office : data.price_store);
    if (this.data.options.infotype == 3){
      data.special = data.special_map[0].special;
    }
    if (this.data.options.infotype == 4) {
      data.special = data.special_map[1].special;
    }
    this.setData({
      filterData:data,
      positionData: data.district
    });
  },
  /*
    展示房源列表
   */
  showList(o){
    if (isLoading){
      return;
    } else {
      isLoading = true;
    }
    o.fiterSubmitData = this.data.fiterSubmitData;
    if (o.isFirst){//查看是否第一次进入该页面
      this.firstLoad(o);
    }
    this.listAjax(o);
  },
  firstLoad(o){
    loadPage = 1;
    for (var key in this.data.options) {
      var i = this.traverseObj(key, this.data.options[key]);//配置筛选字段的序列号
      o.fiterSubmitData[key] = this.data.options[key];
      this.setData({
        fiterSubmitData: o.fiterSubmitData,
        [dataConfig[key]]: i
      });
    }
    if (this.data.options.district || this.data.options.railway) {
      this.findAreaIndex();//区域地铁筛选数据前端展示
    }
  },
  traverseObj(key,value){
    if (Array.isArray(this.data.filterData[key])){//其它字段
      return this.findIndex(key,value);
    } 
    return value;//关键字
  },
  findAreaIndex(){
    var positionMenu = 0, positionData=[], positionChildDataIndex = {};
    for (var key in this.data.options){
      if (key === needKey[3]){//地铁
        positionMenu = 1;
        positionData = this.data.filterData[needKey[2]];
        this.setData({
          positionData: positionData
        });
      }
      if (key === needKey[1] || key === needKey[3]){
        var val = this.data.options[key].split(',');
        for (var i = 0; i < val.length; i++) {
          positionChildDataIndex[val[i]] = 1;
        }
      }
    }
    this.setData({
      positionChildDataIndex: positionChildDataIndex,
      positionMenu: positionMenu,
      city: this.data.positionData[this.data.positionDataIndex].tag_name
    });
  },
  findIndex(key,value){
    for (var i = 0; i < this.data.filterData[key].length; i++) {
      if (this.data.filterData[key][i].tag_id === value) {
        return i;
      }
    }
  },
  listAjax(o){
    var that = this;
    o.fiterSubmitData.city = appInstance.globalData.city;
    o.fiterSubmitData.pageSize = pageSize;
    if (this.data.options.money_house){
      o.fiterSubmitData.money_house = 1;
    }
    if (o.isPages){//是否是滚动到底部的请求
      loadPage++
    }
    o.fiterSubmitData.curPage = loadPage;
    appInstance.getUtil.ajax({
      data: o.fiterSubmitData,
      isHideLoad: false,
      isContrlHide:true,
      method: 'GET',
      path: '5cff426968259',
      success(res) {
        console.log(res)
        if (res.data.code == 1) {
          isLoading = false;
          // excludeApartment 是否需要排除公寓
          if (!that.data.excludeApartment && !o.fiterSubmitData.originFrom && res.data.data.length > 0){
            that.expandRequest(res.data, o)
          }else{
            wx.hideLoading();
            that.addData(res.data, o);
          }
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    });
  },

  expandRequest(currentData,o){
      let fiterSubmitData = o.fiterSubmitData
      let expandSubmitData = thatObj.data.expandSubmitData
     let apartmentRequestParam = {
         page: fiterSubmitData.curPage,
         perpage: 4,
         city: fiterSubmitData.city,
         area_name: expandSubmitData.area_name, //区域名
         street_name: expandSubmitData.street_name,//街道名
         lease_mode: 0, //出租方式 1整租 2合租
         house_category: 0,//房源类型 0任意，1住宅，2别墅，3写字楼，4商铺，5车库车位，6厂房仓库
         r_rent: "",//租金区间 如：800,1200 无上限是用-1代替 如：10000,-1
         room: 0,//房型 1一室，2两室，3三室，4四室，5五室，6五室以上
         floor: 0,//0任意，1（1层），2（2-5层）,3（6-12）,4（13层以上）
         renovation_id: 0,//0任意，1毛坯，2简装，3精装，4豪华装
         sub_way:expandSubmitData.sub_way,//地铁线路名
         station: expandSubmitData.station,//地铁站名   
     }
     apartmentRequestParam.lease_mode = fiterSubmitData.renttype?  fiterSubmitData.renttype:0
     apartmentRequestParam.house_category = fiterSubmitData.infotype ? fiterSubmitData.infotype : 0
      apartmentRequestParam.room = fiterSubmitData.room ? fiterSubmitData.room : 0
      apartmentRequestParam.renovation_id = fiterSubmitData.fitment ? fiterSubmitData.fitment : 0
      if (fiterSubmitData.price){
          switch (fiterSubmitData.price){
              case 1:
                  apartmentRequestParam.r_rent = "-1,800"
              break
              case 2:
                  apartmentRequestParam.r_rent = "800,1200"
                  break
              case 3:
                  apartmentRequestParam.r_rent = "1200,2000"
                  break
              case 4:
                  apartmentRequestParam.r_rent = "2000,3000"
                  break
              case 5:
                  apartmentRequestParam.r_rent = "3000,5000"
                  break
              case 6:
                  apartmentRequestParam.r_rent = "5000,10000"
                  break
              case 7:
                  apartmentRequestParam.r_rent = "10000,-1"
                  break
          }
      }else{
          if (fiterSubmitData.diy_price_start || fiterSubmitData.diy_price_end){
             apartmentRequestParam.r_rent += fiterSubmitData.diy_price_start ? fiterSubmitData.diy_price_start:"-1"
              apartmentRequestParam.r_rent += ","
              apartmentRequestParam.r_rent += fiterSubmitData.diy_price_end ? fiterSubmitData.diy_price_end : "-1"
          }
      }
      appInstance.getUtil.ajax({
          data: apartmentRequestParam,
          isHideLoad: true,
          method: 'GET',
          path: '5c7cb8dfcc7a5',
          success(res) {
              console.log(res)
              if (res.data.code == 1) {
                 let poolData = []
                  if (res.data.data && res.data.data.data.length != 0){
                      let data = res.data.data.data
                     for (var index in data) {
                         let tempInfo = data[index]
                         let price = ""
                         if (!isNaN(tempInfo.r_rent)) {
                             //是数字
                             price = parseFloat(tempInfo.r_rent) + "元/月"
                         } else {
                             //不是数字
                             price = tempInfo.r_rent.split("-")[0] + "元/月起"
                         }
                         let houseInfoForNewList = {
                             isApartment: true,//是否是公寓房源 
                             owner_real: "0",
                             state: "0",
                             pic: tempInfo.images[0],
                             title:tempInfo.area_name + "-" + tempInfo.xiaoqu_name,
                             renttype: tempInfo.lease_mode_name,
                             room: tempInfo.room,
                             hall: tempInfo.hall,
                             buildarea: parseFloat(tempInfo.r_acreage),
                             fitment: tempInfo.renovation,
                             price: price,
                             district: "",
                             streetname: tempInfo.c_name,
                             auth_type: 0,
                             ispromote: 0,

                             routeUrl: "/pages/detailPages/detailPages?h_id=" + tempInfo.h_id + "&r_id=" + tempInfo.r_id + "&house_comefrom=" + 1 + "&l_id=" + tempInfo.l_id + "&city=" + appInstance.globalData.city
                         }
                      
                         currentData.data.splice(index*6, 0, houseInfoForNewList)
                     }
                     thatObj.addData(currentData, o);
                 }else{
                     thatObj.addData(currentData, o);
                 }
              } else {
                  wx.showToast({
                      title: res.data.msg,
                      icon: 'none',
                      duration: 2000
                  })
              }
          }
      });
  }  ,


  addData(arr,o){
    var listData = o.isPages ? this.data.listData : [];//检查是否是分页请求
    if (!o.isPages){
        this.setData({
            listData: [],
        });
    }
    console.log(arr.data)
    for (var i = 0; i < arr.data.length;i++){
      if (arr.data[i].price.indexOf('*平方米')>-1){
        arr.data[i].price = arr.data[i].price.replace('*平方米','*㎡');
      }
    }
    listData = listData.concat(arr.data);
    this.setData({
      listData: listData,
    });
  },
  /*
    选择区域及地铁监听函数
  */
  showCondition(e){
    this.setData({
      positionMenu: e.currentTarget.dataset.index,
      positionData: this.data.filterData[this.data.positionField[e.currentTarget.dataset.index]["0"]],
      positionDataIndex:0,
      positionChildDataIndex: {}
    });
  },
  /*
    选择地铁或区域位置选项监听函数
  */ 
  selectPositionIndex(e){
    this.setData({
      positionDataIndex: e.currentTarget.dataset.index,
      positionChildDataIndex: {}
    });
  },
  /*
    选择街道监听函数
  */
  selectStreets(e){
    var o = this.data.positionChildDataIndex;
    if (o[e.currentTarget.dataset.id]){
      delete o[e.currentTarget.dataset.id];
      this.setData({
        positionChildDataIndex: o
      });
      return;
    }
    o[e.currentTarget.dataset.id] = 1;
    var num = 0;
    for (var i in o){
      num++;
    }
    if (num > 3){
      delete o[e.currentTarget.dataset.id];
      wx.showToast({
        title: '最多只能选3个街道',
        icon: 'none'
      });
      return;
    }
    this.setData({
      positionChildDataIndex: o
    });
  },
  /*
    确定过滤选项
  */
  filter(e){
    var fiterSubmitData = this.data.fiterSubmitData;
    if (e.currentTarget.dataset.key === 'position') {//位置过滤条件
      this.filterArea(fiterSubmitData);
    }
    if (e.currentTarget.dataset.key === 'rent') {//租金过滤条件
      this.filterRent(fiterSubmitData);
    }
    if (e.currentTarget.dataset.key === 'room') {//户型过滤条件
      this.filterRoom(fiterSubmitData);
    }
    this.setData({
      fiterSubmitData: fiterSubmitData,
      showPopup:'0'
    });
    this.analysisHistory();//记录筛选条件

    loadPage =1;//重置页数为1
    this.showList({});//列表请求
  },
  analysisHistory(){//解析筛选条件
    var o = {
      url : '/taofang-package/pages/house-list/house-list?',
      content :''
    }
    var num = 0;
    for (var i = 0 ; i < needKey.length ; i++){
      if (this.data.fiterSubmitData[needKey[i]]){//检查提交信息是否有数据
        if (this.data.filterData[needKey[i]]){//检查字段是否在筛选字段里
          this.oneLevelContent(o, i);
        } else {
          if (needKey[i] == 'diy_price_start' || needKey[i] == 'diy_price_end'){
            this.priceContent(o,i);
          } else {
            this.twoLevelContent(o, i);
          }
        }
    
        o.url += (o.url[o.url.length - 1] === '?' ? '' : '&') + needKey[i] + '=' + this.data.fiterSubmitData[needKey[i]];
        num++;
      }
    }
    if (num == 0) {
      return;
    }
    o.url += '&content=' + o.content;
    console.log(o.url)
    appInstance.getUtil.putHistory(o.url,appInstance.globalData.city);
  },
  priceContent(o, i){
    var txt = ['元','元以上','元以下'];
    if (this.data.fiterSubmitData.diy_price_start && this.data.fiterSubmitData.diy_price_end){
      if (o.content.indexOf(this.data.fiterSubmitData.diy_price_start + '-' + this.data.fiterSubmitData.diy_price_end + txt[0]) > -1){
        return;
      }
      o.content += (this.data.fiterSubmitData.diy_price_start + '-' + this.data.fiterSubmitData.diy_price_end + txt[0] + '&nbsp;');
    }
    if (this.data.fiterSubmitData.diy_price_start && !this.data.fiterSubmitData.diy_price_end) {
      o.content += (this.data.fiterSubmitData.diy_price_start + txt[1] + '&nbsp;');
    }
    if (!this.data.fiterSubmitData.diy_price_start && this.data.fiterSubmitData.diy_price_end) {
      o.content += (this.data.fiterSubmitData.diy_price_end + txt[2] + '&nbsp;');
    }
  },
  oneLevelContent(o,i){//组装一级数据的内容
    var index = this.data[dataConfig[needKey[i]]];
    o.content += this.data.filterData[needKey[i]][index].tag_name + '&nbsp;';
  },
  twoLevelContent(o, i) {//组装二级数据的内容
    var val = this.data.positionData[this.data.positionDataIndex];
    for (var key in this.data.positionChildDataIndex) {
      var a = needKey[i] === 'streetid' ? 'streets' : needKey[i];
      for (var f = 0; f < val[a].length; f++) {
        if (val[a][f].tag_id === key) {
          o.content += val[a][f].tag_name + '&nbsp;'
        }
      }
    }
  },
  filterArea(fiterSubmitData){
    fiterSubmitData.district = fiterSubmitData.streetid = fiterSubmitData.railway = fiterSubmitData.railPosition = '';
    fiterSubmitData[this.data.positionField1[this.data.positionMenu]['0']]
      = this.data.positionData[this.data.positionDataIndex].tag_id;
    fiterSubmitData[this.data.positionField1[this.data.positionMenu]['1']]
      = this.objToStr(this.data.positionChildDataIndex);
    let area_name = ""
    let street_name = ""
    let station = ""
    let sub_way = ""
    if (this.data.positionData[this.data.positionDataIndex].tag_name != "不限"){
        let tagId = this.data.positionData[this.data.positionDataIndex].tag_id
        if (this.data.positionMenu == 0) {
            area_name = this.data.positionData[this.data.positionDataIndex].tag_name
            for (var index in this.data.filterData.district) {
                if (tagId == this.data.filterData.district[index].tag_id) {
                    for (var subIndex in this.data.filterData.district[index].streets){
                        for (var key in this.data.positionChildDataIndex) {
                            if (key == this.data.filterData.district[index].streets[subIndex].tag_id){
                                if(street_name != ""){
                                    street_name += ","
                                }
                                street_name += this.data.filterData.district[index].streets[subIndex].tag_name
                            }
                        }
                    }
                    break
                 }
            } 
        } else if (this.data.positionMenu == 1) {
            station = this.data.positionData[this.data.positionDataIndex].tag_name
            for (var index in this.data.filterData.railway) {
                if (tagId == this.data.filterData.railway[index].tag_id ) {
                    for (var subIndex in this.data.filterData.railway[index].railPosition) {
                        for (var key in this.data.positionChildDataIndex) {
                            if (key == this.data.filterData.railway[index].railPosition[subIndex].tag_id) {
                                if (sub_way != "") {
                                    sub_way += ","
                                }
                                sub_way += this.data.filterData.railway[index].railPosition[subIndex].tag_name
                            }
                        }
                    }
                    break
                }
            }
        }
    }
   
    this.setData({
      city: this.data.positionData[this.data.positionDataIndex].tag_name === '不限' ? appInstance.globalData.cityList[appInstance.globalData.city] : this.data.positionData[this.data.positionDataIndex].tag_name,
        ['expandSubmitData.area_name']: area_name,
        ['expandSubmitData.street_name']: street_name,
        ['expandSubmitData.station']: station,
        ['expandSubmitData.sub_way']: sub_way,
    });
  },
  filterRent(fiterSubmitData){
    if (this.data.fiterSubmitData.diy_price_start || this.data.fiterSubmitData.diy_price_end){
      fiterSubmitData.price = '';
      this.setData({
        priceIndex:''
      });
      return;
    }
    if (this.data.filterData.price[this.data.priceIndex]){
      var data = this.data.filterData;
      var data1 = this.data.fiterSubmitData;
      data.price = (!data1.infotype || data1.infotype == 1 || data1.infotype == 5 || data1.infotype == 6 || data1.infotype == 7) ? data.price_default : (data1.infotype == 3 ? data.price_office : data.price_store);
      this.setData({
        filterData:data
      });
      fiterSubmitData.price = this.data.filterData.price[this.data.priceIndex].tag_id;
    }
  },
  filterRoom(fiterSubmitData){
    for (var key in dataConfig){
      if (typeof this.data[dataConfig[key]] == 'number'){
        if (this.data.filterData[key]){
          if (this.data.filterData[key][this.data[dataConfig[key]]]) {
            fiterSubmitData[key] = this.data.filterData[key][this.data[dataConfig[key]]].tag_id;
          }
        }
      }
    }
  },
  price(e){//最高价格和最低价格筛选条件输入事件监听
    var fiterSubmitData = this.data.fiterSubmitData;
    if (e.currentTarget.dataset.pricetype === '1'){//最小价格
      fiterSubmitData.diy_price_start = e.detail.value;
    } else if (e.currentTarget.dataset.pricetype === '2'){//最高价格
      fiterSubmitData.diy_price_end = e.detail.value;
    } 
    this.setData({
      fiterSubmitData: fiterSubmitData
    });
  },
  /*遍历对象返回字符串*/
  objToStr(o){
    var arr = [];
    for (var key in o ){
      arr.push(key); 
    }
    return arr.join();
  },
  /*
    重置过滤选项
  */
  reset(e){
    if (e.currentTarget.dataset.key === 'position'){//重置位置过滤条件
      this.setData({
        positionMenu: 0,
        positionData: this.data.filterData.district,
        positionDataIndex: 0,
        positionChildDataIndex: {}
      });
    }
    if (e.currentTarget.dataset.key === 'more') {
      this.setData({
        infotypeIndex:1000,//物业类型
        fitmentIndex:0,//装饰
        specialIndex:0,//特色
        originFromIndex:0,//来源
        rentTypeIndex:0//出租方式
      });
    }
  },
  /*
    是否显示弹窗
  */
  isShowFilterWin(e){
    this.setData({
      showPopup: e.currentTarget.dataset.popup == this.data.showPopup ? '0' : e.currentTarget.dataset.popup
    });
  },
  /*筛选选项监听*/
  filterSelect(e){
    if (e.currentTarget.dataset.property == 'infotypeIndex'){//选择物业类型租金范围会变化，所以重置租金范围选项
      this.setData({
        priceIndex:0,
        [e.currentTarget.dataset.property]: e.currentTarget.dataset.index
      });
      return;
    }
    this.setData({
      [e.currentTarget.dataset.property]: e.currentTarget.dataset.index
    });
  },
  /*选中排序*/
  selectOrder(e){
    var fiterSubmitData = this.data.fiterSubmitData;
    fiterSubmitData.order = e.currentTarget.dataset.value;
    this.setData({
      showPopup:0,
      fiterSubmitData: fiterSubmitData
    });
    loadPage = 1;//重置页数为1
    this.showList({});//列表请求
  },
  onShareAppMessage: function (res) {
    let options = this.data.options;
    let str = '?';
    let arr = Object.entries(options).map((item, index) => {
      return item.join('=');
    });
    str = str + arr.join('&');
    return {
      title: '365租房',
      path: '/taofang-package/pages/house-list/house-list' + str
    };
  },
})