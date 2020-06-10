import { get_config, office_index } from '../../network/index.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indexData:{},//首页数据
    grid: [],//首页九宫格
    houseInfo: [{
      title: '租写字楼',
      unit: '套',
      count: 0
    }, {
      title: '新增',
      unit: '套',
      count: 0
    }, {
      title: '出租写字楼均价',
      unit: '元/天*m²',
      count: 0,
      trend: 'up',
      changeNum: 0
    }],
    imgLinks: [],//大家都在搜
    hotHouse: [],//热门楼盘
    list:[],//推荐写字楼,
    show:true,//显示加载页
  },
  onLoad(){
    this._getConfig();
    this._getIndexData();
  },
  _getIndexData(){
    office_index().then((res)=>{
      this.setData({
        indexData:res.data.data,
        'houseInfo[0].count': res.data.data.house_total,
        'houseInfo[1].count': res.data.data.house_add,
        'houseInfo[2].count': res.data.data.avg_price,
        'houseInfo[2].trend': res.data.data.trend == 1 ? 'up' : res.data.data.trend == 0?'':'down',
        'houseInfo[2].unit': res.data.data.priceunit,
        'houseInfo[2].changeNum': res.data.data.price_trend_2,
        imgLinks: res.data.data.hot_area,
        grid: res.data.data.icon.info,
        hotHouse: res.data.data.hot_block.info,
        list: res.data.data.recommend.info,
        show:false
      });
    });
  },
  checkAllList(){//查看全部写字楼房源
    wx.navigateTo({
      url: '/shangban/pages/house-list/house-list?listType=2',
    })
  },
  _getConfig(){//获取配置项目
    get_config({
      city: app.globalData.city
    }).then((res)=>{
      if (res.data.data.zufang_config){
        wx.setStorageSync('shangban_config', res.data.data);
      }
    });
  },
  checkLp(){//查看楼盘
    wx.navigateTo({
      url: '/shangban/pages/house-list/house-list?listType=1',
    })
  },
  areaLink(e){//大家都在搜索
    let item = e.currentTarget.dataset.item;
    console.log(item)
    wx.navigateTo({
      url: '/shangban/pages/house-list/house-list?listType=2&district=' + item.district_id + '&streetid=' + item.street_id,
    })
  },
  indexLink(e){
    let txt = e.currentTarget.dataset.text;
    let cacheKey = app.getUtil.getUserinfoKey();
    let data = app.getUtil.cacheGet(cacheKey);
    let url = '';
    if (txt == '租写字楼'){
      url = '/shangban/pages/house-list/house-list?listType=2'
    }
    if (txt == '办公楼盘') {
      url = '/shangban/pages/house-list/house-list?listType=1'
    }
    if (txt == '发布房源'){
      if (data){
        url = '/taofang-package/pages/publish-form/publish-form?houseType=写字楼'
      } else {
        url = '/pages/login/login'
      }
    }
    if (txt == '帮你找房') {
      url = '/taofang-package/pages/rent-seeking-type/rent-seeking-type'
    }
    wx.navigateTo({
      url: url,
    })
  }
})