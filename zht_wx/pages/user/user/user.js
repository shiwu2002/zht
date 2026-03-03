// pages/user/user.js
const { userApi, messageApi } = require('../../../utils/api');
const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      favoriteCount: 0,
      exchangeCount: 0,
      itemCount: 0
    },
    unreadCount: 0,
    isLogin: false
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
        'stats.itemCount': userInfo.itemCount || 0,
        isLogin: true
      });
      
      // 更新全局数据
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      
      // 加载未读消息数
      this.loadUnreadCount();
    } catch (err) {
      console.error('加载用户信息失败', err);
      if (err.code === 401) {
        // 未登录，跳转登录页
        wx.reLaunch({ url: '/pages/login/login' });
      } else {
        this.setData({ isLogin: false });
      }
    }
  },

  async loadUnreadCount() {
    try {
      const res = await messageApi.getUnreadCount();
      this.setData({ unreadCount: res.data || 0 });
    } catch (err) {
      console.error('加载未读消息失败', err);
    }
  },

  toFavorite() {
    console.log('跳转到收藏页面');
    try {
      wx.navigateTo({ 
        url: '/pages/favorite/favorite',
        fail: (err) => {
          console.error('跳转收藏页面失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('跳转收藏页面异常:', err);
      wx.showToast({ title: '跳转失败', icon: 'none' });
    }
  },

  toItem() {
    console.log('跳转到我的发布页面');
    try {
      wx.navigateTo({ 
        url: '/pages/item/my/my',
        fail: (err) => {
          console.error('跳转我的发布页面失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('跳转我的发布页面异常:', err);
      wx.showToast({ title: '跳转失败', icon: 'none' });
    }
  },

  toExchange() {
    console.log('跳转到交换记录页面');
    try {
      wx.navigateTo({ 
        url: '/pages/exchange/list/list',
        fail: (err) => {
          console.error('跳转交换记录页面失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('跳转交换记录页面异常:', err);
      wx.showToast({ title: '跳转失败', icon: 'none' });
    }
  },

  toMessage() {
    console.log('跳转到消息列表页面');
    try {
      wx.navigateTo({ 
        url: '/pages/message/list/list',
        fail: (err) => {
          console.error('跳转消息列表页面失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('跳转消息列表页面异常:', err);
      wx.showToast({ title: '跳转失败', icon: 'none' });
    }
  },

  toAddress() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  toAbout() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },

  toEdit() {
    wx.navigateTo({ url: '/pages/user/edit/edit' });
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
