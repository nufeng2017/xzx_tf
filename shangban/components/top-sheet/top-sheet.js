/**
 * 筛选弹出窗
 */
const app = getApp();
Component({
  properties: {
    popupTitle:{
      type:String,
      value:''
    },
    listType: null
  },
  data:{
    list:[],
    active:0,
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  observers: {
    'popupTitle': function (popupTitle) {
      let list = [];
      if (popupTitle == '租金') {
        list = wx.getStorageSync('shangban_config').office_search_config.price_map;
      } else if (popupTitle == '类型') {
        list = wx.getStorageSync('shangban_config').office_search_config.office_type_map;
      } else if (popupTitle == '排序') {
        if (this.data.listType == 1) {
          console.log(this.data.listType)
          list = wx.getStorageSync('shangban_config').office_search_config.order_by;
        } else if (this.data.listType == 2){
          list = wx.getStorageSync('shangban_config').zufang_config.order_by;
        }
      } else if (popupTitle == '面积') {
        list = wx.getStorageSync('shangban_config').zufang_config.buildarea;
      } 
      this.setData({
        list: list
      });
    }
  },
  methods: {
    select(e){
      let index = e.currentTarget.dataset.index;
      let id = parseInt(e.currentTarget.dataset.id) ? parseInt(e.currentTarget.dataset.id):0;
  
      this.setData({
        active:index
      });
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      parentsPage.filterSubmit({ [this.data.popupTitle]: id, value:id?this.data.list[index].tag_name:''});//选后发送的值 ['面积':id,value:2平方米]
      this.triggerEvent('close');
    }
  }
})