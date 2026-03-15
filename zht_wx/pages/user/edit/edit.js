// pages/user/edit.js
const { userApi, fileApi } = require('../../../utils/api');
const { uploadImages } = require('../../../utils/imageUploader');
const app = getApp();

Page({
  data: {
    avatar: '',
    nickname: '',
    email: '',
    emailVerified: false,
    emailCode: '',
    sendingCode: false,
    countdown: 0,
    address: '',
    genders: ['保密', '男', '女'],
    genderIndex: 0,
    gender: 0,
    loading: false
  },

  onLoad() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        avatar: userInfo.avatar || '/images/login/morentouxiang.png',
        nickname: userInfo.nickname || '',
        email: userInfo.email || '',
        emailVerified: userInfo.emailVerified || false,
        address: userInfo.address || '',
        gender: userInfo.gender || 0,
        genderIndex: userInfo.gender || 0
      });
    }
  },

  onEmailInput(e) { this.setData({ email: e.detail.value }); },
  onEmailCodeInput(e) { this.setData({ emailCode: e.detail.value }); },

  // 更新头像
  async updateAvatar() {
    try {
      const uploadedUrls = await uploadImages({
        count: 1,
        isAvatar: true,
        onProgress: (progress) => {
          wx.showLoading({ 
            title: `上传中 ${progress.uploaded}/${progress.total}`,
            mask: true 
          });
        }
      });
      
      if (uploadedUrls && uploadedUrls.length > 0) {
        this.setData({ avatar: uploadedUrls[0] });
      }
      
      wx.hideLoading();
    } catch (err) {
      console.error('上传头像失败', err);
      wx.hideLoading();
    }
  },

  onNicknameInput(e) { this.setData({ nickname: e.detail.value }); },
  onGenderChange(e) { this.setData({ genderIndex: e.detail.value, gender: e.detail.value }); },
  onAddressInput(e) { this.setData({ address: e.detail.value }); },

  // 验证邮箱格式
  validateEmail(email) {
    const reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return reg.test(email);
  },

  // 倒计时
  startCountdown() {
    const timer = setInterval(() => {
      if (this.data.countdown > 0) {
        this.setData({ countdown: this.data.countdown - 1 });
      } else {
        clearInterval(timer);
      }
    }, 1000);
  },

  // 发送验证码
  async sendCode() {
    if (!this.data.email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }

    if (!this.validateEmail(this.data.email)) {
      wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
      return;
    }

    if (this.data.sendingCode || this.data.countdown > 0) {
      return;
    }

    this.setData({ sendingCode: true });

    try {
      await userApi.sendEmailCode(this.data.email);
      wx.showToast({ title: '验证码已发送', icon: 'success' });
      this.setData({ countdown: 60, sendingCode: false });
      this.startCountdown();
    } catch (err) {
      console.error('发送验证码失败', err);
      this.setData({ sendingCode: false });
    }
  },

  // 绑定邮箱
  async bindEmail() {
    if (!this.data.emailCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }

    try {
      await userApi.bindEmail(this.data.email, this.data.emailCode);
      wx.showToast({ title: '绑定成功', icon: 'success' });
      this.setData({ emailVerified: true, emailCode: '' });
    } catch (err) {
      console.error('绑定失败', err);
    }
  },

  async onSave() {
    if (!this.data.nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    // 如果邮箱未验证，先绑定邮箱
    if (this.data.email && !this.data.emailVerified) {
      await this.bindEmail();
      if (!this.data.emailVerified) {
        return;
      }
    }

    this.setData({ loading: true });

    try {
      await userApi.updateInfo({
        avatar: this.data.avatar,
        nickname: this.data.nickname,
        gender: this.data.gender,
        address: this.data.address,
        email: this.data.emailVerified ? this.data.email : null
      });

      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      console.error('保存失败', err);
    } finally {
      this.setData({ loading: false });
    }
  }
});
