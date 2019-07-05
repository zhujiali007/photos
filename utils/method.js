
import req from '../req.js'
import config from '../config.js'

/**
 * 获取当前页面对象
 */
const get_page = () => {
    var pages = getCurrentPages()//获取加载的页面
    return pages[pages.length - 1]//获取当前页面的对象
}


// 支付成功
const pay_success = function (order_id, pattern) {

    wx.showToast({
        title:'支付成功'
    })
    console.log(order_id)

    // 更新购物车数量
    // get_car_count();

    setTimeout(() => {

        // store.commit('updata', {
        //     key: 'pay_time',
        //     value: false
        // });

        // console.log(router)

        if (pattern == 'order') {
            wx.redirectTo({
                url: '/pages/order/details?id=' + order_id
            })
        } else if (pattern == 'serial') {
            wx.redirectTo({
                url: '/pages/order/details?out_trade_no=' + order_id
            })
        }
    }, 500);
}

/**
 * 微信支付
 * @param {*} res 
 */
const wx_pay = function (res) { 
    return new Promise((resolve, reject)=>{
        wx.requestPayment({
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success(res) {
                resolve(res)
            },
            fail(res) {
                reject(res)
            }
        })
    })
}

/**
 * 
 * @param {String} order_id 订单id或订单编号
 * @param {String} type 支付类型
 * @param {String} pattern 支付模式 [order为订单id模式,serial为订单编号模式]
 */
const pay = function (order_id, type = 'wxpay', pattern = "order"){

    return new Promise((resolve, reject)=>{
        let PostData = {
            pay_type: type
        };
    
        if (pattern == 'order') {
            PostData.order_id = order_id;
        } else if (pattern == 'serial') {
            PostData.out_trade_no = order_id;
        }
    
        req({
            url: '/api/wxpay/orderPay',
            type: 'post',
            Data: PostData
        }).then(res => {
            // 现金支付
            if (type == 'cashpay') {
                pay_success(order_id, pattern)
                resolve(res)
                return false;
            } else if (type == 'wxpay') { // 微信支付
    
                wx_pay(res).then(()=>{
                    console.log(res)
                    pay_success(order_id, pattern)
                    resolve(res)
                }).catch(()=>{
                    console.log(res)
                    wx.redirectTo({
                        url: '/pages/order/details?' + (pattern == 'order' ? 'id' : 'out_trade_no') + '=' + order_id
                    })
                    reject(res)
                })
            }
        },()=>{
    
        })
    })

    
}



/**
 * 确认收货
 * @param {*} order_id 订单ID 
 */
const confirm_goods = function (order_id) {
    return new Promise((resolve, reject)=>{
        req({
            url: '/api/order/confirmGoods',
            Data: {
                order_id: order_id,
            }
        }).then(res => {
            wx.showToast({
                title: '操作成功'
            })
            
            setTimeout(() => {
                wx.navigateTo({
                    url: '/pages/order/comment?id=' + order_id
                })
            }, 1000);

            resolve(res);
        },(res)=>{
            reject(res)
        })
    })
}

/**
 * 删除地址
 * @param {地址ID} id 
 */
const del_address= function(id){
    return new Promise((resolve, reject) => {
        // 显示
        wx.showModal({
            title: '提示',
            content: '您确认要删除吗?',
            confirmText: '删除',
            confirmColor: config.color,
            success(e) {
                if (e.confirm) {
                    req({
                        url: '/api/address/del',
                        Data: {
                            id
                        }
                    }).then(res => {
                        wx.showToast({ title:'删除成功'})
                        resolve(res)
                    },()=>{
                        reject()
                    })
                }
            },
        })
    })
}


/**
 * 请求后台位置数据
 * @param {}  
 */
