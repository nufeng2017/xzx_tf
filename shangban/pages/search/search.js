import { searchHouse, searchOffice } from '../../network/search.js';
import { decodeUrl } from '../../common/common.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hot_search:[],//热门搜索
    type:1,//2写字楼，1楼盘
    show:false,//搜索联动显示
    serchList:[],//搜索联动列表
    history:[],
    value:'',
    lastIsListPage:''//上一页是否是里列表页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocalData(options);
    this.setData({
      lastIsListPage: getCurrentPages()[getCurrentPages().length - 2].route == 'shangban/pages/house-list/house-list'?true:false,
      lastPage: getCurrentPages()[getCurrentPages().length - 2]
    });
  },
  getLocalData(options){
    if (options.type == 2){
      this.setData({
        hot_search: wx.getStorageSync('shangban_config') ? wx.getStorageSync('shangban_config').hot_search_office : [],
        type: options.type,
        history: wx.getStorageSync('office_house_search_history') ? wx.getStorageSync('office_house_search_history'):[]
      }); 
    } else {
      this.setData({
        history: wx.getStorageSync('office_project_search_history') ? wx.getStorageSync('office_project_search_history') : []
      });
    }
  },
  input(e){
    let txt = e.detail;
    this.setData({
      value:txt
    });
    if (this.data.type==2){
      this.searchHouse(txt);
    } else {
      this.searchOffice(txt);
    }
  },
  searchOffice(txt){//搜索楼盘房源
    searchOffice({
      blockname: txt
    }).then((res)=>{
      this.setData({
        serchList: res.data.data,
        show: res.data.data.length>0?true:false
      });
    });
  },
  searchHouse(txt){//搜索写字楼房源
    searchHouse({
      blockname: txt
    }).then((res) => {
      this.setData({
        serchList: res.data.data,
        show: true
      });
    }).catch(()=>{
      this.setData({
        serchList: [],
        show: false
      });
      
    });
  },
  searchList(e){//搜索完毕点击进入列表
    if (e.detail != 'right'){
      let id = e.currentTarget.dataset.id;
      let pro = e.currentTarget.dataset.pro;
      let item = e.currentTarget.dataset.item;
      if ((pro == 'blockid' || pro == 'office_id') && item) {//记录搜索历史
        this.recordHistory(item);
      }
      if (!id){pro = 'keyword',id=item.keyword}
      let url = '/shangban/pages/house-list/house-list?listType=' + this.data.type + '&' + pro + '=' + id + '&value=' + (item.name || item.blockname || item.keyword);
      this.goWhere(url);
    } else {//删除单条历史
      this.deleteHistoryOne(e);
    }
  },
  recordHistory(obj) {//记录搜索历史
    let arr = this.data.history;
    arr.unshift(obj);
    if (this.data.type == 2){
      arr = this._filterArr(arr,'id').slice(0,10);
      wx.setStorageSync('office_house_search_history', arr);
    } else {
      arr = this._filterArr(arr, 'office_id').slice(0, 10);
      wx.setStorageSync('office_project_search_history', arr)
    }
  },
  deleteHistoryOne(e){
    let item = e.currentTarget.dataset.item;
    let key= '';
    let pro = '';
    if (this.data.type == 2) {
      key = 'office_house_search_history';
      pro = 'id';
    } else {
      key = 'office_project_search_history';
      pro = 'office_id';
    }
    let arr = wx.getStorageSync(key).filter((i, index) => {
      if (!item[pro]){
        return item.keyword != i.keyword;
      }
      return item[pro] != i[pro];
    });
    this.setData({
      history: arr
    });
    wx.setStorageSync(key, arr);
  },
  _filterArr(arr,pro){//过滤重复项
    console.log(arr)
    let o = {};
    arr = arr.filter((item,index)=>{
      console.log(o,item)
      if (!item[pro]){
        if (!o[item.keyword]){
          console.log(item)
          o[item.keyword] = 1;
          return item;
        }
        return;
      }
      if (!o[item[pro]]){
        o[item[pro]] = 1;
        return item;
      } 
    });
    return arr;
  },
  deleteHistory(){//删除搜索历史
    let _self = this;
    wx.showModal({
      title: '提示',
      content: '是否要清空搜索历史？',
      success(res) {
        if (res.confirm) {
          if (_self.data.type == 2) {
            wx.removeStorageSync('office_house_search_history');
          } else {
            wx.removeStorageSync('office_project_search_history');
          }
          _self.setData({
            history: []
          });
        } 
      }
    })
  },
  searcHot(e){
    let item = e.currentTarget.dataset.item;
    let url;
    if (item.keyword){
      url = '/shangban/pages/house-list/house-list?listType=' + this.data.type + '&keyword=' + item.keyword;
    }
    if (item.district_id){
      url = '/shangban/pages/house-list/house-list?listType=' + this.data.type + '&district=' + item.district_id + '&streetid=' + item.street_id;
    }
    url += '&value=' + (item.title);
    this.goWhere(url);
  },
  goWhere(url){//上一页是列表还是首页
    if (this.data.lastIsListPage) {
      let o = decodeUrl(url);
      this.data.lastPage.onLoad(o);
      wx.navigateBack()
    } else {
      wx.redirectTo({
        url: url
      })
    }
  },
  confirm(){
    let key = '';
    if (this.data.type == 2) {
      key = 'office_house_search_history';
    } else {
      key = 'office_project_search_history';
    }
    let arr = wx.getStorageSync(key) ? wx.getStorageSync(key) : [];
    if (this.data.value){
      arr.unshift({
        keyword: this.data.value
      });
    }
    arr = this._filterArrKeywok(arr).slice(0,10);
    wx.setStorageSync(key, arr);
    let url = '/shangban/pages/house-list/house-list?listType=' + this.data.type + '&value=' + this.data.value + '&keyword=' + this.data.value + '&blockname=' + this.data.value;
    this.goWhere(url);
  },
  _filterArrKeywok(arr){
    let o = {};
    arr = arr.filter((item, index) => {
      if (!item.keyword){
        return item;
      }
      if (!o[item.keyword]) {
        o[item.keyword] = 1;
        return item;
      }
    });
    return arr;
  }
})