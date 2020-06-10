/**
 * 详情头部
 */
Component({
  properties: {
    show:{
      type: Boolean,
      value:true
    }
  },
  observers: {},
  data: {
    itemData: []
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {

  }  
})