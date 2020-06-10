var md5 = require('./md5.js');
var base64 = require('./base64.js')
var cache = require('./cache.js');
var baidu = {};


baidu.ak = '5eDQoWIvV63Uot443hmVX7ii9T4lk5X5';

var env = 'product';
//var env = 'develop';


var apiConfig = {};
apiConfig.pay = true;
var gongyuConfig = {};
var otherConfig = {};
var formalUrl = 'http://newrent.house365.com/'; //淘房地址
if (env == 'develop') {
  apiConfig.api = 'https://aznapitest.house365.com/api/';
  apiConfig.version = 'v1.0';
  apiConfig.secret = 'JcJEdRYOapqLXtQPgPZNMRScqtaUbUrJ';
  apiConfig.app_id = '96625801';
  gongyuConfig.api = 'https://gongyupre.aizuna.com/api_customer/';
  gongyuConfig.client_id = '123456';
  gongyuConfig.client_secret = 'aizubang';
  otherConfig.touch = 'http://mdev.aizuna.com/'

  otherConfig.adId = 10;
} else {
  apiConfig.api = 'https://aznapi.house365.com/api/';
  apiConfig.version = 'v1.0';
  apiConfig.secret = 'WPCKeVQEmEyvrAGCvAloiWJkmihWdXdg';
  apiConfig.app_id = '40565712';
  gongyuConfig.api = 'https://gongyu.aizuna.com/api_customer/';
  gongyuConfig.client_id = '123456';
  gongyuConfig.client_secret = 'aizubang';

  otherConfig.adId = 10;
  otherConfig.touch = 'https://m.aizuna.com/'
}

//替换refreshToken方法
function createToken(city) {
  var city = city;
  let promise = new Promise(function(resolve, reject) {
    var times = setInterval(function() {
      var access_token = cache.get('access_token');

        var device_id = genNonDuplicateID(8);
        wx.request({
          url: apiConfig.api + '58bf98c1dcb63',
          data: getSign(city, device_id),
          method: 'GET',
          header: {
            'version': apiConfig.version
          },
          success: function(res) {
            if (res.data.code == '1') {
              var access_token = res.data.data.access_token;
              cache.put('access_token', access_token, 6600);
              resolve(access_token);
            }
          },
          fail: function(res) {
            reject(res);
          },
          complete: function() {
            clearInterval(times);
          }
        });
      // }
    }, 100)
  });
  return promise;
}


