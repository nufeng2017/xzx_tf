import network from './network.js';
var appInstance = getApp();
/**
 * 收藏
 **/
export function keep(data) {
  var cacheKey = appInstance.getUtil.getUserinfoKey();
  var headData = appInstance.getUtil.cacheGet(cacheKey);
  return network({
    url: '/secure',
    data: data,
    baseUrl: 'https://mtsapi.house365.com',
    hideLoading:true
  });
}
