/**
 * 详情头部
 */
Component({
  properties: {
    info: {
      type: Object,
      value: {}
    },
    detailType:null,
    styleClass:String
  },
  observers: {
    'info': function (info) {
      if (info.id){
        this._resetData(info);
      }
    }
  },
  data:{
    itemData:[]
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    _resetData(info){
      let arr = [];
      if (info.office_type_name) {//楼盘类型
        arr.push(['楼盘类型', info.office_type_name]);
      }
      if (info.level_type_name){//楼盘等级
        arr.push(['楼盘等级', info.level_type_name + '级']);
      }
      if (info.complete_time) {//楼盘等级
        arr.push(['竣工时间', info.complete_time]);
      }
      if (info.total_area) {//楼盘等级
        arr.push(['总面积', info.total_area]);
      }
      if (info.park_num) {//车位数量
        arr.push(['车位数量', info.park_num]);
      }
      if (info.min_park_price) {//车位租金
        arr.push(['车位租金', info.park_price]);
      }
      if (info.property_fee) {//物业费用
        arr.push(['物业费用', info.property_fee]);
      }
      if (info.elevator_desc) {//电梯数量
        arr.push(['电梯数量', info.elevator_desc]);
      }
      if (info.air_conditioner) {//空调配置
        arr.push(['空调配置', info.air_conditioner]);
      }
      if (info.developer) {//开放商
        arr.push(['开发商', info.developer]);
      }
      if (info.property) {//物业公司
        arr.push(['物业公司', info.property]);
      }
      if (info.company_explain) {//入驻企业 info.company_explain
        arr.push(['入驻企业', info.company_explain]);
      }
      if (info.renttype) {//出租方式
        arr.push(['方式', info.renttype]);
      }
      if (info.forward) {//朝向
        arr.push(['朝向', info.forward]);
      } 
      if (info.floor_ch) {//楼层
        arr.push(['楼层', info.floor_ch]);
      } 
      if (info.fitment) {//装修
        arr.push(['装修', info.fitment]);
      } 
      if (info.min_periods) {//租期
        arr.push(['租期', (info.min_periods == 0 ? '面议' : '起租期' + info.min_periods + '个月') + (info.free_periods && info.free_periods != 0 ? '·' + '免租期' + info.free_periods+'个月':'')]);
      } 
      if (info.office_type_ch) {//类型
        arr.push(['类型', '写字楼' + '·' + info.office_type_ch]);
      } 
      this.setData({
        itemData:arr
      });
    }
  }
})