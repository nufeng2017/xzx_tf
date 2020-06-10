import network from './network.js';

/**
 * 获取短信验证码
 **/
export function getMsg(data) {
  return network({
    url: '5cf0da62e7d2f',
    data: data,
    baseUrl:'https://aznapi.house365.com/api/',
    header:{
      'access-token': wx.getStorageSync('access_token'),
      'version': 'v1.0'
    }
  });
}