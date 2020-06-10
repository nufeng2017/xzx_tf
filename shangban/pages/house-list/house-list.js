const app = getApp();
import { get_config } from '../../network/index.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    filterTabs:[],
    listType:'',//获取列表数据的函数
    requestData: {},
    topSearch:[],
    value:''//搜索框显示内容
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.parentsPage = this;//存贮页面对象
    if (wx.getStorageSync('shangban_config')){
      this.getOptions(options);
    } else {
      this._getConfig();
    }
  },
  _getConfig() {//获取配置项目
    get_config({
      city: app.globalData.city,
      upData: 1
    }).then((res) => {
      if (res.data.data.zufang_config) {
        wx.setStorageSync('shangban_config', res.data.data);
        this.getOptions(options);
      }
    });
  },
  getOptions(options){//页面筛选配置
    let tabs1 = [{ title: '区域', type: 1 }, { title: '租金', type: 2 }, { title: '面积', type: 2 }, { title: '筛选', type: 3, value: false }];
    let tabs2 = [{ title: '区域', type: 1 }, { title: '类型', type: 2 },{ title: '租金', type: 2 }];
    this.setData({
      listType: options.listType,
      options: options,
      filterTabs: options.listType == 1 ? tabs2 : tabs1,
      topSearch:wx.getStorageSync('shangban_config').zufang_config.top_search,
      'filterTabs[0].value': options.district? true:false,
      requestData: options,
      value: options.value ? options.value:''
    });
    wx.setNavigationBarTitle({
      title: options.listType == 1 ? '楼盘列表' : '房源列表'
    })
  },
  filterSubmit(e){//筛选提交数据
    let o = this.data.requestData;
    let obj = this._getPro(e);//获取请求字段
    Object.assign(o, obj);
    this.setData({
      requestData:o
    });
  },
  _getPro(e){
    let obj = {};
    console.log(e)
    if (e['区域']) {
      obj = {
        district: e['区域'][0],
        streetid: e['区域'][1]
      }
      this.setData({
        'filterTabs[0].value': e['区域'][0] || e['区域'][1]?true:false
      });
    }
    if (e['地铁']) {
      obj = {
        railway: e['地铁'][0],
        railPosition: e['地铁'][1]
      }
      this.setData({
        'filterTabs[0].value': e['地铁'][0] || e['地铁'][1] ? true : false
      });
    }
    if (typeof e['租金'] == 'number'){
      obj.price = e['租金']; 
      this.setData({
        ['filterTabs[' + (this.data.listType==1?2:1) +'].value']: e.value
      });
    }
    if (typeof e['类型'] == 'number'){
      obj.office_type = e['类型'];
      this.setData({
        'filterTabs[1].value': e.value
      });
    }
    if (typeof e['排序'] == 'number') {
      if (this.data.listType == 1){
        obj.order = e['排序'];
      } else {
        obj.order_by = e['排序'];
      }
    }
    if (typeof e['面积'] == 'number') {
      obj.buildarea = e['面积'];
      this.setData({
        'filterTabs[2].value': e.value
      });
    }
    if (e.otherFilter) {//其它筛选信息
      obj = e.otherFilter;
      let isTrue = this._isTrue(e.otherFilter);
      this.setData({
        'filterTabs[3].value': isTrue
      });
    }
    if (e.houseListFilter) {//列表滚动条筛选按钮信息
      obj = e.houseListFilter;
      let isTrue = this._isTrue(e.houseListFilter);
      this.setData({
        'filterTabs[3].value': isTrue
      });
    }
    return obj;
  },
  _isTrue(obj){
    for (let i in obj){
      if (obj[i] && i !='localSend'){
        return true;
      }
    }
    return false;
  }
})