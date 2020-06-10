//city.js
//获取应用实例
import {tracking} from '../../utils/burying-point.js'
var appInstance = getApp();
Page({
    data: {
        houseList: false, //列表数据
        screen_view_bg: 0, //页面剩余部分高度
        window_heightold: '',
        window_height: '',
        turnState: false, //当前是否显示排序下拉部分
        //当前的页码
        page: 1,
        perpage: 20,
        total: 0,

        selected: {},
        color: {},
        config: {},
        show: {},
        menu: {},
        reload: false,
        keywords: '',
        itemname: '',
        xiaoqu_id: '',
        ss_id: '',
        plate_id: '',
        searchInput: true,
        is_show_index: false,
        ad: {},
        city: ''
    },
    initConfig: function() {
        var selected = {
            order_by: 'edit_time_desc'
        };
        var color = {
            order_by: 0,
            room: 0,
            orientation_id: 0,
            acreage: 0,
            renovation_id: 0,
            allview: 0,
            rent: 0,
            lease_mode: 0,
            house_comefrom: 0,
            rent: 0
        };
        var show = {
            'weizhi': false,
            'czfs': false,
            'zujin': false,
            'more': false,
            'street': false,
            'metro': false
        };
        var menu = {
            'weizhi': '',
            'czfs': '',
            'zujin': '',
        };
        this.setData({
            selected: selected,
            color: color,
            show: show
        });
    },
    //事件处理函数
    onLoad: function(options) {
        this.initConfig();
        var that = this;
        // 获取系统信息
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    window_heightold: res.windowHeight - 30,
                    second_height: res.windowHeight - res.windowWidth / 750 * 80
                })
            }
        })
        // 获取globaldata公共配置数据
        var configdata = appInstance.getUtil.copyobj(appInstance.globalData.config);
        var config = {};
        config.lease_mode = configdata.lease_mode;
        config.house_comefrom = ["不限", "公寓", "个人"];
        config.rental_range = configdata.rental_range;
        config.house_type = configdata.house_type;
        config.orientation = configdata.orientation;
        config.acreage = configdata.acreage;
        config.renovation = configdata.renovation;
        config.room_facilities = configdata.room_facilities;
        config.special = configdata.special;
        config.allview = ['不限', '全景看房'];

        config.street = configdata.street;
        config.metro = configdata.metro;
        config.order = configdata.order;
        that.setData({
            config: config,
            city: appInstance.globalData.cityList[appInstance.globalData.city]
        });

        //搜索传值条件
        var selected = this.data.selected;
        var color = this.data.color;

        //来自搜索公寓
        if (options.c_id && options.companyid) {
            wx.setNavigationBarTitle({
                title: options.companyid
            });
            selected.c_id = options.c_id;
            selected.companyid = options.companyid;
            this.setData({
                searchInput: false
            });
        }

        //来自搜索公寓s
        if (options.c_ids) {
            wx.setNavigationBarTitle({
                title: "快租房源"
            });
            selected.c_ids = options.c_ids;
            this.setData({
                searchInput: false
            });
        }

        //来自搜索小区
        if (options.xiaoqu_id && options.xname) {
            wx.setNavigationBarTitle({
                title: options.xname
            });
            selected.xiaoqu_id = options.xiaoqu_id;
            this.setData({
                searchInput: false
            });
            wx.hideShareMenu();
        }


        //来自首页,需要穿入selected、color
        if (options.selected) {
            var selected = JSON.parse(options.selected);
            if (selected.rent) {
                selected.rent_min = selected.rent.split(",")[0]
                selected.rent_max = selected.rent.split(",")[1]
                delete selected.rent;
            }
        }
        if (options.color) {
            var color = JSON.parse(options.color);
        }
        if (selected.itemname){
            this.setData({
                selected: selected,
                color: color,
                keywords: selected.itemname
            });
        }else{
            this.setData({
                selected: selected,
                color: color
            });  
        }
    

        if (options.positionType) {
            if (options.positionType == 0) {
                // 选择了区域
                this.setData({
                    ["show.street"]: true,
                    ["show.metro"]: false,
                })
            } else if (options.positionType == 1) {
                // 选择了地铁
                this.setData({
                    ["show.street"]: false,
                    ["show.metro"]: true,
                })
            }
        }
        this.initMenu();
        this.showlist() //渲染列表数据


        //**埋点 */ 
        tracking({pageId:2421,eventType:1});
    },
    onShareAppMessage: function(res) {
        var title = '365淘房租房';
        var path = '/pages/list/list?&city=' + appInstance.globalData.city;
        var selected = this.data.selected;
        var color = this.data.color;

        if (selected.c_id && selected.companyid) {
            title = selected.companyid;
            path += '&c_id=' + selected.c_id + '&companyid=' + selected.companyid;
        }
        if (selected.c_ids) {
            title = "快租房源";
            path += '&c_ids=' + selected.c_ids;
        }
        selected = JSON.stringify(selected);
        color = JSON.stringify(color);
        path += '&selected=' + selected + '&color=' + color;
        return appInstance.getShareReturn(title, path);
    },
    //渲染列表方法
    showlist: function() {
        if (this.data.page > 1 && this.data.total <= this.data.perpage * this.data.page) return false;
        var that = this;
        var data = {
            'city': appInstance.globalData.city
        };
        var selected = this.data.selected;
        for (let key in selected) {
            if (key == 'facilities' || key == 'special' || key == 'plate_id' || key == 'ss_id') {
                data[key] = selected[key].toString();
            } else if (key == 'rent_min' || key == 'rent_max') {
                var min = '-1';
                var max = '-1';
                if (selected.rent_min > 0) min = selected.rent_min;
                if (selected.rent_max > 0) max = selected.rent_max;
                var rent = min + ',' + max;
                if (rent != '-1,-1') {
                    data['rent'] = rent;
                }
            } else {
                data[key] = selected[key];
            }
        }
        data.page = this.data.page; //页码
        data.perpage = this.data.perpage; //页码
        var isHideLoad = data.page == 1 ? true : false;
        var isContrlHide = data.page == 1 ? true : false;
        appInstance.getUtil.apiRequest('58e5d460e5993', 'GET', data, function(res) {
            if (res.data.code == '1') {
                var oldHouseList = that.data.houseList;
                var houseList = res.data.data.data;
                houseList.forEach(function(val, index, arr) {
                    arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key, val.house_comefrom);
                });
                if (that.data.page > 1) {
                    houseList = oldHouseList.concat(houseList);
                } else {
                    that.setData({
                        total: res.data.data.total
                    });
                    if (res.data.data.total > 0) {
                        wx.showToast({
                            title: '共找到' + res.data.data.total + '套房源',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                }
                that.setData({
                    houseList: houseList
                });
            }
        }, isHideLoad, isContrlHide);
    },
    //onshow
    onShow: function() {
        var current = getCurrentPages();
        if (current.length == 1) this.setData({
            is_show_index: true
        });
        if (this.data.reload) {
            this.initConfig();
            var selected = this.data.selected;
            var color = this.data.color;
            if (this.data.itemname) {
                selected.itemname = this.data.itemname;
                this.setData({
                    keywords: this.data.itemname
                });
            }
            if (this.data.xiaoqu_id) {
                selected.xiaoqu_id = this.data.xiaoqu_id;
            }
            if (this.data.plate_id) {
                selected.plate_id = new Array();
                selected.plate_id.push(this.data.plate_id);
            }
            if (this.data.ss_id) {
                selected.ss_id = new Array();
                selected.ss_id.push(this.data.ss_id);
            }
            this.setData({
                selected: selected
            });
            this.setData({
                color: color
            });
            this.initMenu();
            this.setData({
                page: 1
            });
            this.showlist() //渲染列表数据
        }
    },
    //排序问题
    showturnPopup: function() {
        var that = this;
        that.setData({
            turnState: true,
            window_height: that.data.window_heightold
        })
    },
    closeturnPopup: function() {
        this.setData({
            turnState: false,
            window_height: ''
        })
    },
    //切换排序方法
    addturn: function(e) {
        var selected = this.data.selected;
        selected.order_by = e.currentTarget.dataset.value;
        this.setData({
            selected: selected
        });
        var color = this.data.color;
        color.order_by = e.currentTarget.dataset.index;
        this.setData({
            color: color
        });
        this.setData({
            page: 1
        });
        this.showlist() //渲染列表数据
    },
    //展开筛选条件下拉
    showCondition: function(e) {
        var that = this;
        var key = e.currentTarget.dataset.key;
        var show = that.data.show;
        switch (key) {
            case 'weizhi':
                show.weizhi = show.weizhi == true ? false : true;
                show.street = show.metro == true ? false : true;
                show.metro = show.street == true ? false : true;
                show.czfs = false;
                show.zujin = false;
                show.more = false;
                break;
            case 'street':
                show.street = true;
                show.metro = false;
                break;
            case 'metro':
                show.metro = true;
                show.street = false;
                break;
            case 'czfs':
                show.weizhi = false;
                show.czfs = show.czfs == true ? false : true;
                show.zujin = false;
                show.more = false;
                break;
            case 'zujin':
                show.weizhi = false;
                show.czfs = false;
                show.zujin = show.zujin == true ? false : true;
                show.more = false;
                break;
            case 'more':
                show.weizhi = false;
                show.czfs = false;
                show.zujin = false;
                show.more = show.more == true ? false : true;
                break;
        }
        if (that.data.show.weizhi == true || that.data.show.czfs == true || that.data.show.zujin == true || that.data.show.more == true) {
            that.setData({
                window_height: that.data.window_heightold
            })
        } else {
            that.setData({
                window_height: ''
            })
        }
        that.setData({
            show: show
        })
    },
    clickSelected: function(e) {
        var selected = this.data.selected;
        var color = this.data.color;
        var show = this.data.show;

        //区属
        if (e.currentTarget.dataset.key == 'area_id') {
            selected.area_id = e.currentTarget.dataset.value;
            color.area_id = e.currentTarget.dataset.index;
            //清空街道
            delete selected.plate_id;
            delete color.plate_id;

            //清空地铁
            delete selected.sl_id;
            delete color.sl_id;

            //清空站点
            delete selected.ss_id;
            delete color.ss_id;
        }

        //街道
        if (e.currentTarget.dataset.key == 'plate_id') {
            var plate_id = selected.plate_id || [];
            var index = plate_id.indexOf(e.currentTarget.dataset.value);
            if ('-1' == index) {
                if (plate_id.length >= 3) {
                    wx.showToast({
                        title: '最多选择三项',
                        icon: 'none',
                        duration: 1500
                    })
                    return false;
                }
                plate_id.unshift(e.currentTarget.dataset.value);
            } else {
                plate_id.splice(index, 1);
            }
            selected.plate_id = plate_id;

            var temp = [];
            plate_id.forEach(function(val, index, arr) {
                // temp[val] = true;
                temp.push(val)
            })
            color.plate_id = temp;
        }

        //地铁线路
        if (e.currentTarget.dataset.key == 'sl_id') {
            selected.sl_id = e.currentTarget.dataset.value;
            color.sl_id = e.currentTarget.dataset.index;

            //清空站点
            delete selected.ss_id;
            delete color.ss_id;

            //清空区属
            delete selected.area_id;
            delete color.area_id;

            //清空街道
            delete selected.plate_id;
            delete color.plate_id;
        }

        //地铁站点
        if (e.currentTarget.dataset.key == 'ss_id') {
            var ss_id = selected.ss_id || [];
            var index = ss_id.indexOf(e.currentTarget.dataset.value);
            if ('-1' == index) {
                if (ss_id.length >= 3) {
                    wx.showToast({
                        title: '最多选择三项',
                        icon: 'none',
                        duration: 1500
                    })
                    return false;
                }
                ss_id.unshift(e.currentTarget.dataset.value);
            } else {
                ss_id.splice(index, 1);
            }
            selected.ss_id = ss_id;

            var temp = [];
            ss_id.forEach(function(val, index, arr) {
                // temp[val] = true;
                temp.push(val)
            })
            color.ss_id = temp;
        }

        //出租方式
        if (e.currentTarget.dataset.key == 'lease_mode') {
            selected.lease_mode = e.currentTarget.dataset.value;
            color.lease_mode = e.currentTarget.dataset.index;
        }
        //来源
        if (e.currentTarget.dataset.key == 'house_comefrom') {
            selected.house_comefrom = e.currentTarget.dataset.value;
            color.house_comefrom = e.currentTarget.dataset.index;
        }
        //租金
        if (e.currentTarget.dataset.key == 'rental_range') {
            var min = e.currentTarget.dataset.min;
            var max = e.currentTarget.dataset.max;
            selected.rent_min = min > 0 ? min : '';
            selected.rent_max = max > 0 ? max : '';
            color.rent = e.currentTarget.dataset.index;
        }

        if (e.currentTarget.dataset.key == 'rental_range_min') {
            if (e.detail.value > 0) {
                selected.rent_min = e.detail.value;
                delete color.rent;
            } else {
                selected.rent_min = '';
            }
        }

        if (e.currentTarget.dataset.key == 'rental_range_max') {
            if (e.detail.value > 0) {
                selected.rent_max = e.detail.value;
                delete color.rent;
            } else {
                selected.rent_max = '';
            }
        }
        //户型
        if (e.currentTarget.dataset.key == 'house_type') {
            selected.room = e.currentTarget.dataset.value;
            color.room = e.currentTarget.dataset.index;
        }
        //朝向
        if (e.currentTarget.dataset.key == 'orientation_id') {
            selected.orientation_id = e.currentTarget.dataset.value;
            color.orientation_id = e.currentTarget.dataset.index;
        }
        //面积
        if (e.currentTarget.dataset.key == 'acreage') {
            var acreage = e.currentTarget.dataset.value;
            if (acreage == '-1,-1') selected.acreage = '';
            selected.acreage = acreage;
            color.acreage = e.currentTarget.dataset.index;
        }
        //装修
        if (e.currentTarget.dataset.key == 'renovation_id') {
            selected.renovation_id = e.currentTarget.dataset.value;
            color.renovation_id = e.currentTarget.dataset.index;
        }
        //配套
        if (e.currentTarget.dataset.key == 'facilities') {
            var facilities = selected.facilities || [];
            var index = facilities.indexOf(e.currentTarget.dataset.value);
            if ('-1' == index) {
                facilities.unshift(e.currentTarget.dataset.value);
            } else {
                facilities.splice(index, 1);
            }
            selected.facilities = facilities;

            var temp = [];
            facilities.forEach(function(val, index, arr) {
                temp[val] = true;
            })
            color.facilities = temp;
        }
        //特色
        if (e.currentTarget.dataset.key == 'special') {
            var special = selected.special || [];
            var index = special.indexOf(e.currentTarget.dataset.value);
            if ('-1' == index) {
                special.unshift(e.currentTarget.dataset.value);
            } else {
                special.splice(index, 1);
            }
            selected.special = special;

            var temp = [];
            special.forEach(function(val, index, arr) {
                temp[val] = true;
            })
            color.special = temp;
        }
        //全局看房
        if (e.currentTarget.dataset.key == 'allview') {
            selected.allview = e.currentTarget.dataset.value;
            color.allview = e.currentTarget.dataset.index;
        }
        this.setData({
            selected: selected
        });
        this.setData({
            color: color
        });
    },
    //重置下拉按钮
    reset: function(e) {
        var that = this;
        var key = e.currentTarget.dataset.key;
        if (key == 'weizhi') {
            var selected = this.data.selected;
            delete selected.area_id;
            delete selected.plate_id;
            delete selected.sl_id;
            delete selected.ss_id;
            var color = this.data.color;
            delete color.area_id;
            delete color.plate_id;
            delete color.sl_id;
            delete color.ss_id;
            this.setData({
                selected: selected
            });
            this.setData({
                color: color
            });
        } else if (key == 'czfs') {
            var selected = this.data.selected;
            delete selected.lease_mode;
            delete selected.house_comefrom;
            var color = this.data.color;
            color.lease_mode = 0;
            color.house_comefrom = 0;
            this.setData({
                selected: selected
            });
            this.setData({
                color: color
            });
        } else if (key == 'more') {
            var selected = this.data.selected;
            delete selected.room;
            delete selected.orientation_id;
            delete selected.acreage;
            delete selected.renovation_id;
            delete selected.facilities;
            delete selected.special;
            delete selected.allview;
            var color = this.data.color;
            color.room = 0;
            color.orientation_id = 0;
            color.acreage = 0;
            color.renovation_id = 0;
            delete color.facilities;
            delete color.special;
            color.allview = 0;
            this.setData({
                selected: selected
            });
            this.setData({
                color: color
            });
        }
    },

    putCache() {
        let url = "/pages/list/list"
        let selected = {
            itemname: ""
        }
        let color = {}
        let isNeedSave = false
        let selectPostion = false // 是否选择了位置
        let content = ""
        // **************区域start********************
        if (this.data.selected.area_id) {
            let tempPositonDes = ""
            selected.area_id = this.data.selected.area_id
            isNeedSave = true
            selectPostion = true
            for (var index in this.data.config.street) {
                let item = this.data.config.street[index]
                if (item.aid == selected.area_id) {
                    tempPositonDes = item.title
                    if (this.data.selected.plate_id && this.data.selected.plate_id.length > 0) {
                        // if (tempPositonDes) {
                        //   tempPositonDes = ""
                        // }
                        selected.plate_id = this.data.selected.plate_id
                        isNeedSave = true
                        for (var i in selected.plate_id) {
                            for (var j in item._child) {
                                if (selected.plate_id[i] == item._child[j].aid) {
                                    if (tempPositonDes) {
                                        tempPositonDes += "&nbsp;"
                                    }
                                    tempPositonDes += item._child[j].title
                                    break
                                }
                            }
                        }
                    }
                    break
                }
            }
            content += tempPositonDes
        }

        if (this.data.color.area_id) {
            color.area_id = this.data.color.area_id
        }
        if (this.data.color.plate_id) {
            color.plate_id = this.data.color.plate_id
        }

        if (this.data.selected.sl_id) {
            let tempSubwayDes = ""
            selected.sl_id = this.data.selected.sl_id
            isNeedSave = true
            selectPostion = true
            for (var index in this.data.config.metro) {
                let item = this.data.config.metro[index]
                if (item.id == selected.sl_id) {
                    tempSubwayDes = item.name
                    if (this.data.selected.ss_id && this.data.selected.ss_id.length > 0) {
                        // if (tempSubwayDes) {
                        //   tempSubwayDes = ""
                        // }
                        selected.ss_id = this.data.selected.ss_id
                        isNeedSave = true
                        for (var i in selected.ss_id) {
                            for (var j in item.station) {
                                if (selected.ss_id[i] == item.station[j].id) {
                                    if (tempSubwayDes) {
                                        tempSubwayDes += "&nbsp;"
                                    }
                                    tempSubwayDes += item.station[j].name
                                    break
                                }
                            }
                        }
                    }
                    break
                }
            }
            content += tempSubwayDes
        }

        if (this.data.color.sl_id) {
            color.sl_id = this.data.color.sl_id
        }
        if (this.data.color.ss_id) {
            color.ss_id = this.data.color.ss_id
        }
        // **************区域end********************

        // **************租金start********************
        let rentDes = "" //租金描述

        if (this.data.selected.rent_min) {
            selected.rent_min = this.data.selected.rent_min
            isNeedSave = true
            rentDes = this.data.selected.rent_min + "元以上"
        }
        if (this.data.selected.rent_max) {
            selected.rent_max = this.data.selected.rent_max
            isNeedSave = true
            rentDes = this.data.selected.rent_max + "元以下"
        }
        if (this.data.selected.rent_min && this.data.selected.rent_max) {
            rentDes = this.data.selected.rent_min + "-" + this.data.selected.rent_max + "元"
        }
        if (rentDes) {
            if (content) {
                content += "&nbsp;"
            }
            content += rentDes
        }
        if (this.data.color.rent) {
            color.rent = this.data.color.rent
        }
        // **************租金end********************


        // **************出租类型start********************
        if (this.data.selected.lease_mode && this.data.selected.lease_mode > 0) {
            selected.lease_mode = this.data.selected.lease_mode
            color.lease_mode = this.data.color.lease_mode
            isNeedSave = true
            let rentDes = this.data.config.lease_mode[this.data.selected.lease_mode]
            if (content) {
                content += "&nbsp;"
            }
            content += rentDes
        }
        // **************出租类型end********************
        if (isNeedSave) {
            let selectStr = JSON.stringify(selected)
            let colorStr = JSON.stringify(color)
            url += "?selected=" + selectStr + "&color=" + colorStr
            if (selectPostion) {
                let positionType = 0
                if (this.data.show.street) {
                    positionType = 0
                } else if (this.data.show.metro) {
                    positionType = 1
                }
                url += "&positionType=" + positionType
            }
            url += "&content=" + content
            appInstance.getUtil.putHistory(url, appInstance.globalData.city)
        }

    },

    //点击下拉确认按钮搜索列表内容
    interlist: function(e) {
        var show = this.data.show;
        show.weizhi = false;
        show.czfs = false;
        show.zujin = false;
        show.more = false;
        this.setData({
            window_height: ''
        })
        this.setData({
            show: show
        });
        //计算默认值
        this.initMenu();
        //初始化列表
        this.setData({
            page: 1
        });
        this.showlist();
        this.putCache();
    },
    initMenu: function() {
        var selected = this.data.selected;
        var menu = this.data.menu;
        menu.czfs = '';
        var czfs = [];
        if (selected.house_comefrom > 0) {
            czfs.unshift(this.data.config.house_comefrom[selected.house_comefrom]);
        }
        if (selected.lease_mode > 0) {
            czfs.unshift(this.data.config.lease_mode[selected.lease_mode]);
        }
        menu.czfs = czfs.join("/");

        menu.zujin = '';
        if (selected.rent_min > 0 || selected.rent_max > 0) {
            if (selected.rent_min > 0 && selected.rent_max > 0) {
                menu.zujin = selected.rent_min + '-' + selected.rent_max + '元';
            } else if (selected.rent_min > 0) {
                menu.zujin = selected.rent_min + '元以上';
            } else if (selected.rent_max > 0) {
                menu.zujin = selected.rent_max + '元以下';
            }
        }

        menu.weizhi = '';
        if (selected.area_id > 0) {
            this.data.config.street.forEach(function(val, index, arr) {
                if (val['aid'] == selected.area_id) {
                    menu.weizhi = val['title'];
                    if (selected.plate_id && selected.plate_id.length > 0) {
                        var plate_id = selected.plate_id[0];
                        val._child.forEach(function(v, i, a) {
                            if (v['aid'] == plate_id) {
                                menu.weizhi = v['title'];
                            }
                        });
                    }
                }
            })
        }
        if (selected.sl_id > 0) {
            this.data.config.metro.forEach(function(val, index, arr) {
                if (val['id'] == selected.sl_id) {
                    menu.weizhi = val['name'];
                    if (selected.ss_id && selected.ss_id.length > 0) {
                        var ss_id = selected.ss_id[0];
                        val.station.forEach(function(v, i, a) {
                            if (v['id'] == ss_id) {
                                menu.weizhi = v['name'];
                            }
                        });
                    }
                }
            })
        }
        this.setData({
            menu: menu
        });
    },
    //上滑加载下一页列表数据
    onReachBottom: function() {
        var page = this.data.page;
        page += 1;
        this.setData({
            page: page
        })
        this.showlist() //渲染列表数据
    },
})