import network from './network.js';

/**
 * 商办配置
 **/ 
export function get_config(data){
  return network({
    url:'zu-fang/get-config',
    data:data,
    notNeedHideLoding:true,
    hideLoading:true
  });
}
/**
 * 首页
 **/
export function office_index(data) {
  return network({
    url: 'zu-fang/office-index',
    data: data,
    notNeedHideLoding: true,
    hideLoading: true
  });
}