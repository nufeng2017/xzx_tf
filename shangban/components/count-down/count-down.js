import { getMsg } from '../../network/get-msg.js';
/**
 * 详情头部
 */
let timer;
const timeCount = 60;
Component({
  properties: {
    text:String,
    phone:null,
    show:null,//弹窗是否显示
  },
  data:{
    time: timeCount,
    start:false
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  observers:{
    'show': function (show){
      if (show){
        this.setData({
          time: timeCount,
          start: false
        });
      }
    }
  },
  methods: {
    countDown(){//开始计数
      if (!this.data.phone || isNaN(parseInt(this.data.phone))) {
        wx.showToast({
          title: '请正确填写手机号码',
          icon: 'none'
        })
        clearInterval(timer);
        return;
      }
      getMsg({
        mobile:this.data.phone,
        city:'nj',
        comefrom:1,
        type:19
      }).then((res)=>{
        this.setData({
          start: true
        });
        timer = setInterval(() => {
          let time = this.data.time - 1;
          if (time <= 0) {
            this.setData({
              time: timeCount,
              start: false
            });
            clearInterval(timer);
            return;
          }
          this.setData({
            time: time
          });
        }, 1000);
      }).catch((err)=>{
      });
    }
  }
})