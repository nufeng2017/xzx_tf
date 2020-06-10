/**
 * 详情隐藏
 */
Component({
  properties: {
    textNum: Number,//展示多少个字就折行
    lineHeight:Number,
    text:{
      type:String,
      value:''
    }
  },
  data:{
    hidden:false,
    str:'',
    isFold:false
  },
  observers: {
    'text': function (info) {
      this._countTxtNum();
    }
  },
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  methods: {
    _countTxtNum(){
      console.log(this.data.text)
      if (this.data.text.length > 0) {
        let reg = /[^\x00-\x80]/;
        let str = '';
        let count = 0;
        for (let i = 0; i < this.data.text.length; i++) {
          if (count >= (2 * this.data.textNum - this.data.textNum/2)){
            this.setData({
              str:str+'...',
              hidden:true,
              isFold:true
            });
            return;
          }
          if (this.data.text[i].match(reg) && this.data.text[i].match(reg)[0]) {
            str += this.data.text[i];
            count += 2;
          } else {
            str += this.data.text[i];
            count += 1;
          }
        }
        this.setData({
          str: str
        });
      }
    },
    showAll(){
      this.setData({
        hidden:!this.data.hidden
      });
    }
  }
})