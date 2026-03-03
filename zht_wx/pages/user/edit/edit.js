// pages/user/edit.js
const { userApi, fileApi } = require('../../../utils/api');
const { uploadImages } = require('../../../utils/imageUploader');
const app = getApp();

Page({
  data: {
    avatar: '',
    nickname: '',
    phone: '',
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
        phone: userInfo.phone || '',
        address: userInfo.address || '',
        gender: userInfo.gender || 0,
        genderIndex: userInfo.gender || 0
      });
    }
  },

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

  async bindPhone() {
    wx.getPhoneNumber({
      success: async (res) => {
        if (res.code) {
          try {
            await userApi.bindPhone(res.code);
            wx.showToast({ title: '绑定成功', icon: 'success' });
            this.setData({ phone: res.phoneNumber });
          } catch (err) {
            console.error('绑定失败', err);
          }
        }
      }
    });
  },

  async onSave() {
    if (!this.data.nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      await userApi.updateInfo({
        avatar: this.data.avatar,
        nickname: this.data.nickname,
        gender: this.data.gender,
        address: this.data.address
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
