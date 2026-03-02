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
    avatar: ''
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
    if (e.detail.userInfo) {
      const { nickName, avatarUrl } = e.detail.userInfo;
      this.setData({
        nickname: nickName,
        avatar: avatarUrl,
        canLogin: this.data.agree && nickName
      });
    }
  },

  // 昵称输入
  onNicknameInput(e) {
    const nickname = e.detail.value.trim();
    this.setData({ 
      nickname,
      canLogin: nickname.length > 0 && this.data.agree
    });
  },

  // 获取手机号
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 这里只是模拟获取手机号，实际应用中需要通过后端解密获取真实手机号
      // 因为前端直接获取的是加密数据，需要后端解密
      console.log('获取手机号成功', e.detail);
      // 模拟获取到手机号后更新界面
      this.setData({
        phone: '138****8888', // 实际应用中这里应该是真实获取到的手机号
        canLogin: this.data.nickname.length > 0 && this.data.agree
      });
    } else {
      console.log('获取手机号失败', e.detail.errMsg);
      // 如果获取手机号失败，仍然允许用户继续登录，仅显示提示
      wx.showModal({
        title: '提示',
        content: '获取手机号失败，您可以先注册再绑定手机号',
        showCancel: true,
        cancelText: '暂不绑定',
        confirmText: '手动输入',
        success: (res) => {
          if (res.confirm) {
            // 如果用户选择手动输入，跳转到输入手机号页面
            wx.navigateTo({
              url: '/pages/user/edit?field=phone',
            });
          } else {
            // 暂不绑定也允许登录
            this.setData({
              canLogin: this.data.nickname.length > 0 && this.data.agree
            });
          }
        }
      });
    }
  },

  // 同意协议
  onAgreeChange(e) {
    const agree = e.detail.value;
    this.setData({ 
      agree,
      canLogin: this.data.nickname.length > 0 && agree
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
        phone: this.data.phone, // 实际项目中应使用从后端解密后的手机号
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