import { message } from '../../common/common.js';
Component({
  properties: {
    detail:{
      type:Array,
      value:[]
    },
    info:{
      type:Object
    },
    detailType:null,
    blockname:String,
    address:String,
    location:Object
  },
  data:{
    tabs:['地铁'],
    active:0,
    more:false
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    onChange(e){},
    checkmore(){
      this.setData({
        more: !this.data.more
      });
    },
    checkDetail(){
      if (this.data.detailType == 1){//楼盘
        wx.navigateTo({
          url: '/shangban/pages/map/map?location=' + JSON.stringify(this.data.location),
        })
      } else {
        this.message();
      }
    },
    message() {
      message(this.data.info)
    }
  }
})