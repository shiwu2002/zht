// pages/user/user.js
const { userApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      favoriteCount: 0,
      exchangeCount: 0,
      itemCount: 0
    }
  },

  onShow() {
    this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      const res = await userApi.getInfo();
      const userInfo = res.data;
      
      this.setData({ 
        userInfo,
        'stats.favoriteCount': userInfo.favoriteCount || 0,
        'stats.exchangeCount': userInfo.exchangeCount || 0,
        'stats.itemCount': userInfo.itemCount || 0
      });
      
      // 更新全局数据
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
    } catch (err) {
      console.error('加载用户信息失败', err);
      if (err.code === 401) {
        // 未登录，跳转登录页
        wx.reLaunch({ url: '/pages/login/login' });
      }
    }
  },

  toFavorite() {
    wx.navigateTo({ url: '/pages/favorite/favorite' });
  },

  toItem() {
    wx.navigateTo({ url: '/pages/item/my' });
  },

  toExchange() {
    wx.navigateTo({ url: '/pages/exchange/list' });
  },

  toEdit() {
    wx.navigateTo({ url: '/pages/user/edit' });
  },

  toSettings() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '置换通 - 让闲置物品流动起来',
      path: '/pages/index/index'
    };
  }
});
