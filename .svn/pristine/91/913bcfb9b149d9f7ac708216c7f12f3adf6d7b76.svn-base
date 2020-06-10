import network from './network.js';

/**
 * 楼盘详情页接口
 **/
export function getOfficeList(data) {
  return network({
    url: 'zu-fang/get-office-detail',
    data: data,
    method: 'POST',
    notNeedHideLoding: true,
    hideLoading: true
  });
}

/**
 * 房源详情页接口
 **/
export function getRentDetail(data) {
  return network({
    url: 'tf-app/get-rent-detail',
    data: data,
    notNeedHideLoding: true,
    hideLoading: true,
    header: { 'Content-Type': 'application/x-www-form-urlencoded ', 'esf-auth-token': wx.getStorageSync('esf_auth_token') ? wx.getStorageSync('esf_auth_token'):'' }
  });
}