/**
 * 单元格
 */
Component({
  properties: {
    showArrow:{
      type:Boolean,
      value:true
    },
    border:{
      type: Boolean,
      value: true
    }
  },
  externalClasses: ['my-class'],
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {

  }
})