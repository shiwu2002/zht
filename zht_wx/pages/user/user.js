// pages/user/user.js
const { userApi, messageApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    stats: {
      publishCount: 0,
      favoriteCount: 0,
      exchangeCount: 0
    },
    unreadCount: 0
  },

  onShow() {
    this.loadUserInfo();
    this.loadUnreadCount();
  },

  // 加载用户信息
  async loadUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ isLogin: false });
      return;
    }

    try {
      const res = await userApi.getInfo();
      this.setData({
        userInfo: res.data,
        isLogin: true
      });
      app.globalData.userInfo = res.data;
    } catch (err) {
      console.error('获取用户信息失败', err);
      this.setData({ isLogin: false });
    }
  },

  // 加载未读消息
  async loadUnreadCount() {
    try {
      const res = await messageApi.getUnreadCount();
      this.setData({ unreadCount: res.data || 0 });
    } catch (err) {
      console.error('获取未读消息失败', err);
    }
  },

  // 跳转编辑资料
  toEdit() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/user/edit' });
  },

  // 跳转我的发布
  toMyItems() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/item/my' });
  },

  // 跳转收藏
  toFavorite() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/favorite/favorite' });
  },

  // 跳转交换记录
  toExchange() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/exchange/list' });
  },

  // 跳转消息
  toMessage() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.switchTab({ url: '/pages/message/list' });
  },

  // 跳转地址
  toAddress() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 跳转关于
  toAbout() {
    wx.showModal({
      title: '关于置换通',
      content: '版本：1.0.0\n一个便捷的物品交换平台',
      showCancel: false
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.setData({
            userInfo: null,
            isLogin: false
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  }
});
