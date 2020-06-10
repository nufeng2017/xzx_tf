/**
 * 搜索栏
 */
Component({
  properties: {
    disInput:{
      type:Boolean
    },
    type:null,
    newStyle:{
      type: Boolean,
      value:true
    },
    value:String,
    showIm:Boolean//是否显示进入IM的按钮
  },
  data:{
    placeholderTxt:'请输入区域/商圈或者写字楼名称'
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  lifetimes: {
    attached: function () {
      this.setplaceholderTxt(this.data.type)
    }
  },
  observers: {
    'type': function (type) {
      this.setplaceholderTxt(type);
    },
    
  },
  methods: {
    search(){
      if (!this.data.disInput){
        return;
      }
      wx.navigateTo({
        url: '/shangban/pages/search/search?type='+ this.data.type,
      })
    },
    setplaceholderTxt(type){
      let str = '请输入区域/商圈或者写字楼名称';
      if (type == 1) {
        str = '请输入写字楼楼盘名称';
      } else if (type == 2) {
        str = '请输入区域/商圈或者写字楼名称';
      }
      this.setData({
        placeholderTxt: str
      });
    },
    goBack(){
      wx.navigateBack()
    },
    inputTxt(e){
      this.triggerEvent('input', e.detail.value);
    },
    confirm(){
      this.triggerEvent('confirm');
    },
    interIM(){
      
    }
  }
})