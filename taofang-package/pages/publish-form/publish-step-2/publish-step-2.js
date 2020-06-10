var app = getApp();
var that;
var publish = true;
var lastPage;
var publishObj;
var houseTypeKey;
var houseType;
var house_mating;

var timer; //验证码
var timer2; //联系人
var timer3; //成功后弹框

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showHouseEquipment: false,
    publish: false,
    houseTypeKey: '',
    equipment: [],
    selected: {},
    publishObj: {},
    notice: '详细的描述会大大增加快速出租的机会！可以介绍交通和周边环境，入住时间，对租客的要求等提升吸引力。',
    sex: ['先生', '女士'],
    sexChoose: '先生',
    showPhone: false,
    isIPX: '',
    mobile: '',
    code: '',
    codename: '获取',
    codedisable: false,
    showSuccess: false,
    isToVertify: true, //没有实名认证
    isShowModel: 'hide',
    popupSelIndex: 0,//弹窗选择
    popupSelItem: ['看房时间', '入住时间'],
    years: [],
    months:[],
    days: [],
    value: [0,1,1],//入住时间picker value
    value1: [0],//看房时间picker value
    look_house_time: wx.getStorageSync('initConfig')?Object.values(wx.getStorageSync('initConfig').look_house_time_map):'',
    house_special: wx.getStorageSync('initConfig')?Object.values(wx.getStorageSync('initConfig').house_special_map):'',
    rental_condition: wx.getStorageSync('initConfig')?Object.values(wx.getStorageSync('initConfig').rental_condition_map):'',
    now_time:''
  },

  bindChange(e) {
    const val = e.detail.value;
    this.setData({
      [this.data.popupSelIndex == 0 ? 'value1' : 'value']: val
    });
  },
  getAuth() {

    let changeUid = app.getUtil.cacheGet("changeUid");
    if (changeUid) {
      app.getUtil.checkAuthentication(app.globalData.city, function (result) {
        // isVerified: result.auth
        that.setData({
          isShowVerified: !result.auth
        })

      })
    } else {
      that.setData({
        isShowVerified: true
      })
    }

  },

  onUnload() {
    lastPage.setData({
      publishObj: this.data.publishObj
    })
  },
  onShow(){
    this.setDate();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isIPX: app.globalData.isIPX
    });
    this.setDate();
    that = this
    let pages = getCurrentPages();
    lastPage = pages[pages.length - 2]; //上一个页面
    publishObj = lastPage.data.publishObj
    publish = lastPage.data.publish //true：发布 false:编辑
    houseType = lastPage.data.houseType;
    houseTypeKey = lastPage.data.houseTypeKey; // 缓存数据的key
    house_mating = publishObj.house_mating
    publishObj.house_special = publishObj.house_special ? publishObj.house_special : [];
    publishObj.rental_condition = publishObj.rental_condition ? publishObj.rental_condition : [];
    var cacheKey = app.getUtil.getUserinfoKey();
    let userinfo = app.getUtil.cacheGet(cacheKey);
    if (publishObj.phone == '') {

      publishObj.phone = userinfo.passport_phone

    }

    var temp = {};
    house_mating.forEach(function (val, index, arr) {
      temp[val] = true;
    })

    wx.setNavigationBarTitle({
      title: houseType,
    })

    let equipment = []
    let showHouseEquipment = false
    if (houseType == "住宅") {

      equipment = app.getUtil.cacheGet('initConfig').house_equipment_map["1"]
      showHouseEquipment = true

    } else if (houseType == "别墅") {

      showHouseEquipment = true,
        equipment = app.getUtil.cacheGet('initConfig').house_equipment_map["2"]

    } else if (houseType == "商铺") {

      showHouseEquipment = true,
        equipment = app.getUtil.cacheGet('initConfig').house_equipment_map["3"]
      var obj = app.getUtil.cacheGet('initConfig').special_map['4'];
      equipment = equipment.concat(Object.values(obj));

    } else if (houseType == '写字楼') {

      showHouseEquipment = true,
        equipment = app.getUtil.cacheGet('initConfig').house_equipment_map["4"]
    }

    let sex = '先生'
    if (publishObj.contact.indexOf("女士") > -1) {


      sex = '女士'

    }

    // if(publishObj.title==''){
    let rent_type = ''
    let roomType = ''
    if (publishObj.rent_type == '1') {
      rent_type = "整租"
    } else if (publishObj.rent_type == '2') {
      rent_type = "合租"
    }

    if (publishObj.room != '' && publishObj.room != '0室') {
      roomType = publishObj.room + '室' + publishObj.hall + '厅' + publishObj.toilet + '卫'
    }
    var title;
    if (publishObj.title){
      title = publishObj.title
    } else {
      title = publishObj.block_name + roomType + publishObj.build_area + '平米' + rent_type + publishObj.fitment_name
    }
    // }
    let timeVal = this.getTimeVal(publishObj);//获取默认的时间
    this.setData({
      selected: temp,
      showHouseEquipment: showHouseEquipment,
      equipment: equipment,
      publishObj: publishObj,
      publish: publish,
      houseTypeKey: houseTypeKey,
      sexChoose: sex,
      value1: publishObj.look_house_time?[publishObj.look_house_time - 1]:[0],
      value: timeVal 
    })

    this.editePushObj(houseTypeKey)
    this.getAuth()
  },
  setDate(){
    const date = new Date();
    const years = [];
    const months = [];
    const days = [];
    for (let i = date.getFullYear(); i <= date.getFullYear() + 1; i++) {
      years.push(i)
    }

    for (let i = 1; i <= 12; i++) {
      months.push(i)
    }

    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    this.setData({
      years:years,
      months: months,
      days: days
    });
  },
  getTimeVal(publishObj){
    let time;
    if (typeof publishObj.checkin_time === 'string' && publishObj.checkin_time.length>0){
      time = publishObj.checkin_time.replace(/-/g, '/');
    } else {
      time = new Date();
    }
    let y = new Date(time).getFullYear();
    let m = new Date(time).getMonth() + 1;
    let d = new Date(time).getDate();
    let year = 0;
    let month = 1;
    let day = 1;
    this.data.years.map((item,index)=>{
      if (y == item){
        year = index;
      }
    })
    this.data.months.map((item, index) => {
      if (m == item) {
        month = index;
      }
    })
    this.data.days.map((item, index) => {
      if (d == item) {
        day = index;
      }
    })
    return [year,month,day];
  },
  changePopupSelItem(e) {
    this.setData({
      popupSelIndex: e.currentTarget.dataset.index
    })
  },
  editePushObj(key) { //当为发布时 保存数据
    key = houseTypeKey;
    if (publish) {

      let arr = app.getUtil.cacheGet(key)
      for (let index in arr) { //找到对应的
        if (arr[index].uid == this.data.publishObj.uid) {
          arr.splice(index, 1, this.data.publishObj)

          break;
        }
      }
      app.getUtil.cachePut(key, arr)
    }
  },
  changeTitle(e) {

    let title = "publishObj.title"


    this.setData({
      [title]: e.detail.value
    })

    publishObj.title = e.detail.value

    this.editePushObj(houseTypeKey)
  },

  addItem(e) {


    let item = e.currentTarget.dataset.item

    let index = house_mating.indexOf(item)


    if ('-1' == index) {
      house_mating.unshift(item)

    } else {
      house_mating.splice(index, 1);
    }

    publishObj.house_mating = house_mating

    var temp = {};
    house_mating.forEach(function (val, index, arr) {
      temp[val] = true;
    })


    this.setData({
      publishObj: publishObj,
      selected: temp,
    })


    this.editePushObj(houseTypeKey)



  },
  changeSex(e) {

    let contact = this.data.publishObj.contact
    if (contact.length > 0) {
      contact = contact.substring(0, contact.length - 2) + e.currentTarget.dataset.txt
    }
    publishObj.contact = contact


    this.setData({
      sexChoose: e.currentTarget.dataset.txt,
      publishObj: publishObj

    })

  },

  //房源描述写好后保存
  savePublishObj() {
    publishObj = this.data.publishObj

  },

  changeContact(e) {
    var that = this;
    let value = e.detail.value
    value = value.replace(/['先生'|'女士']/g, '')

    if (value.length > 5) {
      value = value.substring(0, 5)
    }

    publishObj.contact = value
    that.setData({
      publishObj: publishObj
    });


    if (value != '') {
      clearTimeout(timer2)
      publishObj.contact = value + this.data.sexChoose
      timer2 = setTimeout(function () {

        that.setData({
          publishObj: publishObj
        });

        that.editePushObj(houseTypeKey)
      }, 1000);
    }
  },

  changePhone() {
    this.setData({
      showPhone: true
    })
  },

  getCode() {

    if (this.data.codedisable) return false;
    if (!this.check()) return false;

    var that = this;
    app.getUtil.ajax({
      path: '5cf0da62e7d2f',
      method: 'GET',
      data: {
        'city': app.globalData.city,
        'mobile': this.data.mobile,
        type: '15'
      },
      accessToken: true,
      check: true,
      success: res => {

        if (res.data.code == '1') {
          wx.showToast({
            title: '验证码已发送，请注意查收',
            icon: 'none',
            duration: 3000,
            success: function () {
              that.codeSuccess();
            }
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

  check: function () {

    if (this.data.mobile.length != 11) {
      wx.showToast({
        title: '请输入正确的11位手机号码',
        icon: 'none',
        duration: 1000
      })

      return false;
    }



    return true;
  },



  cancelAction() {

    clearInterval(timer);
    this.setData({
      codedisable: false,
      showPhone: false,
      codename: '获取',
      mobile: '',
      code: ''
    })

  },

  checkCode() {

    if (this.data.mobile.length != 11) {
      wx.showToast({
        title: '请输入正确的11位手机号码',
        icon: 'none',
        duration: 1000
      })

      return false;
    }

    if (this.data.code.length < 4) {
      wx.showToast({
        title: '请输入正确的验证码',
        icon: 'none',
        duration: 1000
      })

      return false;
    }

    return true
  },

  surePhoneAction() {

    if (this.checkCode()) {

      app.getUtil.ajax({
        path: '5cf0da7858556',
        method: 'GET',
        check: true,
        data: {
          mobile: this.data.mobile,
          code: this.data.code,
          type: '15',
          'city': app.globalData.city
        },
        success: res => {
          if (res.data.code == '1') {
            clearInterval(timer);
            publishObj.phone = that.data.mobile
            this.setData({
              showPhone: false,
              publishObj: publishObj,
              mobile: '',
              code: '',
              codedisable: false,
              codename: '获取'

            })

            that.editePushObj(houseTypeKey)

          }

          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }

      })

    }

  },
  //新手机号
  inputNewPhone(e) {

    this.setData({
      'mobile': e.detail.value
    });

  },
  // 验证码
  changeCode(e) {
    this.setData({
      'code': e.detail.value
    });
  },

  //验证码已发送倒计时
  codeSuccess: function () {

    this.setData({
      codedisable: true
    })
    var that = this;
    var i = 61;
    timer = setInterval(function () {
      i -= 1;
      if (i < 1) {
        that.setData({
          'codename': '获取'
        });

        that.setData({
          codedisable: false
        })
        clearInterval(timer);
      } else {
        that.setData({
          'codename': i + 's'
        });
      }
    }, 1000);
  },

  checkData() {

    let result = true;
    if (this.data.publishObj.title == '') {

      result = false;

      wx.showToast({
        title: '请输入房源标题',
        icon: 'none',
        duration: 3000
      })
    } else if (this.data.publishObj.detail_content == '') {
      result = false;

      wx.showToast({
        title: '请输入房源描述',
        icon: 'none',
        duration: 3000
      })
    } else if (this.data.publishObj.contact == '') {

      result = false;

      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none',
        duration: 3000
      })

    } else if (this.data.publishObj.phone == '') {

      result = false;

      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 3000
      })
    }


    return result

  },

  sureAction() { //发布

    // http://newrent.house365.com/proxy-route-tag/publish/post-rent （post）
    // 额外字段：  scenario: api  （场景标识） 

    if (this.checkData()) {

      let house_property = JSON.stringify(publishObj.house_property)
      publishObj.house_property = house_property
      if (publishObj.city == '') {
        publishObj.city = app.globalData.city
      }


      app.getUtil.ajax({
        path: '5cecf94630a2e?city=' + app.globalData.city, //'proxy-route-tag/publish/post-rent',
        method: 'POST',
        check: true,
        data: publishObj,
        success: res => {

          if (res.data.code == '1') {

            //清除本地保存的
            this.clearPushObj(houseTypeKey)

            that.setData({
              showSuccess: true
            })

            timer3 = setTimeout(function () {
              that.setData({
                showSuccess: false
              });

              wx.navigateTo({
                url: '/taofang-package/pages/my-publish/my-publish',
              })


            }, 2000);




          } else {

            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }

        },
        fail: error => {


        }



      })
    }
  },

  reset() {
    wx.showModal({
      title: '',
      content: '确认重置？',
      confirmText: "确认",
      confirmColor: "#ff9000",
      cancelText: "取消",
      success: res => {
        if (res.confirm) {

          publishObj.title = '';
          publishObj.house_mating = [];
          publishObj.detail_content = '';
          publishObj.contact = '';
          publishObj.phone = '';
          house_mating = [];
          publishObj.look_house_time = '';//看房时间
          publishObj.checkin_time = '';//入住时间
          publishObj.rental_condition = [];
          publishObj.house_special = [];

          this.setData({
            publishObj: publishObj,
            selected: {}
          })

          this.editePushObj(houseTypeKey)
        }
      }
    })


  },
  isShowModel(e) {
    var o = {
      isShowModel: e.currentTarget.dataset.isshow,
      popupSelIndex: e.currentTarget.dataset.index !== undefined ? e.currentTarget.dataset.index : this.data.popupSelIndex
    }
    this.setData(o);
  },
  clearPushObj(key) { //当为发布时 保存数据

    //发布情况下删除本地数据
    if (this.data.publish) {
      let arr = app.getUtil.cacheGet(key)
      for (let index in arr) { //找到对应的
        if (arr[index].uid == this.data.publishObj.uid) {
          arr.splice(index, 1)
          break;
        }
      }
      app.getUtil.cachePut(key, arr)
    }

    //清空pulishObj
    publishObj.block_name = '';

    publishObj.district = ''; //区属
    publishObj.street_id = ''; //版块
    publishObj.street = '';
    publishObj.room = '';
    publishObj.hall = '';
    publishObj.toilet = '';
    publishObj.floor = ''; //单层
    publishObj.floor_start = ''; //跃层start
    publishObj.loor_end = '';
    publishObj.floor_total = '';
    publishObj.floor_is_yc = false;//是否跃层
    publishObj.building_num = ''; //楼栋门牌-栋
    publishObj.unit_num = ''; //楼栋门牌-单元
    publishObj.room_num = ''; //楼栋门牌-室
    publishObj.shop_type = '';
    publishObj.house_property = {
      is_open: false, //是否展开
      owner_contract_type: '', //证件类型 4
      owner_land_right_number: '', //丘权号
      owner_name: '', //产权人姓名
      owner_contract_number: '', //证件号码
      owner_identity_card_number: '', //产权人身份证
      owner_pics: [] //照片
    },


      publishObj.rent_type = '1' //出租方式 1整租、2合租
    publishObj.room_type = '' //卧室类型
    publishObj.sex = '' //租宅性别

    publishObj.build_area = '' //户型面积
    publishObj.register_company = '' //可注册公司
    publishObj.showRegister = '' //显示是否可以注册公司
    publishObj.price = '', //租金
      publishObj.price_unit = '1' //租金单位
    publishObj.price_type = '' //付款方式


    publishObj.fitment_name = '', //装修类型
      publishObj.forward_name = '', //装修朝向
      publishObj.fee = '', //物业费
      publishObj.house_pics = [] //房源照片
    publishObj.car_attr = '1' //车库车位
    publishObj.showRegister = ''

    //第二页数据
    publishObj.title = '';
    publishObj.house_mating = [];
    publishObj.house_special = [];
    publishObj.detail_content = '';
    publishObj.contact = '';
    publishObj.phone = '';
    publishObj.look_house_time = '';//看房时间
    publishObj.checkin_time = '';//入住时间
    publishObj.rental_condition = [];
    publishObj.house_special = [];
    this.setData({
      publishObj: publishObj,
      selected: {}
    })

    let tArr = [];
    if (houseType == "住宅" || houseType == "别墅") {
      tArr = [{
        'name': '户型',
        'value': ""
      }, {
        'name': '朝向',
        'value': ""
      }, {
        'name': '楼层',
        'value': ""
      }]
    } else if (houseType == "商铺") {

      tArr = [{
        'name': '商铺类型',
        'value': ""
      }, {
        'name': '楼层',
        'value': ""
      }]
    } else if (houseType == "写字楼" || houseType == "厂房仓库") {
      tArr = [{
        'name': '楼层',
        'value': ''
      }]

    }

    lastPage.setData({
      topArr: tArr,
      bottomArr: [{
        'name': '楼栋号',
        'value': ""
      }, {
        'name': '单元号',
        'value': ""
      }, {
        'name': '室号',
        'value': ""
      }],
      publishObj: publishObj

    })
  },
  keyBoardSure() {
    var publishObj = this.data.publishObj;
    publishObj.look_house_time = this.data.value1[0]+1;
    publishObj.checkin_time = this.data.value.length > 0 ? this.data.years[this.data.value[0]] + '-' + this.data.months[this.data.value[1]] + '-' + this.data.days[this.data.value[2]] : '';
    let today = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate();
    if (this.data.publish == 'true'){
      if (+new Date(publishObj.checkin_time.replace(/-/g, '/')) < +new Date(today)) {
        wx.showToast({
          title: '入住时间不能早于当前时间，请重新选择',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    this.setData({
      publishObj: publishObj,
      isShowModel: 'hide'
    });
    this.editePushObj(this.data.houseTypeKey)
  },
  selectEvent(e) {
    var val = e.currentTarget.dataset.item;
    var pro = e.currentTarget.dataset.pro;
    var arr = this.data.publishObj[pro] ? this.data.publishObj[pro] : [];
    var publishObj = this.data.publishObj;
    this.data.publishObj[pro] = arr;
    if (!arr.includes(val)) {
      if (pro === 'house_special') {//房屋亮点特殊要求
        if (arr.length === 3) {
          wx.showToast({
            title: '房屋亮点最多选择三个',
            icon: 'none',
            duration: 2000
          })
          return;
        }
      } else {
        if (val === '三月起租' || val === '半年起租' || val === '一年起租'){
          if (arr.indexOf('三月起租') > -1){
            arr.splice(arr.indexOf('三月起租'), 1);
          }
          if (arr.indexOf('半年起租') > -1) {
            arr.splice(arr.indexOf('半年起租'), 1);
          }
          if (arr.indexOf('一年起租') > -1) {
            arr.splice(arr.indexOf('一年起租'), 1);
          }
        }
      }
      arr.push(val);
    } else {
      var index = arr.indexOf(val);
      arr.splice(index,1);
    }
    this.setData({
      publishObj: publishObj
    });
    this.editePushObj(this.data.houseTypeKey);
  }
})