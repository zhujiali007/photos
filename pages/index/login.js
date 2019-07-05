// pages/index/login.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        config:app.config
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
    },

    get_info(e){
        if (e.detail.errMsg == 'getPhoneNumber:ok'){
            app.req({
                url: '/api/v1/dealer/user/bindUserPhone',
                Data:{
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                }
            }).then(res => {
                wx.navigateBack({
                    delta: 1
                })
            }).catch(()=>{
                
            })
        }else{
            wx.redirectTo({
                url:'/pages/index/relevance'
            })
        }
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.getUserInfo();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

     
})