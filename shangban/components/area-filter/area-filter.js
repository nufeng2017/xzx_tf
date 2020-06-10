const app = getApp();
Component({
  properties: {
    
  },
  data:{
    area:[],//区域数据
    railway:[],//地铁数据
    list0:['区域','地铁'],
    list1:[],
    list2: [],
    active0:0,//第一列激活序号
    active1:0,//第二列激活序号
    active2:{}//第三列激活序号
  },
  lifetimes: {
    attached() { 
      this.getData();
    },
    ready(){//检查是否有值带入
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      if (!isNaN(parseInt(parentsPage.data.options.district))){
        if (parentsPage.data.options.streetid){
          var obj = this._getStreet(this.data.area, parentsPage.data.options.district,parentsPage.data.options.streetid);
        }
        this.setData({
          active1:obj[0],
          active2: obj[1],
          list2: this.data.area[obj[0]].streets
        });
      }
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    _getStreet(area,id1,id2){
      let obj = [0,{}];
      area.map((item,index)=>{
        if (item.tag_id==id1){
          obj[0] = index;
          if (item.streets){
            let o = item.streets;
            o.map((item,index)=>{
              if (item.tag_id ==id2){
                obj[1] = {[index]:1};
              }
            });
          }
        }
      });
      return obj;
    },
    getData(){//获取列表数据
      let data = wx.getStorageSync('shangban_config');
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      if (data){
        this.setData({
          area:data.zufang_config.district,
          railway:data.zufang_config.railway,
          list1: data.zufang_config.district
        });
      }
    },
    selType(e){//选择区域还是地铁
      let index = e.currentTarget.dataset.index;
      if (index == this.data.active0){return;}
      this.setData({
        active0:index,
        list1: index == 0 ? this.data.area : this.data.railway,
        active1: 0,//第二列激活序号
        active2: 0,//第三列激活序号
        list2:[]
      });
    },
    selList1(e){//选择列表2
      let index = e.currentTarget.dataset.index;
      if (index == this.data.active1) { return; }
      this.setData({
        active1: index,
        list2: this.data.list1[index].streets ? 
          this.data.list1[index].streets : this.data.list1[index].railPosition ? this.data.list1[index].railPosition:[],
        active2: {0:1}//第三列激活序号
      });
    },
    selList2(e){
      let index = e.currentTarget.dataset.index;
      let active2 = this.data.active2;
      if (index == 0){
        this.setData({
          active2: {'0':1}
        });
        return;
      } else {
        delete active2['0'];
      }
      if (active2[index] == 1){
        delete active2[index];
        this.setData({
          active2: active2,
        });
        return;
      }
      if (Object.keys(active2).length >= 3){
        wx.showToast({
          title: '最多只能选择3个！',
          icon:'none'
        })
        return;
      }
      Object.assign(active2,{[index]:1});
      this.setData({
        active2: active2,
      });
    },
    beSet(){//确定
      let parentsPage = app.globalData.parentsPage;//获得列表页对象
      let str = ''
      if (this.data.list2.length>0){
        let active2 = this.data.active2;
        let arr = [];
        for (let i in active2){
          arr.push(this.data.list2[i].tag_id);
        }
        str = arr.join(',');
      }
      parentsPage.filterSubmit({ [this.data.active0 == 0 ? '区域' : '地铁']: [this.data.list1[this.data.active1].tag_id, str]});
      this.triggerEvent('close');
    },
    reset(){//重置事件
      this.setData({
        active0:0,
        active1:0,//第二列激活序号
        active2:0,//第三列激活序号
        list1: this.data.area,
        list2: []
      });
    }
  }
})