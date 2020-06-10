/***
 * 小程序埋点
 * **/ 
import {hexMD5} from './md5.js'

export function tracking(data,info){
  let systemInfo = wx.getSystemInfoSync();
  let appInstance = getApp();
  let cacheKey = appInstance.getUtil.getUserinfoKey();
  let userInfo = appInstance.getUtil.cacheGet(cacheKey);
  wx.login({
    complete: (res) => {
      if (res.code){
        wx.request({
          url: 'https://aznapi.house365.com/api/5aab83c0900a9',
          header:{
            version:'v1.0',
            'access-token':wx.getStorageSync('access_token')
          },
          data:{
            code:res.code,
            city: appInstance.globalData.city,
          },
          success:(res)=>{
            if (res.data.code==1){
              if (userInfo){
                data.passportUid = userInfo.passport_uid,
                data.openId = userInfo.openid
              }
              data.roleType = userInfo?'R':'G';
              data.openId = res.data.data.openid;
              let time = +new Date();
              data.mpAppid = 'wx2b8d823ffbf6a685';
              data.wechatVersion = systemInfo.version;
              data.system = systemInfo.system;
              data.platform = systemInfo.platform;
              data.brand = systemInfo.brand;
              data.city = appInstance.globalData.city;
  
              data.model = systemInfo.model;
              data.pixelRatio = systemInfo.pixelRatio;
              data.screenWidth = systemInfo.screenWidth + 'px';
              data.screenHeight = systemInfo.screenHeight + 'px';
              data.windowWidth = systemInfo.windowWidth + 'px';
              data.windowHeight = systemInfo.windowHeight + 'px';
              data.statusBarHeight = systemInfo.statusBarHeight + 'px';
              data.sdkVersion = systemInfo.SDKVersion;
              data.mpVersion = '1.8.1';
              data.opTime = time;
              let content = {
                gaWebsiteid : data.pageId,    //页面埋点id
              }
              if (info){
                if (info.id){
                  content.projectId = info.id;
                }
                if (info.type){
                  content.projectType = info.type;
                }
                if (info.type && info.id){
                  data.contextId = info.type + '-' + info.id;
                }
              }
              data.content = JSON.stringify(content);
              
              data.sign = hexMD5(appInstance.globalData.city + data.pageId + time);
              wx.request({
                url: 'https://datacollect.house365.com/house365-data-web/rest/dataAcquisition/mp',
                method:'POST',
                data:data,
                success:(res)=>{
                  console.log(res)
                }
              })
            }
    
          }
        })
      }
    },
  })

} 