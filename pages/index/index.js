const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgs: [], //本地图片地址数组
        picPaths: [], //网络路径
        images: 'https://yyb.gtimg.com/aiplat/static/ai-demo/large/faceage-demo.jpg',
        imgList: [],
        typeId: 1,
        active:true,
        selectIndex:0

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.req({
            url: '/first/sticker/check',
            Data:{
                type:1
            }
        }).then(res => {
            console.log(res)
            var imgList = this.data.imgList;
            this.setData({
                imgList: res.list
            })
        })
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },
    //添加上传图片
    chooseImageTap: function() {
        var that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#00000",
            success: function(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera')
                    }
                }
            }
        })
    },
    // 图片本地路径
    chooseWxImage: function(type) {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function(res) {
                console.log(res.tempFilePaths[0]);
                
                var key=wx.getStorageSync("key");
                console.log(key)
                wx.uploadFile({
                    url: 'https://app-platform.jxqnkj.com/first/sticker/sticker',
                    filePath: res.tempFilePaths[0],
                    name: 'image',
                    header: {
                        'content-type': 'multipart/form-data',
                        'key': key
                    },
                    formData:{
                        code:that.data.typeId || 1
                    },
                    success: function(res) {
                        console.log(res.data) //接口返回网络路径
                        if(res.data==1){
                            app.req({
                                url: '/first/sticker/getUrl',
                                Data: {
                                    type: 1
                                },
                                header: {
                                    'content-type': 'multipart/form-data',
                                    'key': key
                                }
                            }).then(res => {
                                // console.log(res);
                                var images = that.data.images;
                                that.setData({
                                    images: res.imageUrl
                                }
                                )
                            })
                        }else if(res.data==2){
                            wx.showToast({
                                title: '系统繁忙，请稍候再试',
                                icon: 'none'
                            })
                        }else if(res.data==3){
                            wx.showToast({
                                title: '图片格式非法',
                                icon: 'none'

                            })
                        }else if(res.data==4){
                            wx.showToast({
                                title: '图片体积过大',
                                icon: 'none'

                            })
                        }else if(res.data==5){
                            wx.showToast({
                                title: '请检查图片是否包含人脸',
                                icon: 'none'

                            })
                        }else if(res.data==6){
                            wx.showToast({
                                title: '图片为空,请检查图片是否正常',
                                icon: 'none'

                            })
                        }else if(res.data==7){
                            wx.showToast({
                                title: '无效的图片格式',
                                icon: 'none'

                            })
                        }
                    }
                })
            } 
        })
    },
    typeClick(e) {
        console.log(app.get_attr(e).index)
        var typeId = this.data.typeId;
        var selectIndex=this.data.selectIndex;
        this.setData({
            typeId: Number(e.currentTarget.id),
            active:false
        })
        this.setData({
            selectIndex: app.get_attr(e).index || 0
        })
        var key = wx.getStorageSync("key");
        console.log(key)
        app.req({
            url:'/first/sticker/select',
            header:{
                'content-type': 'application/json',
                'key': key
            },
            Data:{
                code:this.data.typeId
            }
        }).then(res=>{
            console.log(res)
        })

        
        
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})