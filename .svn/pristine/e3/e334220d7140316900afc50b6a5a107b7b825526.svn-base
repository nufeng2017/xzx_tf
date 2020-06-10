Component({
  properties: {
    popupStyle:{
      type:String,
      value:''
    },
    popupTitle: {
      type: String,
      value: ''
    },
    listType:null,//列表的类型
    zIndex:Number,
    show:Boolean,
    position:String,
    popupType:null,//1区域选择,2价格列表选择，3其它筛选，4其它
    requestData:Object
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    over(){
      this.triggerEvent('close')
    }
  }
})