const location = function (_this = {}, type = "location") {

    let phone_model = 'unknown';

    return new Promise((resolve, reject) => {

        // if (wx.getStorageSync('location')){
        //     resolve(wx.getStorageSync('location'));
        //     return res;
        // }

        wx.getLocation({
            type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
            success(res) {

                if (type == 'wx_location'){
                    console.log(res)
                    resolve(res)
                    return false;
                }

                req({
                    url: '/api/index/location',
                    Data: {
                        latitude:res.latitude,
                        longitude:res.longitude,
                        mobiletype: phone_model
                    }
                }).then(res => {
                    res.goods_data = [];
                    wx.setStorageSync( 'location',res)
                    if (_this.globalData){
                        _this.globalData.location = res;
                    }
                    
                    resolve(res);
                }, () => {
                    reject(res);
                })
            }
        })
    })
}

const get_list = function ({ _this, url, data, list_name = 'list',once = false}){
    // console.log(_this.data)
    return new Promise((resolve, reject) => {

        if (typeof _this.data.page != 'number' || _this.data.page == 0 || once){
            _this.setData({
                page:1,
                no_data:false
            })
        }

        if(_this.data.no_data == true){
            resolve({})
            console.log('没有数据了')
            return false;
        }

        _this.setData({
            loading: true,
            
        })

        req({
            url,
            loading:true,
            Data: {
                page:_this.data.page,
                ...data
            }
        }).then(res => {

            // 判断是否有数据
            if (res[list_name].data == false && _this.data.page > 1) {
                _this.setData({
                    require: false,
                    loading: false,
                    no_data: true,
                })
                resolve(res);
                return false;
            }

            console.log(_this.data.page)
            // 获取已有的数据
            let list = _this.data.list || [];
            if (_this.data.page <= 1) {
                list = [];
            }
            // 添加数据到数组
            res[list_name].data.forEach(item => {
                list.push(item);
            });

            // 更新数据
            _this.setData({
                page: ++_this.data.page,
                require: true,
                loading: false,
                list
            })

            // 返回
            resolve(res);
        }).catch((res) => {
            // 请求失败时，将 require 置为 true，滚动到底部时，再次请求
            _this.setData({
                require: true,
                loading: false,
            })
            reject(res);
        });
    })
}

// 获取商城配置
const get_shop_setting = function () {
    return new Promise((resolve, reject)=>{
        req({
            url: '/api/index/getShopSetting',
        }).then(res => {
            resolve(res);
            wx.setStorageSync('shop_setting', res)
        }).catch((res)=>{
            console.log(res)
            reject();
        })
    })
}

/**
 * 发票支付
 * @param {*} id 订单id 
 */
const invoice_pay = function(id,options){
    return new Promise((resolve, reject) => {
        wx_pay(options).then((res)=>{
            resolve(res);
        }).catch((res)=>{
            reject(res);
        })
    })
}

/**
 * 分享
 */
const get_share = function () {

    if (wx.getStorageSync('share')){
        return wx.getStorageSync('share');
    }

    return new Promise((resolve, reject) => {
        req({
            url: '/api/v1/dealer/getShareData',
        }).then(res => {
            wx.setStorageSync('share', res.share_data)
            resolve(res.share_data);
            return res.share_data;
        }, () => {
            reject();
        })
    })
}


const get_user = function () {
    
    return new Promise((resolve, reject) => {
        // if (wx.getStorageSync('member')){
        //     resolve(wx.getStorageSync('member'));
        //     return true;
        // }
        req({
            url: '/api/user/getUserCenterData',
            Data: {
            }
        }).then(res => {
            wx.setStorageSync('member', res);
            resolve(res);
        })
    })
    
}

const forbid_clicks = function(type){
    if(wx.getStorageSync(type) == '1'){
        wx.showToast({
            icon:'none',
            title:'请稍后...'
        })
        return true;
    }else{
        wx.setStorageSync(type,'1');
        setTimeout(()=>{
            wx.setStorageSync(type,'0');
        },3000)
        return false;
    }
}

const get_url_json =  function(str){
    var str_json = new Object();
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
        str_json[strs[i].split("=")[0]] = strs[i].split("=")[1]
    }
    return str_json;
}

module.exports = {
    get_page,
    pay,
    wx_pay,
    confirm_goods,
    del_address,
    // location,
    get_list,
    get_shop_setting,
    invoice_pay,
    get_share,
    get_user,
    forbid_clicks,
    get_url_json
}
