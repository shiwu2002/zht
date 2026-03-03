// pages/login/login.js
const app = getApp();
const { userApi } = require('../../utils/api');

Page({
  data: {
    nickname: '',
    avatar: '',
    isEditingNickname: false,
    defaultAvatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=6'
    ]
  },

  onLoad() {
    // 微信登录获取 code
    this.doWxLogin();
  },

  // 微信登录
  doWxLogin() {
    wx.showLoading({ title: '登录中...' });
    
    app.wxLogin().then(code => {
      console.log('微信登录成功，code:', code);
      this.globalDataCode = code;
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
      console.error('微信登录失败:', err);
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatar: avatarUrl
    });
  },

  // 选择默认头像
  onSelectDefaultAvatar(e) {
    const avatar = e.currentTarget.dataset.avatar;
    this.setData({
      avatar: avatar
    });
  },

  // 编辑昵称
  onEditNickname() {
    this.setData({
      isEditingNickname: true
    });
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  // 确认昵称
  onConfirmNickname() {
    this.setData({
      isEditingNickname: false
    });
  },

  // 完成设置并登录
  onComplete() {
    if (!this.data.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    if (!this.data.avatar) {
      wx.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // 调用登录接口
    userApi.login({
      code: this.globalDataCode,
      nickname: this.data.nickname,
      avatar: this.data.avatar
    }).then(res => {
      // 保存 token
      wx.setStorageSync('token', res.data);
      
      // 保存用户信息
      wx.setStorageSync('userInfo', {
        nickname: this.data.nickname,
        avatar: this.data.avatar
      });

      wx.hideLoading();
      
      // 跳转至首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('登录失败:', err);
    });
  }
});