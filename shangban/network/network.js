let baseUrl;
let env = 'product';
const fileManager = wx.getFileSystemManager();
try {
  fileManager.accessSync('/develop.txt');
  env = 'develop';
} catch (e) { }
console.log(env)
if (env === 'develop') {
  baseUrl = 'http://newrentaznpre.house365.com/api/';
} else {
  baseUrl = 'http://newrentaznpre.house365.com/api/';
}

/**
 * 配置属性:
 * url:接口地址，
 * data:数据,类型见小程序文档,
 * header:请求头,
 * timeout:网络延时,
 * hideLoading:隐藏加载框,
 * notNeedHideLoding:不需要隐藏加载框的函数
 * loadTitle:加载框文字
 * method:请求方式
 * hideErrToast:隐藏错误提示
 */
function network(config) {
  if (!config.hideLoading) {
    wx.showLoading({
      title: config.loadTitle ? config.loadTitle : '加载中',
      mask: true
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseUrl ? config.baseUrl + config.url : baseUrl + config.url,
      data: config.data ? config.data : '',
      header: config.header ? config.header : { 'Content-Type': 'application/x-www-form-urlencoded ' },
      timeout: config.timeout ? timeout : 7000,
      method: config.method ? config.method : 'GET',
      success: (res) => {
        console.log(res)
        if (!config.notNeedHideLoding) {
          wx.hideLoading();
        }
        if (res.data.code == 1) {
          resolve(res);
          return;
        }
        if (res.data.result == 1) {
          resolve(res);
        } else {
          if (!config.hideErrToast) {
            wx.showToast({
              title: res.data.msg ? res.data.msg : '无网络',
              icon: 'none',
            });
          }
          reject(res);
        }
      },
      fail: (err) => {
        if (!config.notNeedHideLoding) {
          wx.hideLoading();
        }
        wx.showToast({
          title: '无网络连接',
          icon: 'none'
        });
      }
    });
  });
}
export default network;