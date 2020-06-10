Component({
  properties: {
    tabs:{
      type:Array,
      value:[]
    },
    listType:null,
    requestData: Object
  },
  data:{
    active:-1,//弹窗激活位置
    show:false,
    type:''
  },
  lifetimes: {
    attached: function () {}
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    changeTab(e){//切换tab
      let index = e.currentTarget.dataset.index;
      let type = e.currentTarget.dataset.type;
      let active;
      if (this.data.active == index){
        active = -1;
      } else {
        active = index;
      }
      this.setData({
        show:false,
      });
      setTimeout(()=>{
        this.setData({
          active: active,
          show: active > -1 ? true : false,
          type: type
        });
      },300)
    },
    close(e){
      this.setData({
        active: -1,
        show: false
      });
    }
  }
})