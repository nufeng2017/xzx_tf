/**
 * 详情头部
 */
Component({
  properties: {
    detailType:{
      type:Number,
      value:1
    },
    location:{
      type:Object,
      value:{}
    },
    info: {
      type: Object,
      value: {}
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    checkMap(){
      wx.navigateTo({
        url: '/shangban/pages/map/map?location=' + JSON.stringify(this.data.location),
      })
    }
  }
})