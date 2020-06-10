import network from './network.js';
var appInstance = getApp();
/**
 * 写字楼房源搜索
 **/
export function searchHouse(data) {
  var cacheKey = appInstance.getUtil.getUserinfoKey();
  var headData = appInstance.getUtil.cacheGet(cacheKey);
  data.city = appInstance.globalData.city;
  return network({
    url: '5cecf92e39fdc',
    data: data,
    hideLoading: true,
    notNeedHideLoding:true,
    hideErrToast:true,
    baseUrl:'https://aznapi.house365.com/api/',
    header: {
      'access-token': wx.getStorageSync('access_token'),
      'version': 'v1.0'
    }
  });
}

/**
 * 写字楼楼盘搜索
 **/
export function searchOffice(data) {
  return network({
    url: 'zu-fang/get-like-office-list',
    data: data,
    hideLoading: true,
    notNeedHideLoding: true,
    hideErrToast: true,
    medthod:'POST'
  });
}