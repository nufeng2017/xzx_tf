// IM//pages/reply/reply.js
let time;
let startTouch = false;
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    replyTxt:[],
    show:false,
    inputTxt:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ready();
  },
  ready(){
    if (wx.getStorageSync('yunxin')){
      let msg = wx.getStorageSync('yunxin').QMsg;
      this.setData({
        replyTxt:msg
      });
    }
  },
  deleteTxt(e){
    let self = this;
    time = +new Date();
    startTouch = true;
    clearTimeout(timer);
    timer = setTimeout(function(){//长按触发删除
      if (startTouch){
        wx.showModal({
          title: '提示',
          content: '是否删除',
          success(res) {
            if (res.confirm) {
              let index = e.currentTarget.dataset.index;
              let data = self.data.replyTxt;
              data.splice(index,1);
              self.setData({
                replyTxt:data
              });
              let yunxin = wx.getStorageSync('yunxin');
              yunxin.QMsg = data;
              wx.setStorageSync('yunxin', yunxin);
            } 
          }
        })
      }
    },500);
  },
  completeDeleteTxt(e){
    let now = +new Date();
    let index = e.currentTarget.dataset.index;
    startTouch = false;
    if (now - time <= 200){//点击事件
      let inputSend
      let page = getCurrentPages()[getCurrentPages().length - 2];
      console.log(page, this.data.replyTxt[index])
      if (page && page.inputSend){
        let obj = { detail: { value: this.data.replyTxt[index]}}
        page.inputSend(obj);
        page.setData({
          moreFlag:false
        });
      }
      wx.navigateBack();
    }
  },
  addReply(){
    this.setData({
      show:true
    });
  },
  cancel(){
    this.setData({
      show: false
    });
  },
  comfirm(){
    if (this.data.inputTxt && this.data.inputTxt.trim() != ''){
      let arr = this.data.replyTxt;
      arr.unshift(this.data.inputTxt);
      let yunxin = wx.getStorageSync('yunxin');
      yunxin.QMsg = arr;
      wx.setStorageSync('yunxin', yunxin);
      this.setData({
        show: false,
        replyTxt:arr
      });
    }
  },
  inputTxt(e){
    let txt = e.detail.value;
    this.setData({
      inputTxt:txt
    });
  }
})