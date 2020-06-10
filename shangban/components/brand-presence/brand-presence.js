import { applyEnter} from '../../network/apply-enter.js';
/**
 * 品牌入驻按钮
 */
Component({
  data:{
    show:false,
    phone:'',
    code:''
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    presence(){
      this.setData({
        show:true
      })
    },
    close() {
      this.setData({
        show: false
      })
    },
    inputPhone(e){
      this.setData({
        phone:e.detail.value
      });
    },
    inputCode(e){
      this.setData({
        code:e.detail.value
      });
    },
    submit(){
      applyEnter({
        phoneNo:this.data.phone,
        code:this.data.code
      }).then((res)=>{
        wx.showToast({
          title: '提交成功',
          icon:'none'
        })
        this.setData({
          show:false,
          phone: '',
          code: ''
        });
      }).catch((err)=>{});
    }
  }
})