// pages/item/detail.js
const { itemApi, favoriteApi, messageApi } = require('../../utils/api');

Page({
  data: {
    id: 0,
    detail: null,
    isFavorite: false,
    exchangeTypes: ['未知', '面对面交换', '邮寄交换', '均可']
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.loadDetail();
  },

  // 加载详情
  async loadDetail() {
    try {
      const res = await itemApi.getDetail(this.data.id);
      this.setData({
        detail: res.data
      });
      this.checkFavorite();
    } catch (err) {
      console.error('加载详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 检查是否已收藏
  async checkFavorite() {
    try {
      const res = await favoriteApi.check(this.data.id);
      this.setData({ isFavorite: res.data });
    } catch (err) {
      console.error('检查收藏失败', err);
    }
  },

  // 收藏/取消收藏
  async onFavorite() {
    try {
      if (this.data.isFavorite) {
        await favoriteApi.remove(this.data.id);
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        await favoriteApi.add(this.data.id);
        wx.showToast({ title: '收藏成功', icon: 'success' });
      }
      this.setData({ isFavorite: !this.data.isFavorite });
    } catch (err) {
      console.error('收藏操作失败', err);
    }
  },

  // 发起交换
  onExchange() {
    wx.navigateTo({
      url: `/pages/exchange/create?itemId=${this.data.id}`
    });
  },

  // 发消息
  onMessage() {
    wx.navigateTo({
      url: `/pages/message/chat?userId=${this.data.detail.userId}`
    });
  },

  // 查看卖家
  toSeller() {
    // 可以跳转到卖家主页
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
