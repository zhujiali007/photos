//app.js
import config from './config.js'
import req from './req.js'
import login from './utils/login'

import method from './utils/method.js'
App({

    config: config,
    method,
    onLaunch: function (e) {
        wx.setStorageSync('query', e.query)
        console.log(e)
        // if(this.config.debug){
        //     this.globalData.location = {
        //         latitude:'28.690956115722656',
        //         longitude:'115.86710357666016',
        //     }
        // }

        // 必须是在用户已经授权的情况下调用
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    this.getUserInfo();
                }
            }
        })

        // // 获取用户信息
        // this.get_user();
    },

    callback() {

    },


    getUserInfo() {
        let _this = this;

        return new Promise((resolve, reject) => {
            if (wx.getStorageSync('user')) {
                resolve();
                return false;
            }
            wx.getUserInfo({
                success(res) {
                    _this.get_user(res).then(() => {
                        resolve();
                    });
                    _this.globalData.user = res.userInfo;
                    wx.setStorageSync('user_info', res)
                    wx.setStorageSync('user', res.userInfo)

                },
                fail(res) {
                    // console.log()

                    // if (res.errMsg == 'getUserInfo:fail auth deny'){
                    //     reject(res)
                    //     return false;
                    // }

                    if (method.get_page().route == 'pages/index/getUserInfo') {
                        wx.redirectTo({
                            url: '/pages/index/getUserInfo'
                        })
                    } else {
                        wx.navigateTo({
                            url: '/pages/index/getUserInfo'
                        })
                    }

                    reject(res)

                    // reject(res);
                }
            })
        })


    },



    is_login() {
        if (wx.getStorageSync('key')) {
            return true;
        }
        return false;
    },

    is_user_info() {
        if (wx.getStorageSync('user_info')) {
            return true;
        }
        return false;
    },

    get_req() {
        return new Promise((resolve, reject) => {
            if (this.is_login()) {
                resolve()
            } else {
                login().then(() => {
                    resolve()
                }, () => {
                    reject();
                })
            }
        })
    },

    get_user(data) {
        // 请求用户数据
        return new Promise((resolve, reject) => {
            this.req({
                url: '/api/v1/dealer/getUserInfo',
                Data: {
                    iv: data.iv,
                    encryptedData: data.encryptedData
                }
            }).then(res => {
                wx.setStorageSync('key', res.key)
                resolve();
            }, () => {
            })
        })
    },

    get_attr(e) {
        return e.currentTarget.dataset
    },
    req: function (data) {
        return req(data);
    },
    globalData: {
        userInfo: null,
        address: null
    }
})