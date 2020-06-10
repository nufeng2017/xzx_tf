import { selectRouterType } from '../../common/select-router-type.js'
Component({
  properties: {
    img:String,//图片
    title:String,//标题
    address:{//地址
      type:String,
      value:''
    },
    characteristic:{//特色
      type:null,
      value:[]
    },
    isVideo:{//是否是视频
      type:null,
      value:''
    },
    isRent: {//是否急租
      type: null,
      value: ''
    },
    isMoneyHouse: {//是否是严选
      type: null,
      value: ''
    },
    routerType: {//跳转类型‘switchTab’，‘reLaunch’，‘redirectTo’，‘navigateTo’
      type:String,
      value:'navigateTo'
    },
    url:String,//路由地址
  },
  externalClasses: ['my-class'],
  lifetimes: {
    attached: function () { 
      this.resetData();
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    resetData(){
      if (typeof this.properties.characteristic === 'string'){
        this.setData({
          characteristic: this.properties.characteristic.split(',')
        });
      }
    },
    router(){
      selectRouterType(this.data.routerType,this.data.url);
    }
  }
})