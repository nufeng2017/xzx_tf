import { selectRouterType } from '../../common/select-router-type.js'
Component({
  properties: {
    info:{
      type:Object
    },
    routerType: {//跳转类型‘switchTab’，‘reLaunch’，‘redirectTo’，‘navigateTo’
      type: String,
      value: 'navigateTo'
    },
    url: String,//路由地址
  },
  lifetimes: {
    attached: function () {}
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    router(){
      selectRouterType(this.data.routerType,this.data.url);
    }
  }
})