/**
 * 名片
 */
import { keep } from '../../network/keep.js';
Component({
  properties: {
    info:Object,
    infofrom:null//房源发布来源1个人5中介
  },
  observers: {},
  data: {
    show:false
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    checkImg(){
      this.setData({
        show:!this.data.show
      });
    },
    call(){
      wx.makePhoneCall({
        phoneNumber: this.data.info.telno,
      })
    }
  }
})