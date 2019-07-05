import config from '../config'
import method from './method'
import req from "../req";

function get_shate(){
    req({
        url: '/api/v1/dealer/handShareData',
        Data: {
            ...wx.getStorageSync('query')
        }
    }).then(res => {
        
    }, () => {

    })
}


// wx.setStorageSync('key','b21eU72DJWWNcg7ANsgM0Yetwm2viTrC0w-0c6xtZIvvXcFZ7ObgcJi4-d0_JHOhUC5i3fn_lq-UaoQ')



export default function(){
    return new Promise((resolve, reject) => {

        if (wx.getStorageSync('key')) {
            resolve();
            return false;
        }

        // 登录
        wx.login({
            success: res => { // 
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                let host_url = config.host + '/first/sticker/login';
                wx.request({
                    method: 'post',
                    url: host_url,
                    data: {
                        platform: 'mini',
                        code: res.code
                    },
                    header: {
                        "Content-Type": "application/json"
                    },
                    success(res) {
                        wx.setStorageSync('login_count', (wx.getStorageSync('login_count') || 0) + 1)
                        wx.setStorageSync('key', res.data.data.key)
                        
                        resolve()

                        if (wx.getStorageSync('login_count') == 1){

                            // method.location().then((res) => {
                                
                            // }, () => {

                            // })
                            
                            // 获取通用分享
                            // method.get_share();
                            
                            // 获取后台配置
                            // method.get_shop_setting();

                            // 分享
                            // get_shate();

                            // 获取会员信息
                            // get_user();
                        }
                        
                    },
                    fail(res) {
                        reject(res);
                    }
                })
            }
        })
    })
}