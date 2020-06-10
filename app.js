//app.jsvar
var util = require('./utils/util.js');
var aldstat = require("./utils/ald-stat.js");

//im系统引入
import WeAppRedux from './redux/index.js';
import createStore from './redux/createStore.js';
import reducer from './store/reducer.js';
import ENVIRONMENT_CONFIG from './config/envConfig.js'
import PAGE_CONFIG from './config/pageConfig.js'
const { Provider } = WeAppRedux;
const store = createStore(reducer) // redux store
App(Provider(store)({
  onLaunch: function (e) {
    var that = this;
    var local = util.cacheGet('local');
    this.globalData.city = 'nj';
    this.globalData.cityname ='南京';
    wx.checkSession({
      fail: function () {
        wx.removeStorageSync('changeUid'); 
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.indexOf('iPhone X') > -1) {
          that.globalData.isIPX = true;
        }
      }
    })

    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    let systemInfo = wx.getSystemInfoSync()
    this.globalData.videoContainerSize = {
      width: systemInfo.windowWidth,
      height: systemInfo.windowHeight
    }
    this.globalData.isPushBeCallPage = false
  },
  onShow: function (options) {
    var that = this;
    var scene = decodeURIComponent(options.query.scene);
    if (scene) {
      var sceneArr = scene.split('_');
      if (sceneArr.length == 5) {
        options.query.city = sceneArr[4];
      }
    }
    this.changeCity(options.query.city);
    if (options.scene == 1007 || options.scene == 1008) {
      try {
        this.globalData.netcall && this.globalData.netcall.destroy()
        this.globalData.nim && this.globalData.nim.destroy({
          done: function () {
          }
        })
      } catch (options) {
      }
    }
    
  },
  changeCity:function(city){
    var that = this;
    if (city && city != this.globalData.city) {
      that.globalData.city = city;
      var data = { 'city': city };
      util.apiRequest('5a14d60574204', 'GET', data, function (res) {
        if (res.data.code == '1') {
          var local = {};
          res.data.data.forEach(function (val, index, arr) {
            if (val.city == city) {
              local.city = val.city;
              local.cityname = val.city_name;
            }
          })
          util.cachePut('local', local);
          that.globalData.city = local.city;
          that.globalData.cityname = local.cityname;
          that.getConfig();
        }
      });
    } else {
      this.getConfig();
    }
  },
  getShareReturn: function (title, path, imageUrl){
    var obj = {};
    obj.title = title;
    obj.path = path;
    if (imageUrl)  obj.imageUrl = imageUrl;
    return obj;
  },
  getConfig: function (){
    var that = this;
    var city = this.globalData.city;

    let promise = new Promise(function (resolve) {
      var cacheKey = city + 'config';
      var config = util.cacheGet(cacheKey);
      if (config) {
        that.globalData.config = config;
        resolve(config);
      } else {
        var data = { 'city': city };
        util.apiRequest('58c8fdaa79e80', 'GET', data, function (res) {
          if (res.data.code == '1') {
            var config = res.data.data;
            that.globalData.config = config;
            util.cachePut(cacheKey, config, 7200);
            resolve(config);
          }
        });
      }
    });
    return promise;
  },
  formatSpecial: function (special, limit, business_key, house_comefrom){
    var limit = limit || 0;
    var that = this;
    var specialArr = new Array();
    if (special) specialArr = special.split(',');
    var res = new Array();
    if (specialArr.length > 0) {
      specialArr.forEach(function (val, index, arr) {
        var id = val;
        if (that.globalData.config.special) {
          that.globalData.config.special.forEach(function (v, i, a) {
            if (v['key'] == val) res[index] = v['value'];
          });
        }
      });
    }
    if (business_key && business_key == 999){
      res.unshift('爱租月付');
    }
    if (house_comefrom) {
      if (house_comefrom == '1') res.unshift('公寓');
      if (house_comefrom == '2') res.unshift('个人好房');
    }
    return limit>0?res.slice(0, limit):res;
  },
  globalData: {
    userinfo:{},
    from:'6',
    city: 'nj',
    cityname: '南京',
    config: {}, //业务相关配置数据，已初始化,尽量使用appInstance.getConfig(function())回调避免异步问题
    isIPX:false,
    unit: {
      '0': '元/月',
      '1': '元/月',
      '2': '元/天*㎡',
      '3': '元/天'
    },
    cityList:{
      'nj':'全南京',
      'sh':'全上海',
      'hf':'全合肥'
    },
    equipment:{
      '床':'/taofang-package/img/detail/chuang.png',
      '冰箱':'/taofang-package/img/detail/bingxiang.png',
      '电视': '/taofang-package/img/detail/dianshi.png',
      '空调': '/taofang-package/img/detail/kongtiao.png',
      '洗衣机': '/taofang-package/img/detail/xiyiji.png',
      '热水器': '/taofang-package/img/detail/reshuiqi.png',
      '家具': '/taofang-package/img/detail/jiaju.png',
      '宽带': '/taofang-package/img/detail/kandai.png',
      '可做饭': '/taofang-package/img/detail/fan.png',
      '独立卫生间': '/taofang-package/img/detail/toilet.png',
      '客梯': '/taofang-package/img/detail/keti.png',
      '货梯': '/taofang-package/img/detail/huoti.png',
      '电梯': '/taofang-package/img/detail/keti.png',
      '暖气': '/taofang-package/img/detail/nuanqi.png',
      '停车位': '/taofang-package/img/detail/park.png',
      '水': '/taofang-package/img/detail/water.png',
      '燃气': '/taofang-package/img/detail/ranqi.png',
      '煤气/天然气': '/taofang-package/img/detail/ranqi.png',
      '网络': '/taofang-package/img/detail/net.png',
      '办公家具': '/taofang-package/img/detail/bangongjiaju.png',
      '淋浴': '/taofang-package/img/detail/linyu.png',
      '扶梯': '/taofang-package/img/detail/futi.png',
      '地下室':'/taofang-package/img/detail/underRoom.png',
      '电':'/taofang-package/img/detail/dian.png',
      '电话':'/taofang-package/img/detail/phone.png',
      '阁楼':'/taofang-package/img/detail/topRoom.png',
      '露台':'/taofang-package/img/detail/lutai.png',
      '沙发':'/taofang-package/img/detail/safa.png',
      '微波炉':'/taofang-package/img/detail/weibolu.png',
      '阳台':'/taofang-package/img/detail/yangtai.png',
      '衣柜':'/taofang-package/img/detail/yigui.png',
      '有限电视':'/taofang-package/img/detail/youxiandianshi.png',
      '可明火': '/taofang-package/img/detail/minghuo.png',
      '上水': '/taofang-package/img/detail/shangshui.png',
      '下水': '/taofang-package/img/detail/xiashui.png',
      '380V': '/taofang-package/img/detail/380v.png',
      '智能门锁': '/taofang-package/img/detail/suo.png'
    },
    emitter: null,
    netcallController: null,
    ENVIRONMENT_CONFIG,
    PAGE_CONFIG
  },
  fn:{//一些公用的函数
    deepClone:function(obj){//深克隆对象
      var o = {};
      var str = JSON.stringify(obj);
      o = JSON.parse(str);
      return o;
    },
  },
  getUtil: util
}));
