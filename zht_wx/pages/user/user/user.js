// pages/user/user.js
const { userApi, messageApi, itemApi, exchangeApi, favoriteApi } = require('../../../utils/api');
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

  // 格式化数字，超过 999 显示为 1k+
  formatNumber(num) {
    if (num === null || num === undefined) return 0;
    const n = parseInt(num);
    if (n >= 10000) {
      return (n / 10000).toFixed(1) + 'w';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k';
    }
    return n;
  },

  onShow() {
    this.loadUserInfo();
  },

  // 格式化数字，超过 999 显示为 1k+
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    const n = parseInt(num);
    if (n >= 10000) {
      return (n / 10000).toFixed(1) + 'w';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k';
    }
    return n.toString();
  },

  async loadUserInfo() {
    try {
      const res = await userApi.getInfo();
      const userInfo = res.data;
      
      console.log('用户信息:', userInfo);
      
      this.setData({ 
        userInfo,
        isLogin: true
      });
      
      // 更新全局数据
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      
      // 加载统计数据和未读消息
      this.loadStats();
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

  // 加载统计数据
  async loadStats() {
    try {
      // 并发请求三个接口获取数据
      const [itemRes, exchangeRes, favoriteRes] = await Promise.all([
        itemApi.getMyItems({ current: 1, size: 1 }).catch(err => ({ data: { total: 0 } })),
        exchangeApi.getMyList({ current: 1, size: 1 }).catch(err => ({ data: { total: 0 } })),
        favoriteApi.getMyList({ current: 1, size: 1 }).catch(err => ({ data: { total: 0 } }))
      ]);

      const itemCount = itemRes.data?.total || 0;
      const exchangeCount = exchangeRes.data?.total || 0;
      const favoriteCount = favoriteRes.data?.total || 0;

      console.log('发布数:', itemCount);
      console.log('交换数:', exchangeCount);
      console.log('收藏数:', favoriteCount);

      this.setData({
        'stats.itemCount': this.formatNumber(itemCount),
        'stats.exchangeCount': this.formatNumber(exchangeCount),
        'stats.favoriteCount': this.formatNumber(favoriteCount)
      });
    } catch (err) {
      console.error('加载统计数据失败', err);
      // 失败时显示 0
      this.setData({
        'stats.itemCount': 0,
        'stats.exchangeCount': 0,
        'stats.favoriteCount': 0
      });
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
    // 消息列表是 tabBar 页面，需要使用 switchTab
    wx.switchTab({
      url: '/pages/message/list/list',
      fail: (err) => {
        console.error('跳转消息列表页面失败:', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
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
