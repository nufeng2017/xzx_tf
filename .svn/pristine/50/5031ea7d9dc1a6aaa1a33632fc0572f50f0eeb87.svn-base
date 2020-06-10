/**
 * 详情头部分享，咨询，收藏
 */
var appInstance = getApp();
import { keep } from '../../network/keep.js';
import { message } from '../../common/common.js';
Component({
  properties: {
    detail:{
      type: Object,
      value:{}
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  data:{
    isKeep:true,//是否被收藏
    isClickKeep:true//是否可以点击收藏按钮
  },
  observers:{
    'detail':function(detail){
      this.setData({
        isKeep: detail.hasCollect
      });
    }
  },
  methods: {
    keep(){//收藏事件
      var cacheKey = appInstance.getUtil.getUserinfoKey();
      var data = appInstance.getUtil.cacheGet(cacheKey);
      if (this.data.isClickKeep){
        this.setData({
          isClickKeep:false
        });
      } else {
        return;
      }
      if (data) {
        let isKeep = this.data.isKeep ? 'secondhouse.cancelHouse' : 'secondhouse.collectHouse';
        keep({
          city: appInstance.globalData.city,
          client:'azn_xcx',
          version:'v1.0',
          v: 'v1.0',
          id: this.data.detail.id,
          api_key:'azn_xcx',
          phone: data.passport_phone,
          passport_uid: data.passport_uid,
          tbl: 'rent',
          method: isKeep,//'secondhouse.cancelHouse'取消收藏'secondhouse.collectHouse'收藏
          name: 'UserCenter'
        }).then((res) => {
          this.setData({
            isKeep:!this.data.isKeep,
            isClickKeep: true
          });
        });
      } else {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }
    },
    message(){
      message(this.data.detail);
    }
  }
})