/*参数说明
isHideLoad是否显示加载动画
isContrlHide是否控制隐藏，默认自动不控制
*/
function apiRequest(token, method, data, resolve, isHideLoad, isContrlHide,fail) {
  if (!isHideLoad) {
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
  }
  var city = data.city || 'nj';
  createToken(city).then(function(access_token) {
    var header = {
      'access-token': access_token,
      'version': apiConfig.version
    }
    var cacheKey = getUserinfoKey();
    var userinfo = cache.get(cacheKey);
    if (userinfo) {
      header['user-token'] = userinfo.sso_token
    }
    if (method == 'POST' || method == 'post') {
      header['content-type'] = 'application/x-www-form-urlencoded';
    }
    wx.request({
      url: apiConfig.api + token,
      method: method,
      header: header,
      data: data,
      complete: function(res) {
        resolve(res);
        if (!isContrlHide) {
          wx.hideLoading();
        }
        if (res.data.code == '-14') {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    })
  }, function(res) {
    wx.showLoading({
      title: '网络异常',
      mask: true,
    })
   typeof fail == "function" && fail();;
  });
}

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (var i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function getSign(city, device_id) {
  var secret = apiConfig.secret;
  var data = {
    timestamp: Math.round(new Date().getTime() / 1000).toString(),
    app_id: apiConfig.app_id,
    rand_str: randomString(18),
    device_id: device_id,
  }
  var preStr = 'app_id=' + data.app_id + '&app_secret=' + secret +
    '&device_id=' + data.device_id + '&rand_str=' + data.rand_str + '&timestamp=' + data.timestamp;
  data.signature = md5.hexMD5(preStr);
  data.city = city;
  return data;
}

function genNonDuplicateID(randomLength) {
  return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}

function copyobj(arr) {
  var data = {};
  data = JSON.parse(JSON.stringify(arr));
  return data;
}

function apiUpload(city, tempFilePath, width, resolve) {
  var width = width || '';
  wx.uploadFile({
    url: apiConfig.api + '5abda735eb675',
    filePath: tempFilePath,
    name: 'fd',
    header: {
      'content-type': 'multipart/form-data',
      'version': apiConfig.version
    },
    formData: {
      'city': city,
      'file': 'fd',
      'size': width
    },
    success: function(res) {
      resolve(res);
    }
  })
}

function getUserinfoKey() {
  var cacheKey = env + "userinfo";
  return cacheKey;
}

var bmap = require('./bmap-wx.min.js');

function freshLocal(city, resolve) {
  var local = {};
  // 引入SDK核心类
  var BMap = new bmap.BMapWX({
    ak: baidu.ak
  });
  var fail = function(data) {
    local.city = '';
    local.cityname = '';
    resolve(local)
  };
  var success = function(data) {
    var local_cityname = data.originalData.result.addressComponent.city;
    local_cityname = local_cityname.replace('市', '');
    local.city = '';
    local.cityname = local_cityname;
    var data = {
      'city': city
    };
    apiRequest('5a14d60574204', 'GET', data, function(res) {
      if (res.data.code == '1') {
        res.data.data.forEach(function(val, index, arr) {
          if (local_cityname.indexOf(val.city_name) != '-1') {
            local.city = val.city;
            local.cityname = val.city_name;
          }
        })
      }
      resolve(local);
    });
  }
  // 发起regeocoding检索请求 
  BMap.regeocoding({
    fail: fail,
    success: success
  })
}

function gongyuToken() {
  var cacheKey = getUserinfoKey();
  var userInfo = cache.get(cacheKey);
  //if (!userInfo) return false;
  var header = {};
  header['content-type'] = 'application/x-www-form-urlencoded';
  var data = {};
  data.client_id = gongyuConfig.client_id;
  data.client_secret = gongyuConfig.client_secret;
  data.phone = userInfo.passport_phone;
  let promise = new Promise(function(resolve, reject) {
    var access_token = cache.get('gongyu_access_token');
    if (access_token) {
      resolve(access_token);
    } else {
      wx.request({
        url: gongyuConfig.api + 'access_token',
        method: 'POST',
        header: header,
        data: data,
        success: function(res) {
          if (res.statusCode == 200 && res.data.result == '1') {
            access_token = res.data.data.access_token;
            cache.put('gongyu_access_token', access_token, 6600);
            resolve(access_token);
          }
        },
        fail: function(res) {
          reject(res);
        }
      })
    }
  });
  return promise;
}
//租约支付相关方法
function gongyuAjax(url, method, data, resolve) {
  gongyuToken().then(function(access_token) {
    var header = {};
    header['content-type'] = 'application/x-www-form-urlencoded';
    data['access_token'] = access_token;
    wx.request({
      url: gongyuConfig.api + url,
      method: method,
      header: header,
      data: data,
      complete: function(res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        }
      }
    })
  }, function(res) {
    wx.showLoading({
      title: '网络异常',
      mask: true,
    })
  });
}

function formatDate(time, format = 'YY-MM-DD hh:mm:ss') {
  var date = new Date(time);

  var year = date.getFullYear(),
    month = date.getMonth() + 1, //月份是从0开始的
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();
  var preArr = Array.apply(null, Array(10)).map(function(elem, index) {
    return '0' + index;
  }); ////开个长度为10的数组 格式为 00 01 02 03

  var newTime = format.replace(/YY/g, year)
    .replace(/MM/g, preArr[month] || month)
    .replace(/DD/g, preArr[day] || day)
    .replace(/hh/g, preArr[hour] || hour)
    .replace(/mm/g, preArr[min] || min)
    .replace(/ss/g, preArr[sec] || sec);

  return newTime;
}

function imgSrc(img) {
  if ('-1' == img.indexOf('http') && '-1' == img.indexOf('HTTP')) {
    return '/img/img_bg.png';
  }
  return img;
}

//指定年月的该月份的天数
function getNextMonth(date, length) {
  let yy = date.getFullYear()
  let mm = date.getMonth()
  let dd = date.getDate()

  let nm = 0 //目标月份
  nm = mm + length
  let nd = 1 //目标天数

  date.setDate(1)
  date.setMonth(nm)
  date.setDate(nd)
  date.setHours(0, 0, 0, 0)
  return date.getTime();
}

function adcom(city, advertType, resolve) {
  var that;
  var data = {
    'city': city,
    'advert_type': advertType
  };
  apiRequest('5b67f002726f2', 'GET', data, function(res) {
    if (res.data.code == '1') {
      resolve(res.data.data);
    }
  })
}


function ajax(options) {
  var cacheKey = getUserinfoKey();
  var userinfo = cache.get(cacheKey);
  if (!options.isHideLoad) {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
  }


  var header = {}
  header['content-type'] = 'application/x-www-form-urlencoded';
  header['version'] = 'v1.0'


  if (options.userinfo) {
    header['user-token'] = userinfo.sso_token;
  }
  if (options.accessToken) {
    var access_token = cache.get('access_token');
    header['access-token'] = access_token
  }

 
  // options.data['city'] = app.globalData.city
  wx.request({
    url: apiConfig.api + options.path,
    method: options.method,
    data: options.data,
    header: header,
    success: function(r) {

      if (!options.isContrlHide) {
        wx.hideLoading();
      }
      typeof options.success == "function" && options.success(r);

    },
    fail: function(e) {
      wx.showToast({
        title: '网络异常',
        icon: 'none',
        duration: 6000
      })

      typeof options.fail == "function" && options.fail(e);;

    }
  })

}


//多张图片上传

function uploadImages(data) {

  var that = this;
  var i = data.i ? data.i : 0; //当前上传的图片
  var success = data.success ? data.success : 0; //上传成功个数
  var fail = data.fail ? data.fail : 0; //上传失败的个数
  if(!data.isHiddenLoading){
    wx.showLoading({
      title: '数据上传中',
      mask: true
    })
  }

  wx.uploadFile({
    url: apiConfig.api + '5cef6dab73148',
    filePath: data.path[i],
    name: 'fd',
    header: {
      'content-type': 'multipart/form-data',
      'version': 'v1.0'
    },
    formData: {
      city: data.city,
      file: "fd"
    },
    success: res => {
      success++;
      data.uploadSuccess(res);
    },
    fail: res => {
      fail++;
      data.uploadFail(res);
    },
    complete: () => {



      i++;
      if (i == data.path.length) {
        if (!data.isHiddenLoading){
          wx.hideLoading();
        }
      
        data.complete(i)
      } else {
        data.i = i;

        that.uploadImages(data)
      }

      data.success = success;
      data.fail = fail;


    }
  })

}

/**
 * @param 认证结果function result({
 *  auth：1,
 * zhima:1,
 * bank:1
 * })
 */
function checkAuthentication(city, result) {
  // let changeUid = cache.get('changeUid');
  var cacheKey = getUserinfoKey();
  var userinfo = cache.get(cacheKey);
  ajax({
    path: '5cf491c2beed9',
    method: 'GET',
    check: true,
    accessToken: true,
    isHideLoad: true,
    data: {
      city: city,
      uid: userinfo.passport_uid
    },
    success: res => {
      if (res.data.code == 1) {
        typeof result == "function" && result({
          auth: res.data.data.auth == "1" ? true : false,
          zhima: res.data.data.zhima == "1" ? true : false,
          bank: res.data.data.bank == "1" ? true : false,
        });

      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    },
    fail: error => {
      // typeof result.fail == "function" && result.fail();;
      wx.showToast({
        title: '网络异常',
        icon: 'none'
      })
    }
  })
}




function isObjectValueEqual(a, b) {
  //取对象a和b的属性名
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  //判断属性名的length是否一致
  if (aProps.length != bProps.length) {
    return false;
  }
  //循环取出属性名，再判断属性值是否一致
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

/**
 * 获取广告信息
 * @param city ：城市
 * @param isFloat:true:浮动广告  false|不传：固定广告
 * @param result: function(adList)
*/
function getAdList(city,isFloat,result){
  var data = {
    'city': city,
    'advert_type': isFloat ? '10' : '11'
  };
  apiRequest('5b67f002726f2', 'GET', data, function (res) {
    if (res.data.code == '1') {
      typeof result == "function" && result(res.data.data);
    }else{
      showHint(res.data.msg)
    }
  },true)

}

function showHint(title){
  wx.hideToast()
  wx.showToast({
    title: title,
    icon: 'none',
  })
}

var historyKeyPrefix = "filterhistory_"

function clearHistory(city){
  cache.remove(historyKeyPrefix + city)
}

function getHistory(city){
  let historySearchList = cache.get(historyKeyPrefix + city, [])
  return historySearchList;
}

function putHistory(url,city){
  let historySearchList = cache.get(historyKeyPrefix + city, [])
  for (var index in historySearchList) {
    // 对象去重
    let item = historySearchList[index];
    if (item == url) {
      // 从数组中移除该对象
      historySearchList.splice(index, 1)
    }
  }
  // 添加对象到头位置
  historySearchList.unshift(url)
  if (historySearchList.length > 5) {
    historySearchList.splice(5, historySearchList.length)
  }
  cache.put(historyKeyPrefix + city, historySearchList)
}

/**
   * 深度克隆friendCata
   */
function deepClone(data) {
  let des = {}
  for (let cataKey in data) {
    let desArr = data[cataKey]

    des[cataKey] = []
    desArr.map(item => {
      let temp = {}
      for (let key in item) {
        temp[key] = item[key]
      }
      des[cataKey].push(temp)
    })
  }
  return des
}
function dealMsg(msg, store, app) {
  let account = msg.from
  if (msg.type === 'deleteMsg') {
    store.dispatch({
      type: 'RawMessageList_OppositeRecall_Msg',
      payload: msg
    })
  } else if (msg.type === 'addFriend') { //第三方将自己加到好友列表
    app.globalData.nim.subscribeEvent({
      type: 1, // 订阅用户登录状态事件
      accounts: [account],
      sync: true,
      done: function (err, obj) {
        console.log(err, obj)
      }
    })
    app.globalData.nim.getUser({
      account: account,
      done: function (err, user) {
        if (err) {
          console.log('onSysMsg: getUser: ', err)
          return
        }
        store.dispatch({
          type: 'Notification_Opposite_AddFriend',
          payload: {
            msg,
            desc: `添加好友-${msg.from}添加你为好友`
          }
        })
        store.dispatch({
          type: 'FriendCard_Add_Friend',
          payload: user
        })
      }
    })
  } else if (msg.type === 'deleteFriend') {
    store.dispatch({
      type: 'Notification_Opposite_DeleteFriend',
      payload: {
        msg,
        desc: `删除好友-${msg.from}已将你从他的好友列表中移除`
      }
    })
    store.dispatch({
      type: 'FriendCard_Delete_By_Account',
      payload: account
    })
  } else if (msg.type === 'teamInvite') { // category:"team"
    store.dispatch({
      type: 'Notification_Team_Invite',
      payload: {
        msg,
        desc: `${msg.from}邀请你入群“${msg.attach.team.name}”`
      }
    })
  } else if (msg.type === 'applyTeam') { // category:"team"
    store.dispatch({
      type: 'Notification_Team_Apply',
      payload: {
        msg,
        desc: `${msg.from}申请加入`
      }
    })
  }
}
/**
 * 封装toast
 */
function showToast(type, text, obj) {
  let param = { duration: (obj && obj.duration) || 1500, mask: (obj && obj.isMask) || false }
  switch (type) {
    case 'text': {
      param['title'] = text || ''
      param['icon'] = 'none'
      break
    }
    case 'loading': {
      param['title'] = text || ''
      param['icon'] = 'loading'
      break
    }
    case 'success': {
      param['title'] = text || ''
      param['icon'] = 'success'
      break
    }
    case 'error': {
      param['title'] = text || ''
      param['image'] = '/images/emoji.png'
      break
    }
    default: {
      break
    }
  }
  wx.showToast(param)
}

/**
 * 计算在线 状态
 * [account,clientType,custom:{1:{net_state:1,online_state:0}},idClient,idServer,serverConfig,time,type,value]
 */
function updateMultiPortStatus(data) {
  if (data.account) {
    let account = data.account
    let multiPortStatus = ''
    function getMultiPortStatus(customType, custom) {
      // 服务器下推多端事件标记的特定序号对应值
      var netState = {
        0: '',
        1: 'Wifi',
        2: 'WWAN',
        3: '2G',
        4: '3G',
        5: '4G'
      }
      var onlineState = {
        0: '在线',
        1: '忙碌',
        2: '离开'
      }

      var custom = custom || {}
      if (customType !== 0) {
        // 有serverConfig.online属性，已被赋值端名称
        custom = custom[customType]
      } else if (custom[4]) {
        custom = custom[4]
        multiPortStatus = '电脑'
      } else if (custom[2]) {
        custom = custom[2]
        multiPortStatus = 'iOS'
      } else if (custom[1]) {
        custom = custom[1]
        multiPortStatus = 'Android'
      } else if (custom[16]) {
        custom = custom[16]
        multiPortStatus = 'Web'
      } else if (custom[64]) {
        custom = custom[64]
        multiPortStatus = 'Mac'
      }
      if (custom) {
        custom = JSON.parse(custom)
        if (typeof custom['net_state'] === 'number') {
          var tempNetState = netState[custom['net_state']]
          if (tempNetState) {
            multiPortStatus += ('[' + tempNetState + ']')
          }
        }
        if (typeof custom['online_state'] === 'number') {
          multiPortStatus += onlineState[custom['online_state']]
        } else {
          multiPortStatus += '在线'
        }
      }
      return multiPortStatus
    }
    // demo自定义多端登录同步事件
    if (+data.type === 1) {
      if (+data.value === 1 || +data.value === 2 || +data.value === 3 || +data.value === 10001) {
        var serverConfig = JSON.parse(data.serverConfig)
        var customType = 0
        multiPortStatus = ''
        // 优先判断serverConfig字段
        if (serverConfig.online) {
          if (serverConfig.online.indexOf(4) >= 0) {
            multiPortStatus = '电脑'
            customType = 4
          } else if (serverConfig.online.indexOf(2) >= 0) {
            multiPortStatus = 'iOS'
            customType = 2
          } else if (serverConfig.online.indexOf(1) >= 0) {
            multiPortStatus = 'Android'
            customType = 1
          } else if (serverConfig.online.indexOf(16) >= 0) {
            multiPortStatus = 'Web'
            customType = 16
          } else if (serverConfig.online.indexOf(64) >= 0) {
            multiPortStatus = 'Mac'
            customType = 64
          }
        }
        if (data.custom && (Object.keys(data.custom).length > 0)) {
          var portStatus = getMultiPortStatus(customType, data.custom)
          // 如果serverConfig里有属性而custom里没有对应属性值
          if ((multiPortStatus !== '') && (portStatus === '')) {
            multiPortStatus += '在线'
          } else {
            multiPortStatus = portStatus
            // multiPortStatus += portStatus
          }
        } else if (customType !== 0) {
          multiPortStatus += '在线'
        } else {
          multiPortStatus = '离线'
        }
        return multiPortStatus
      }
    }
  }
  return '离线'
}

module.exports = {
  apiConfig: apiConfig,
  apiRequest: apiRequest,
  genNonDuplicateID: genNonDuplicateID,
  copyobj: copyobj,
  cachePut: cache.put,
  cacheGet: cache.get,
  cacheRemove: cache.remove,
  cacheClear: cache.clear,
  apiUpload: apiUpload,
  freshLocal: freshLocal,
  getUserinfoKey: getUserinfoKey,
  gongyuAjax: gongyuAjax,
  formatDate: formatDate,
  imgSrc: imgSrc,
  getNextMonth: getNextMonth,
  adcom: adcom,
  gongyuConfig: gongyuConfig,
  otherConfig: otherConfig,
  ajax: ajax,
  uploadImages: uploadImages,
  checkAuthentication: checkAuthentication,
  md5: md5,
  base64: base64,
  getAdList: getAdList,
  clearHistory: clearHistory,
  getHistory: getHistory,
  putHistory: putHistory,//存储首页搜索历史
  env: env,
  deepClone: deepClone,
  dealMsg: dealMsg,
  showToast: showToast,
  updateMultiPortStatus: updateMultiPortStatus
}