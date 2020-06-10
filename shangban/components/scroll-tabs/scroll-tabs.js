const app = getApp();
Component({
  properties: {
    items:{
      type:Array
    },
    requestData:Object
  },
  data:{
    active:{},
    obj:{},//存储选项所有提交参数
    localSend:1//标记是否是本组件传递的数据
  },
  observers: {
    'items': function (items) {
      if (items.length>0){
        let o = {};
        items.map((item,index)=>{
          o[item.tag_key] = '';
        });
        this.setData({
          obj:o
        });
      }
    },
    'requestData': function (requestData){
      if (requestData.localSend != this.data.localSend){
        let items = this.data.items;
        let active = this.data.active;
        items.map((item, index) => {
          if (requestData[item.tag_key]) {
            if (this.isInclude(item.tag_id.toString(), requestData[item.tag_key].toString())) {
              active[index] = 1;
            } else {
              delete active[index];
            }
          } else {
            delete active[index];
          }
        });
        this.setData({
          active: active
        });
      }
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    isInclude(child,parent){
      console.log(child,parent)
      let len = child.length;
      let i = parent.indexOf(child);
      if (i > -1 && (parent[i + len] == ',' || !parent[i + len]) && (parent[i - 1] == ',' || !parent[i - 1])){
        return true;
      } else if ( i > -1){
        console.log(parent.slice(i + len))
        if (parent.slice(i+len).length>0){
          return this.isInclude(child, parent.slice(i + len));
        } 
      } else {
        return false;
      }
    },
    select(e){
      let o = {};
      let index = e.currentTarget.dataset.index;
      let active = this.data.active;
      if (active[index]){
        delete active[index];
      } else {
        active[index] = 1;
      }
      this.setData({
        active: active
      })
      this._sendData(active);
    },
    _sendData(active){
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      let o = {};
      Object.keys(active).map((item,index)=>{
        if (o[this.data.items[item].tag_key] && this.data.items[item].tag_id != o[this.data.items[item].tag_key]){
          o[this.data.items[item].tag_key] = o[this.data.items[item].tag_key] + ',' + this.data.items[item].tag_id
        } else {
          o[this.data.items[item].tag_key] = this.data.items[item].tag_id;
        }
      });
      let obj = JSON.stringify(this.data.obj);
      obj = JSON.parse(obj);
      console.log(obj)
      let obj1 = Object.assign(obj,o);
      let random = Math.random(100);
      obj1.localSend = random;
      this.setData({
        localSend: random
      });
      parentsPage.filterSubmit({ houseListFilter: obj1 });
    }
  }
})