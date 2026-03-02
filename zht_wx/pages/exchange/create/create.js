// pages/exchange/create.js
const { exchangeApi, itemApi } = require('../../utils/api');

Page({
  data: {
    requestItemId: 0,
    offerItemId: 0,
    requestItem: null,
    offerItem: null,
    message: '',
    loading: false
  },

  onLoad(options) {
    if (options.itemId) {
      this.setData({ requestItemId: options.itemId });
      this.loadRequestItem();
    }
  },

  async loadRequestItem() {
    try {
      const res = await itemApi.getDetail(this.data.requestItemId);
      this.setData({ requestItem: res.data });
    } catch (err) {
      console.error('加载物品失败', err);
    }
  },

  // 选择提供的物品
  selectOfferItem() {
    wx.navigateTo({
      url: `/pages/item/select?type=offer&excludeId=${this.data.requestItemId}`
    });
  },

  // 留言输入
  onMessageInput(e) {
    this.setData({ message: e.detail.value });
  },

  // 提交交换
  async onSubmit() {
    if (!this.data.offerItemId) {
      wx.showToast({ title: '请选择提供的物品', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      await exchangeApi.create({
        requestItemId: this.data.requestItemId,
        offerItemId: this.data.offerItemId,
        message: this.data.message
      });

      wx.showToast({ title: '发起成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('发起交换失败', err);
    } finally {
      this.setData({ loading: false });
    }
  }
});

// 监听选择物品返回
Page.prototype.onShow = function() {
  const selectedItem = getApp().globalData.selectedOfferItem;
  if (selectedItem) {
    this.setData({
      offerItem: selectedItem,
      offerItemId: selectedItem.id
    });
    getApp().globalData.selectedOfferItem = null;
  }
};
