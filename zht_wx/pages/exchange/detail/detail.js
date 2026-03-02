// pages/exchange/detail.js
const { exchangeApi } = require('../../utils/api');

Page({
  data: {
    id: 0,
    detail: null,
    userId: 0,
    statusMap: ['未知', '待确认', '进行中', '已完成', '已取消', '已拒绝']
  },

  onLoad(options) {
    this.setData({ id: options.id });
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userId: userInfo?.id || 0 });
    this.loadDetail();
  },

  async loadDetail() {
    try {
      const res = await exchangeApi.getDetail(this.data.id);
      this.setData({ detail: res.data });
    } catch (err) {
      console.error('加载详情失败', err);
    }
  },

  async onConfirm() {
    wx.showModal({
      title: '确认交换',
      content: '确认完成这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.confirm(this.data.id);
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('确认失败', err);
          }
        }
      }
    });
  },

  async onReject() {
    wx.showModal({
      title: '拒绝交换',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.reject(this.data.id, res.content || '无理由');
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('拒绝失败', err);
          }
        }
      }
    });
  }
});
