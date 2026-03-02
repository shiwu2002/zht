// pages/login/login.js
const { userApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    nickname: '',
    phone: '',
    agree: false,
    loading: false,
    canGetPhone: true,
    canLogin: false,
  },

  onLoad() {
    // 检查是否可以获取手机号
    this.checkPhoneCapability();
  },

  // 检查获取手机号能力
  checkPhoneCapability() {
    // 这里可以检查微信版本等
    this.setData({ canGetPhone: true });
  },

  // 获取用户信息
  onGetUserInfo(e) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      const { nickName, avatarUrl } = e.detail.userInfo;
      this.setData({
        nickname: nickName,
        avatar: avatarUrl,
        canLogin: this.data.agree && nickName.length > 0 // 手机号不再是必需项
      });
    } else {
      console.log('获取用户信息失败', e.detail.errMsg);
      wx.showToast({
        title: '获取用户信息失败，请重试',
        icon: 'none'
      });
    }
  },

  // 获取手机号
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      console.log('获取手机号成功', e.detail);
      this.setData({
        phone: '138****8888', // 实际应用中这里应该是真实获取到的手机号
        canLogin: this.data.nickname.length > 0 && this.data.agree // 手机号不再是必需项
      });
    } else {
      console.log('获取手机号失败', e.detail.errMsg);
      // 如果获取手机号失败，仍然允许用户继续登录
      wx.showToast({
        title: '获取手机号失败，可稍后在个人中心补充',
        icon: 'none'
      });
      // 允许用户继续，不强制需要手机号
      this.setData({
        canLogin: this.data.nickname.length > 0 && this.data.agree
      });
    }
  },

  // 昵称输入
  onNicknameInput(e) {
    const nickname = e.detail.value.trim();
    this.setData({ 
      nickname,
      canLogin: nickname.length > 0 && this.data.agree // 手机号不再是必需项
    });
  },

  // 同意协议
  onAgreeChange(e) {
    const agree = e.detail.value;
    this.setData({ 
      agree,
      canLogin: this.data.nickname.length > 0 && agree // 手机号不再是必需项
    });
  },

  // 显示协议
  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '请阅读并同意用户协议和隐私政策',
      showCancel: false
    });
  },

  // 登录
  async onLogin() {
    if (!this.data.canLogin) {
      wx.showToast({
        title: '请完善信息后再登录',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 获取微信登录 code
      const { code } = await app.wxLogin();
      
      // 调用后端登录接口
      const res = await userApi.login({
        code: code,
        nickname: this.data.nickname,
        phone: this.data.phone || '', // 手机号变为可选项
        avatar: this.data.avatar || ''
      });

      // 保存 token
      wx.setStorageSync('token', res.data);
      
      // 更新全局数据
      app.globalData.token = res.data;
      app.globalData.userInfo = { 
        nickName: this.data.nickname, 
        avatarUrl: this.data.avatar 
      };

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 跳转首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    } catch (err) {
      console.error('登录失败', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});