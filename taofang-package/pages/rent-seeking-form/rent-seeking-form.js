// taofang-package//pages/rent-seeking-form/rent-seeking-form.js
import {tracking} from '../../../utils/burying-point.js'
var app = getApp();
var timer;
const getCode = '获取';
const getTime = 60;
var userinfo;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenData:[],//配置信息
    screenIndex:0,//是否是区域？地铁
    screenIndex_1: 0,//选中哪个区域或者几号线
    level_id_1: {},//选中的区域或线路的id
    level_id_2: {},//选中的街道或站点的id
    level_aid_1: {},//选中的区域或线路的id
    level_aid_2: {},//选中的街道或站点的id
    selectionData:[],//选中的数据
    selectionDataSign1:{},//选中项标记
    selectionDataSign2: {},//选中项标记
    renthouse_type:[],//户型信息
    renthouse_type_index: 0,//户型选中项
    sex: [{ sex: '先生', value: 0 }, { sex: '女士', value: 1}],
    sexChoose:'',
    showPopup:0,//弹窗
    isIPX: '',//是否是iphoneX
    areaTxt:{
      defaultTxt:'(选填)多说一些才能更快帮您找到好房哦！',
      fillTxt:''
    },
    screenShow:'',
    publishObj:{},
    phone:'',//页面电话号码
    newPhone:'',//修改的新电话号码
    code:'',//输入的验证码
    codename:'获取',//记时按钮
    infotype:'',
    realname:'',//姓名
    dinstrict:'',
    street:'',
    ss_ids:'',
    sl_ids:'',
    publishObj: {
      detail_content: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(options);
  },
  /*
    初始化页面数据
  */
  initData(options){
    console.log(app)
    var cacheKey = app.getUtil.getUserinfoKey();
    userinfo = app.getUtil.cacheGet(cacheKey);
    this.setData({
      isIPX: app.globalData.isIPX,
      screenData: [
        { data:wx.getStorageSync('njconfig').street,key:'区域' }, 
        { data:wx.getStorageSync('njconfig').metro,key:'地铁'}
      ],
      renthouse_type: wx.getStorageSync('njconfig').renthouse_type,
      phone:userinfo.passport_phone,
      infotype: parseInt(options.infotype)
    });
    console.log(this.data.screenData)
  },
  /**
   * 选择区域
   */
  changeA(e){
    var index = e.currentTarget.dataset.index;
    var key = e.currentTarget.dataset.key;
    this.setData({
      [key]: index,
    });
  },
  changeB(e){
    if (!this.checkValue(e, this.data.screenIndex == 0 ? 'level_id_' :'level_aid_')){
      wx.showToast({
        title:'最多只能选三个街道或者站点！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    this.fillData(e, this.data.screenIndex == 0 ? 'level_id_' : 'level_aid_');//填装数据
    this.pageShowSelection(e);//页面显示选中的数据
  },
  fillData(e, k) {
    var id = e.currentTarget.dataset.id;
    var o = this.data[k + 2];
    var o1 = this.data[k + 1];
    o[id] = this.data.screenIndex_1;
    o1[this.data.screenData[this.data.screenIndex].data[this.data.screenIndex_1].id
      || this.data.screenData[this.data.screenIndex].data[this.data.screenIndex_1].aid] = this.data.screenIndex;
    this.setData({
      [k + 2]: o,
      [k + 1]: o1
    });
  },
  pageShowSelection(e){
    if (this.data.screenIndex === 0){
      this.readyData(this.data.level_id_2, this.data.screenData[0].data,e,1);
    } else {
      this.readyData(this.data.level_aid_2, this.data.screenData[1].data, e, 2);
    }
  },
  readyData(obj, data, e, type){
    var oldObj = this.data['selectionDataSign' + type];
    var otherObj = type === 1 ? 'selectionDataSign2' : 'selectionDataSign1'
    var property = this.data.screenIndex === 0 ? 'title':'name';
    var arr = [];
    var newObj = {};
    for (var key in obj){
      if (oldObj[key]){
        newObj[key] = oldObj[key];
      } else {
        newObj[key] = data[obj[key]][property] + ' ' + e.currentTarget.dataset.txt;
      }
    }
    var o = { ...newObj, ...this.data[otherObj]};
    for (var i in o){
      arr.push(o[i]);
    }
    this.setData({
      ['selectionDataSign' + type]:newObj,
      selectionData:arr
    });
  },
  /**
   * 检查选中的站点是否超过三个
   */
  checkValue(e,k){
    var o = this.data[k+2];
    var id = e.currentTarget.dataset.id;
    var num = 0;
    if (id[0] === '0') {//判断是否是无限选项
      for (var key in o) {
        if (o[key] == id[1]){
          delete o[key];
        }
      }
    } else {
      for (var key in o) {
        if (key[0] === '0' && this.data.screenIndex_1 == key[1]) {//表明在同一行
          delete o[key];
        }
      }
    }
    for (var key in o){
      num++;
    }
    if ( num >= 3 ){
      return false;
    }
    return true;
  },
  /**
   * 重置筛选项
   */
  resetData(){
    var o = {};
    this.setData({
      screenIndex: 0,//是否是区域？地铁
      screenIndex_1: 0,//选中哪个区域或者几号线
      level_id_1: {},//选中的区域或线路的id
      level_id_2: {},//选中的街道或站点的id
      level_aid_1: {},//选中的区域或线路的id
      level_aid_2: {},//选中的街道或站点的id
      selectionData: [],//选中的数据
      selectionDataSign1: {},//选中项标记
      selectionDataSign2: {},//选中项标记
      screenShow:'',
      dinstrict: '',
      street: '',
      ss_ids: '',
      sl_ids: ''
    });
  },
  /**
   * 选择户型
   */
  selHouseType(e){
    var index = e.currentTarget.dataset.index;
    this.setData({
      renthouse_type_index:index
    });
  },
  /**
   * 删除选中项
   */
  deleteScreen(e){
    var v = e.currentTarget.dataset.value;
    var arr = this.data.selectionData;
    for ( var i = 0 ; i < arr.length ; i++){
      if (arr[i] === v){
        arr.splice(i,1);
        break;
      }
    }
    this.deleteSign(v, arr, this.data.selectionDataSign1, 'selectionDataSign1','level_id_2',0);
  },
  deleteSign(v, arr,data,val,val1,type){
    for (var key in data){
      if (data[key] === v){
        delete data[key];
        this.deleteVal(arr, key, val, val1, data, type);
        return;
      }
    }
    this.deleteSign(v, arr, this.data.selectionDataSign2, 'selectionDataSign2', 'level_aid_2',1);
  },
  deleteVal(arr, key, val, val1, data, type){
    var o = this.data[val1];
    var num = o[key];
    delete o[key];
    var o1 = this.deleteVal1(val1.slice(0, val1.length - 1) + 1, num, val1, type);
    this.setData({
      [val]: data,
      selectionData: arr,
      [val1]:o,
      [val1.slice(0, val1.length - 1) + 1]:o1
    });
  },
  deleteVal1(v, num, val, type){
    for (var key in this.data[val]){
      if (this.data[val][key]==num ){
        return this.data[v];
      }
    }
    var id = type === 0 ? 'aid' : 'id';
    var o = this.data[v];
    delete o[this.data.screenData[type].data[num][id]];
    return o;
  },
  /**
   * 展示弹窗
   */
  showPopup(e){
    this.setData({
      showPopup:e.currentTarget.dataset.popup
    });
  },
  /**
   * 确定筛选项
   */
  sure(e){
    this.setData({
      showPopup: e.currentTarget.dataset.popup,
      screenShow: this.data.selectionData.join(';'),
      dinstrict : this.objToStr(this.data.level_id_1),//小区
      street : this.objToStr(this.data.level_id_2),//街道
      ss_ids : this.objToStr(this.data.level_aid_2),//地铁站点
      sl_ids :this.objToStr(this.data.level_aid_1)//地铁线路
    });
  },
  /**
   * 保存描述
   */
  savePublishObj(e) {
    var areaTxt = this.data.areaTxt;
    areaTxt.fillTxt = e.detail_content;
    this.setData({
      areaTxt: areaTxt
    });
  },
  /**
   * 输入新号码
   */
  inputTxt(e){
    var inputType = e.currentTarget.dataset.input;
    this.setData({
      [inputType]: e.detail.value
    });
  },
  /**
   * 获取验证码倒计时
   */
  getCode(e){
    var str = e.currentTarget.dataset.value;
    if (str === getCode){
      this.getCodeAjax()
    }
  },
  timeStart(){
    var s = getTime;
    var that = this;
    timer = setInterval(function(){
      s--;
      if ( s <= 0 ){
        clearInterval(timer);
        var str = getCode;
      } else {
        var str = s + 's';
      }
      that.setData({
        codename:str
      });
    },1000);
  },
  /**
   * 获取验证码
   */
  getCodeAjax() {
    var that = this;
    app.getUtil.ajax({
      path: '5cf0da62e7d2f',
      method: 'GET',
      data: {
        'city': app.globalData.city,
        'mobile': this.data.newPhone,
        'type': '15'
      },
      accessToken: true,
      check: true,
      success: res => {
        if (res.data.code == '1') {
          console.log(res)
          that.timeStart();
          that.setData({
            codename: getTime + 's'
          });
        } else {
          wx.showToast({
            title: res.data.code===-12?'请填写手机号码': res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },
  /*
  确定修改电话号码
  */
  surePhoneAction() {
    app.getUtil.ajax({
      path: '5cf0da7858556',
      method: 'GET',
      check: true,
      data: {
        mobile: this.data.newPhone,
        code: this.data.code,
        type: '15',
        city: app.globalData.city
      },
      success: res => {
        if (res.data.code == '1') {
          console.log(res)
          this.setData({
            showPopup:0,
            newPhone: '',//修改的新电话号码
            code: '',//输入的验证码
            phone: this.data.newPhone
          })
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
  /***
   * 修改性别
  */
  changeSex(e){
    if (this.data.sexChoose !== e.currentTarget.dataset.value){
      var sex = e.currentTarget.dataset.value;
    } else {
      var sex = '';
    }
    this.setData({
      sexChoose: sex
    });
  },
  /***
   * 提交求租信息
  */
  submit(){
    var data = this.resiseData();
    this.submitAjax(data);
    console.log(data)
    //**埋点 */ 
    tracking({pageId:2419,eventType:4},{type:this.data.infotype});
  },
  resiseData(){
    var o = {};
    o.infotype = this.data.infotype;//房屋类型
    o.ss_ids = this.data.ss_ids;//地铁站点
    o.sl_ids = this.data.sl_ids;//地铁线路
    o.phone = this.data.phone;
    o.realname = this.data.realname + ((typeof this.data.sexChoose !== 'number') ? '' : this.data.sex[this.data.sexChoose].sex);
    o.rent_housetype = this.data.renthouse_type[this.data.renthouse_type_index].key;
    o.dinstrict = this.data.dinstrict;//小区
    o.street = this.data.street;//街道
    o.note = this.data.areaTxt.fillTxt ? this.data.areaTxt.fillTxt : '';
    o.passport_uid = userinfo.passport_uid;
    o.city = app.globalData.city;
    o.wechatCode =18;
    return o;
  },
  objToStr(obj){
    var arr = [];
    for (var key in obj){
      if (key[0] == 0){
        break;
      }
      arr.push(key);
    }
    return arr.join(',');
  },
  submitAjax(data){
    app.getUtil.ajax({
      data: data,
      isHideLoad: false,
      isContrlHide: false,
      method: 'POST',
      path: '59914901cd622',
      accessToken: true,
      userinfo:true,
      success(res) {
        console.log(res)
        if (res.data.code == 1) {
          wx.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 2000
          });
          wx.redirectTo({
            url: '/taofang-package/pages/my-publish/my-publish?tabIndex=1',
          });
        } else if (res.data.code == -12){
          wx.showToast({
            title: '请选择区域街道',
            icon: 'none',
            duration: 2000
          })
        }
      }
    });
  }
})