Component({
  properties: {
    show:Boolean,
    title:String
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    close(){
      this.triggerEvent('close');
    }
  }
})