// pages/login/login.js
const app = getApp();
const { userApi } = require('../../utils/api');

Page({
  data: {
    nickname: '',
    avatar: '',
    isEditingNickname: false,
    defaultAvatars: [
      '/images/login/morentouxiang.png',
      '/images/login/nansheng.png',
      '/images/login/nvsheng.png'
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
      // 调用后端登录接口（首次登录不需要传 nickname 和 avatar）
      console.log('开始调用后端登录接口...');
      userApi.login({
        code: code,
        nickname: '',
        avatar: ''
      }).then(res => {
        console.log('后端登录成功，返回数据:', res);
        // 保存 token
        wx.setStorageSync('token', res.data.token);
        const userInfo = res.data.user;

        // 检查用户信息是否完善
        if (userInfo && userInfo.nickname && userInfo.avatar) {
          // 已有昵称和头像，直接跳转首页
          console.log('用户信息完善，跳转首页');
          wx.setStorageSync('userInfo', userInfo);
          wx.hideLoading();
          wx.switchTab({
            url: '/pages/index/index'
          });
        } else {
          // 需要完善信息
          console.log('用户信息不完善，需要补充');
          wx.hideLoading();
          this.setData({
            nickname: userInfo.nickname || '',
            avatar: userInfo.avatar || ''
          });
        }
      }).catch(err => {
        console.error('后端登录失败:', err);
        wx.hideLoading();
        wx.showToast({ title: err.message || '登录失败', icon: 'none' });
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '微信登录失败', icon: 'none' });
      console.error('微信登录失败:', err);
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (avatarUrl) {
      this.setData({
        avatar: avatarUrl
      });
    } else {
      wx.showToast({ title: '选择头像失败', icon: 'none' });
    }
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

    wx.showLoading({ title: '保存中...' });

    // 使用 updateInfo 接口更新用户信息
    userApi.updateInfo({
      nickname: this.data.nickname,
      avatar: this.data.avatar
    }).then(res => {
      // 获取最新用户信息
      return userApi.getInfo();
    }).then(res => {
      // 保存用户信息
      wx.setStorageSync('userInfo', res.data);

      wx.hideLoading();

      // 跳转至首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
      console.error('保存失败:', err);
    });
  }
});