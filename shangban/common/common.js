/*链接序列化解析*/
export function decodeUrl(url){
  let o = {};
  if (url.split('?').length>1){
    let arr = url.split('?')[1].split('&');
    arr.map((item,index)=>{
      let a = item.split('=');
      o[a[0]] = a[1];
    });
  }
  return o;
} 

/*IM聊天链接*/
export function message(info){
  if (info && info.IM_info) {
    let message = { type: 8 };
    message.data = info.IM_info;
    let detail = encodeURIComponent(JSON.stringify(message));
    wx.navigateTo({
      url: '/IM/pages/index/index?chatTo=' + info.IM_info.accid + '&detail=' + detail + '&houseType=' + info.infotype,
    })
  } else {
    wx.showToast({
      title: '聊天系统准备中，请稍等！！',
    })
  }
}