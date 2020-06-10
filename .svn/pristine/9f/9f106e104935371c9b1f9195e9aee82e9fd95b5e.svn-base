export function selectRouterType(router,url){
  switch(router){
    case 'navigateTo':
      wx.navigateTo({
        url: url,
      })
      break;
    case 'reLaunch':
      wx.reLaunch({
        url: url,
      })
      break;
    case 'redirectTo':
      wx.redirectTo({
        url: url,
      })
      break;
    case 'switchTab':
      wx.switchTab({
        url: url,
      })
      break;
  }
}