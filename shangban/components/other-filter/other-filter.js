const app = getApp();
Component({
  properties: {
    listType: {//列表的类型
      type:null
    },
    requestData: Object
  },
  data:{
    filterType: [
      { title: '类别', list: [], active: { unlimited:1}, pro:'office_type'}, 
      { title: '来源', list: [], active: { unlimited: 1}, pro:'originFrom'}, 
      { title: '装修', list: [], active: { unlimited: 1}, pro: 'fitment'}, 
      { title: '特色', list: [], active: { unlimited: 1}, pro: 'special'}
    ],
    localSend:5
  },
  observers: {
    'requestData': function (requestData) {
      console.log(requestData)
      if (requestData){
        if (requestData.localSend != this.data.localSend) {
          let filterType = this.data.filterType;
          let active = {}
          filterType.map((item, index) => {
            if (requestData[item.pro]) {
              active = {};
              requestData[item.pro].toString().split(',').map((k,i)=>{
                active[k] = 1;
                active.unlimited = -1;
              });
            } else {
              active = { unlimited: 1 };
            }
            this.setData({
              ['filterType[' + index + '].active']: active
            });
          });
        }
      }
    }
  },
  lifetimes: {
    attached: function () {
      this._setData();
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    isInclude(child, parent) {
      console.log(child, parent)
      let len = child.length;
      let i = parent.indexOf(child);
      if (i > -1 && (parent[i + len] == ',' || !parent[i + len]) && (parent[i - 1] == ',' || !parent[i - 1])) {
        return true;
      } else if (i > -1) {
        console.log(parent.slice(i + len))
        if (parent.slice(i + len).length > 0) {
          return this.isInclude(child, parent.slice(i + len));
        }
      } else {
        return false;
      }
    },
    over() {
      this.triggerEvent('close')
    },
    select(e){
      let id = e.currentTarget.dataset.id;
      let pro = e.currentTarget.dataset.pro;
      let idx = e.currentTarget.dataset.idx;
      if (parseInt(id)){
        let active = this.data.filterType[idx].active;
        if (pro == 'special'){//特色多选
          active.unlimited = -1;
          active[id] = 1;
        } else {
          active = { unlimited: -1,[id]:1};
        }
        this.setData({
          ['filterType[' + idx +'].active']:active,
        });
      } else {
        this.setData({
          ['filterType[' + idx + '].active']: { unlimited: 1},
        });
      }
    },
    beSet() {//确定
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      let o = {};
      for (let key of this.data.filterType){
        if (key.active.unlimited == -1){
          o[key.pro] = this._getObjVal(key.active);
        } else {
          o[key.pro]='';
        }
      }
      let random = Math.random(100);
      o.localSend = random;
      this.setData({
        localSend: random
      });
      console.log(this.data.filterType)
      parentsPage.filterSubmit({ otherFilter: o});
      this.triggerEvent('close');
    },
    reset(){//重置
      this.setData({
        'filterType[0].active': { unlimited: 1 },
        'filterType[1].active': { unlimited: 1 },
        'filterType[2].active': { unlimited: 1 },
        'filterType[3].active': { unlimited: 1 }
      });
    },
    _getObjVal(obj){
      let arr = [];
      for (let i in obj){
        if (i != 'unlimited'){
          arr.push(i);
        }
      }
      return arr.join(',');
    },
    _setData(){
      if (wx.getStorageSync('shangban_config') && wx.getStorageSync('shangban_config').zufang_config){
        let data = wx.getStorageSync('shangban_config').zufang_config;
        this.setData({
          'filterType[0].list':data.officeType,
          'filterType[1].list': data.originFrom,
          'filterType[2].list': data.fitment,
          'filterType[3].list': data.special_map[0].special
        });
      }
    }
  }
})