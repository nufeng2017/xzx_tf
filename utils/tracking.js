/*埋点接口*/
export function tracking(data){
  console.log(data)
  wx.request({
    url: 'http://newrentpre.house365.com/rent-coupon/visit-log',
    method:'GET',
    data:data,
    success:(res)=>{
      console.log(res)
    }
  })
} 