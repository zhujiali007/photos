// pages/member/relevance.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        config:app.config,
        verify_title: '获取验证码',
        verify_status: true,
        phone: '',
        code: '',
        ver_time: 0,
        time: null,
        form:{},
        img_banner:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var img = wx.getStorageSync("shop_setting")
        var img_banner = this.data.img_banner
        console.log(img.set_data.banner)
        this.setData({
            img_banner: img.set_data.banner
        })
    },
    input_change(e){
        let form = this.data.form;
        form[app.get_attr(e).name] = e.detail.value;
        this.setData({
            form
        })
    },

    

    send_verify(){
        if (this.data.ver_time > 0) {
            return false;
        }else{
            console.log(1)
        }

        let reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;


        if (!reg.test(this.data.form.phone)) {
            wx.showToast({
                icon: 'none',
                title: '手机号不正确'
            })

            return false;
        }else{
            console.log(4)
        }

        

        app.req({
            url: '/api/user/sendVerifySms',
            Data: {
                phone: this.data.form.phone
            }
        }).then(res => {
            console.log(res);

            this.setData({
                ver_time: 60
            })

            if (res) {
                this.setData({
                    verify_key: res.verify_key
                })

                if (this.data.verify_status) {
                    this.setData({
                        verify_status: false
                    })
                    this.verify(this)
                    this.time = setInterval(() => {
                        this.verify(this)
                    }, 1000);
                }
            }

        }).catch(e =>{
            console.log(e)
        })

        
    },

    verify(_this) {

        this.setData({
            verify_title: _this.data.ver_time + '秒后重新获取'
        })


        if (_this.data.ver_time <= 0) {
            this.setData({
                verify_status : true,
                verify_title : '重新获取',
            })
            // clearTimeout(_this.time);
            return false;
        }

        this.setData({
            ver_time: --this.data.ver_time
        })


    },

    submit() {

        if (!this.data.verify_key) {
            wx.showToast({
                icon: 'none',
                title: '获取验证码'
            })
            return false;
        }

        app.req({
            url: '/api/user/verify',
            Data: {
                phone: this.data.form.phone,
                code: this.data.form.code,
                verify_key: this.data.verify_key,
            }
        }).then(res => {
            wx.showToast({
                title: '绑定成功'
            })

            setTimeout(() => {
                wx.navigateBack({
                    delta:1
                })
            }, 1000);
        })

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