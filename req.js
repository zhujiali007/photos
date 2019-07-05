import config from './config.js'
import login from './utils/login'


export default function({
    url,
    type,
    Data,
    loading
}){
    let host_url = config.host + url;

    console.log('req')
    // 
    return new Promise((resolve, reject) => {

        login().then(()=>{
            
            console.log(host_url);

            if (loading == true) {
                wx.showLoading({
                    title: '加载中...'
                })
            }
            wx.request({
                method: type ? type : 'post',
                url: host_url,
                data: Data ? Data : {},
                header: {
                    "Content-Type": "application/json",
                    // "key": "0077NDwXBsBWp8aIjgWxIIwi8Se5RJG_-4P4axxJuYdemPvC_mM"
                    "key": wx.getStorageSync('key')
                },
                success(res) {

                    if (loading == true) {
                        wx.hideLoading()
                    }
                    // 请求成功&&无异常
                    if (res.data && res.data.code == 1) {
                        return resolve(res.data.data);
                    }

                    if (res.data) {

                        res = res.data;

                        // toast 提示
                        if (res.code == '0' || res.code == '-2' || res.code == '-1' || res.code == '-3') {
                            console.log(res)

                            // toast提示
                            if (res.code == '0') {
                                wx.showToast({
                                    icon: 'none',
                                    title: res.msg ? res.msg : '网络错误'
                                })
                            }

                            if (res.code == '-2') {
                                wx.navigateTo({
                                    url: '/pages/index/login'
                                })
                                reject(res);
                                return false;
                            }

                            // alert提示
                            if (res.code == '-3') {
                                wx.showModal({
                                    title: '提示',
                                    showCancel: false,
                                    content: res.msg,
                                    // confirmText: '',
                                    confirmColor: config.color,
                                    success(e) {

                                    },
                                })

                            }

                            reject(res);
                            return false;
                        }

                        // key 失效重新登录
                        if (res.code == '-4') {
                            wx.setStorageSync('key','')
                            login().then(()=>{
                                
                            })
                            reject(res);
                        }

                    }

                    // 请求数据不正确
                    wx.showToast({
                        icon: 'none',
                        title: '网络错误'
                    })

                    reject(res);
                },
                fail: (res) => {
                    // 请求失败
                    wx.showToast({
                        icon: 'none',
                        title: '网络错误'
                    })

                    if (loading == true) {
                        wx.hideLoading()
                    }
                    reject(res);
                }
            })
        },(res)=>{
            console.log(res)
            reject(res);
        })

        
    })
}