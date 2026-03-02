// app.js
const { userApi } = require('./utils/api');

App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 获取用户信息
      this.getUserInfo();
    }
  },

  // 获取用户信息
  getUserInfo() {
    userApi.getInfo().then(res => {
      this.globalData.userInfo = res.data;
      wx.setStorageSync('userInfo', res.data);
    }).catch(() => {
      // Token 失效，清除本地存储
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    });
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          resolve(res.code);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  globalData: {
    userInfo: null,
    token: null
  }
});
