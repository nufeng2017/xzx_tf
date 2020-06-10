/**
 * 详情小项
 */
Component({
  properties: {
    detailType: {
      type: null
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
    
  }
})