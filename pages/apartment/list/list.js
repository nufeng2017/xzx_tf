//city.js
//获取应用实例
import {tracking} from '../../../utils/burying-point.js'
var appInstance = getApp();
Page({
  data: {
    houseList:false,//列表数据
    screen_view_bg:0,//页面剩余部分高度
    window_heightold:'',
    window_height:'',
    turnState:false,//当前是否显示排序下拉部分
    //当前的页码
    page:1,
    perpage:20,
    total:0,

    selected: {},
    color: {},
    config:{},
    show: {},
    menu: {},
    reload:false,
    keywords: '',
    itemname: '',
    xiaoqu_id: '',
    ss_id: '',
    plate_id: '',
    searchInput:true,
    is_show_index:false,
    ad:{}
  },
  initConfig: function () {
    var selected = { order_by: 'edit_time_desc' };
    var color = {
      order_by: 0,
      room: 0,
      orientation_id: 0,
      acreage: 0,
      renovation_id: 0,
      allview: 0,
      rent: 0,
      lease_mode: 0,
      house_comefrom: 0,
      rent: 0
    };
    var show = {
      'weizhi': false,
      'pinpai': false,
      'zujin': false,
      'more': false,
      'street': false,
      'metro': false
    };
    var menu = {
      'weizhi': '',
      'pinpai':'',
      'zujin': '',
      'more': ''
    };
    this.setData({ selected: selected, color: color, show: show});
  },
  //事件处理函数
  onLoad: function (options) {
    this.initConfig();
    var that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          window_heightold: res.windowHeight - 30 ,
          second_height: res.windowHeight - res.windowWidth / 750 * 80
        })
      }
    })
    // 获取品牌配置数据
    appInstance.getUtil.apiRequest('5c07629e0aaac', 'GET', { city: 'nj' } , function (res) {
      if (res.data.code == '1') {
        var config = that.data.config;
        config.config_apartment = res.data.data;
        that.setData({ config:config})
      }
    },false)
    // 获取globaldata公共配置数据
    var configdata = appInstance.getUtil.copyobj(appInstance.globalData.config);
    var config = {};
    config.lease_mode = configdata.lease_mode;
    config.house_comefrom = ["不限", "公寓", "个人"];
    config.rental_range = configdata.rental_range;
    config.house_type = configdata.house_type;
    config.orientation = configdata.orientation;
    config.acreage = configdata.acreage;
    config.renovation = configdata.renovation;
    config.room_facilities = configdata.room_facilities;
    config.special = configdata.special;
    config.allview = ['不限', '全景看房'];

    config.street = configdata.street;
    config.metro = configdata.metro;
    config.order = configdata.order;
    that.setData({ config: config });

    //搜索传值条件
    var selected = this.data.selected;
    var color = this.data.color;

    //来自搜索公寓
    if (options.c_id && options.companyid) {
      wx.setNavigationBarTitle({title: options.companyid});
      selected.c_id = options.c_id;
      selected.companyid = options.companyid;
      this.setData({ searchInput: false });
    }

    //来自搜索小区
    if (options.xiaoqu_id && options.xname) {
      wx.setNavigationBarTitle({ title: options.xname });
      selected.xiaoqu_id = options.xiaoqu_id;
      this.setData({ searchInput: false });
      wx.hideShareMenu();
    }


    //来自首页,需要穿入selected、color
    if (options.selected) {
      var selected = JSON.parse(options.selected);
      if (selected.rent){
        selected.rent_min = selected.rent.split(",")[0]
        selected.rent_max = selected.rent.split(",")[1]
        delete selected.rent;
      }
    }
    if (options.color) {
      var color = JSON.parse(options.color);
      color.c_ids=[true]
    }
    this.setData({ selected: selected });
    this.setData({ color: color });
    this.initMenu();
    this.showlist()//渲染列表数据

    // appInstance.getUtil.adcom(appInstance.globalData.city, appInstance.getUtil.otherConfig.adId, function (res) {
    //   if (res[0]) that.setData({ ad: res[0] });
    // }); 

    //**埋点 */ 
    tracking({pageId:2422,eventType:1});
  },
  onShareAppMessage: function (res) {
    var title = '365淘房租房';
    var path = '/pages/apartment/list/list?&city=' + appInstance.globalData.city;
    var selected = this.data.selected;
    var color = this.data.color;

    if (selected.c_id && selected.companyid) {
      title = selected.companyid;
      path += '&c_id=' + selected.c_id + '&companyid=' + selected.companyid;
    }
    selected = JSON.stringify(selected);
    color = JSON.stringify(color);
    path += '&selected=' + selected + '&color=' + color;
    return appInstance.getShareReturn(title, path);
  },
  //渲染列表方法
  showlist: function (){
    if (this.data.page > 1 && this.data.total <= this.data.perpage*this.data.page) return false;
    var that = this;
    var data = { 'city': appInstance.globalData.city };
    var selected = this.data.selected;
    for (let key in selected) {
      if (key == 'facilities' || key == 'special' || key == 'plate_id' || key == 'ss_id'){
        data[key] = selected[key].toString();
      }else if(key == 'rent_min' || key == 'rent_max'){
        var min='-1';
        var max = '-1';
        if (selected.rent_min > 0) min = selected.rent_min;
        if (selected.rent_max > 0) max = selected.rent_max;
        var rent = min + ',' + max;
        if (rent != '-1,-1'){
          data['rent'] = rent;
        }
      } else{
        data[key] = selected[key];
      }
    } 
    data.page = this.data.page;//页码
    data.perpage = this.data.perpage;//页码
    var isHideLoad = data.page == 1?true:false;
    var isContrlHide = data.page == 1 ? true : false;
    appInstance.getUtil.apiRequest('5c00ab56b98db', 'GET', data, function (res) {
      if (res.data.code == '1') {
        var oldHouseList = that.data.houseList;
        var houseList = res.data.data.data;
        houseList.forEach(function (val, index, arr) {
          arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key,val.house_comefrom);
        });
        if (that.data.page > 1){
          houseList = oldHouseList.concat(houseList);
        }else{
          that.setData({ total: res.data.data.total});
          if (res.data.data.total > 0) {
            wx.showToast({
              title: '共找到' + res.data.data.total + '套房源',
              icon: 'none',
              duration: 2000
            })
          }
        }
        that.setData({ houseList: houseList });
      }
    }, isHideLoad, isContrlHide);
  },
  //onshow
  onShow: function () {
    var current = getCurrentPages();
    if (current.length == 1) this.setData({ is_show_index: true });
    if(this.data.reload){
      this.initConfig();
      var selected = this.data.selected;
      var color = this.data.color;
      if (this.data.itemname) {
        selected.itemname = this.data.itemname;
        this.setData({ keywords: this.data.itemname });
      }
      if (this.data.xiaoqu_id) {
        selected.xiaoqu_id = this.data.xiaoqu_id;
      }
      if (this.data.plate_id) {
        selected.plate_id = new Array();
        selected.plate_id.push(this.data.plate_id);
      }
      if (this.data.ss_id) {
        selected.ss_id = new Array();
        selected.ss_id.push(this.data.ss_id);
      }
      this.setData({ selected: selected });
      this.setData({ color: color });
      this.initMenu();
      this.setData({page:1});
      this.showlist()//渲染列表数据
    }
  },
  //排序问题
  showturnPopup:function(){
    var that = this;
    that.setData({ turnState: true, window_height: that.data.window_heightold })
  },
  closeturnPopup:function(){
    this.setData({ turnState: false, window_height:''})
  },
  //切换排序方法
  addturn:function(e){
    var selected = this.data.selected;
    selected.order_by = e.currentTarget.dataset.value;
    this.setData({ selected: selected });
    var color = this.data.color;
    color.order_by = e.currentTarget.dataset.index;
    this.setData({ color: color });
    this.setData({ page: 1 });
    this.showlist()//渲染列表数据
  },
  //展开筛选条件下拉
  showCondition:function(e){
    var that = this;
    var key = e.currentTarget.dataset.key;
    var show = that.data.show;
    switch (key){
      case 'weizhi':
        show.weizhi = show.weizhi == true?false:true;
        show.street = show.metro == true?false:true;
        show.metro = show.street == true?false:true;
        show.pinpai = false;
        show.zujin = false;
        show.more = false;
        break;
      case 'street':
        show.street = true;
        show.metro = false;
        break;
      case 'metro':
        show.metro = true;
        show.street = false;
        break;
      case 'pinpai':
        show.weizhi = false;
        show.pinpai = show.pinpai == true ? false : true;
        show.zujin = false;
        show.more = false;
        break;
      case 'zujin':
        show.weizhi = false;
        show.pinpai = false;
        show.zujin = show.zujin == true?false:true;
        show.more = false;
        break;
      case 'more':
        show.weizhi = false;
        show.pinpai = false;
        show.zujin = false;
        show.more = show.more == true?false:true;
        break;
    }
    if (that.data.show.weizhi == true || that.data.show.pinpai == true || that.data.show.zujin == true || that.data.show.more == true ) {
      that.setData({ window_height: that.data.window_heightold })
    } else {
      that.setData({ window_height: '' })
    }
    that.setData({ show: show })
  },
  clickSelected: function (e) {
    var selected = this.data.selected;
    var color = this.data.color;
    var show = this.data.show;

    //区属
    if (e.currentTarget.dataset.key == 'area_id') {
      selected.area_id = e.currentTarget.dataset.value;
      color.area_id = e.currentTarget.dataset.index;
      //清空街道
      delete selected.plate_id;
      delete color.plate_id;

      //清空地铁
      delete selected.sl_id;
      delete color.sl_id;

      //清空站点
      delete selected.ss_id;
      delete color.ss_id;
    }

    //街道
    if (e.currentTarget.dataset.key == 'plate_id') {
      var plate_id = selected.plate_id || [];
      var index = plate_id.indexOf(e.currentTarget.dataset.value);
      if ('-1' == index) {
        if (plate_id.length >= 3) {
          wx.showToast({
            title: '最多选择三项',
            icon: 'none',
            duration: 1500
          })
          return false;
        }
        plate_id.unshift(e.currentTarget.dataset.value);
      } else {
        plate_id.splice(index, 1);
      }
      selected.plate_id = plate_id;

      var temp = [];
      plate_id.forEach(function (val, index, arr) {
        temp[val] = true;
      })
      color.plate_id = temp;
    }

    //地铁线路
    if (e.currentTarget.dataset.key == 'sl_id') {
      selected.sl_id = e.currentTarget.dataset.value;
      color.sl_id = e.currentTarget.dataset.index;

      //清空站点
      delete selected.ss_id;
      delete color.ss_id;

      //清空区属
      delete selected.area_id;
      delete color.area_id;

      //清空街道
      delete selected.plate_id;
      delete color.plate_id;
    }

    //地铁站点
    if (e.currentTarget.dataset.key == 'ss_id') {
      var ss_id = selected.ss_id || [];
      var index = ss_id.indexOf(e.currentTarget.dataset.value);
      if ('-1' == index) {
        if (ss_id.length >= 3) {
          wx.showToast({
            title: '最多选择三项',
            icon: 'none',
            duration: 1500
          })
          return false;
        }
        ss_id.unshift(e.currentTarget.dataset.value);
      } else {
        ss_id.splice(index, 1);
      }
      selected.ss_id = ss_id;

      var temp = [];
      ss_id.forEach(function (val, index, arr) {
        temp[val] = true;
      })
      color.ss_id = temp;
    }

    //租金
    if (e.currentTarget.dataset.key == 'rental_range') {
      var min = e.currentTarget.dataset.min;
      var max = e.currentTarget.dataset.max;
      selected.rent_min = min > 0 ? min : '';
      selected.rent_max = max > 0 ? max : '';
      color.rent = e.currentTarget.dataset.index;
    }

    if (e.currentTarget.dataset.key == 'rental_range_min') {
      if (e.detail.value > 0) {
        selected.rent_min = e.detail.value;
        delete color.rent;
      }else{
        selected.rent_min = '';
      }
    }

    if (e.currentTarget.dataset.key == 'rental_range_max') {
      if (e.detail.value > 0) {
        selected.rent_max = e.detail.value;
        delete color.rent;
      } else {
        selected.rent_max = '';
      }
    }

    //面积
    if (e.currentTarget.dataset.key == 'acreage') {
      var acreage = e.currentTarget.dataset.value;
      if (acreage == '-1,-1'){
        delete selected.acreage
      }else{
        selected.acreage = acreage;
      }
      color.acreage = e.currentTarget.dataset.index;
    }

    //品牌
    if (e.currentTarget.dataset.key == 'apartment_companyid') {
      var compenyidOld = selected.c_ids ;
      var compenyid;
      if (compenyidOld == "" || compenyidOld == null || compenyidOld == undefined){
        compenyid = [];
      }else{
        var aa = compenyidOld.toString();
        compenyid = aa.split(',')
      }
      if (e.currentTarget.dataset.value == 0){
        delete selected.c_ids;
        delete color.c_ids;
        color.c_ids = [];
        color.c_ids.unshift(true)
      }else{
        var index = compenyid.indexOf(e.currentTarget.dataset.value);
        if (index == '-1') {
          compenyid.unshift(e.currentTarget.dataset.value)
        } else {
          compenyid.splice(index, 1);
        }
        selected.c_ids = compenyid.join(',');

        var temp = [];
        compenyid.forEach(function (val, index, arr) {
          temp[val] = true;
        })
        color.c_ids = temp;
      }
    }

    this.setData({ selected: selected });
    this.setData({ color: color });
  }, 

  //重置下拉按钮
  reset:function(e){
    var that = this;
    var key = e.currentTarget.dataset.key;
    if (key == 'weizhi'){
      var selected = this.data.selected;
      delete selected.area_id;
      delete selected.plate_id; 
      delete selected.sl_id;
      delete selected.ss_id;
      var color = this.data.color;
      delete color.area_id;
      delete color.plate_id;
      delete color.sl_id;
      delete color.ss_id;
      this.setData({ selected: selected });
      this.setData({ color: color });
    } else if (key == 'more') {
      var selected = this.data.selected;
      delete selected.room;
      delete selected.orientation_id;
      delete selected.acreage;
      delete selected.renovation_id; 
      delete selected.facilities; 
      delete selected.special; 
      delete selected.allview; 
      var color = this.data.color;
      color.room = 0;
      color.orientation_id = 0;
      color.acreage = 0;
      color.renovation_id = 0;
      delete color.facilities;
      delete color.special;
      color.allview = 0; 
      this.setData({ selected: selected });
      this.setData({ color: color });
    } else if (key == 'pinpai') {
      var selected = this.data.selected;
      var color = this.data.color;
      delete selected.c_ids;
      delete color.c_ids;
      color.c_ids = [];
      color.c_ids.unshift(true);
      this.setData({ selected: selected,color:color });
    }
  },
  //点击下拉确认按钮搜索列表内容
  interlist:function(e){
    var show = this.data.show;
    show.pinpai = false;
    show.weizhi = false;
    show.zujin = false;
    show.more = false;
    this.setData({ window_height: '' })
    this.setData({ show: show});
    //计算默认值
    this.initMenu();
    //初始化列表
    this.setData({ page:1});
    this.showlist();
  },
  initMenu: function () {
    var selected = this.data.selected;
    var menu = this.data.menu;

    menu.zujin = '';
    if (selected.rent_min > 0 || selected.rent_max > 0) {
      if (selected.rent_min > 0 && selected.rent_max > 0) {
        menu.zujin = selected.rent_min + '-' + selected.rent_max + '元';
      } else if (selected.rent_min > 0) {
        menu.zujin = selected.rent_min + '元以上';
      } else if (selected.rent_max > 0) {
        menu.zujin = selected.rent_max + '元以下';
      }
    }

    menu.more = '';
    var acreage = (selected.acreage || '').split(',');
    if (acreage.length != 0){
      if (acreage[0] > 0 && acreage[1] > 0) {
        menu.more = acreage[0] + '-' + acreage[1] + '㎡';
      } else if (acreage[0] > 0) {
        menu.more = acreage[0] + '㎡以上';
      } else if (acreage[1] > 0) {
        menu.more = acreage[1] + '㎡以下';
      }
    }
    
    menu.weizhi = '';
    if (selected.area_id > 0) {
      this.data.config.street.forEach(function (val, index, arr) {
        if (val['aid'] == selected.area_id) {
          menu.weizhi = val['title'];
          if (selected.plate_id && selected.plate_id.length > 0) {
            var plate_id = selected.plate_id[0];
            val._child.forEach(function (v, i, a) {
              if (v['aid'] == plate_id) {
                menu.weizhi = v['title'];
              }
            });
          }
        }
      })
    }
    if (selected.sl_id > 0) {
      this.data.config.metro.forEach(function (val, index, arr) {
        if (val['id'] == selected.sl_id) {
          menu.weizhi = val['name'];
          if (selected.ss_id && selected.ss_id.length > 0) {
            var ss_id = selected.ss_id[0];
            val.station.forEach(function (v, i, a) {
              if (v['id'] == ss_id) {
                menu.weizhi = v['name'];
              }
            });
          }
        }
      })
    }
    this.setData({ menu: menu });
  },
  //上滑加载下一页列表数据
  onReachBottom:function(){
    var page = this.data.page;
    page += 1;
    this.setData({page: page})
    this.showlist()//渲染列表数据
  },
})
