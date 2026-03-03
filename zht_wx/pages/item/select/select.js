// pages/item/select.js
const { itemApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    type: 'offer', // offer: 选择提供的物品，request: 选择想换的物品
    excludeId: 0, // 排除的物品 ID
    itemList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10
  },

  onLoad(options) {
    this.setData({
      type: options.type || 'offer',
      excludeId: parseInt(options.excludeId) || 0
    });
    wx.setNavigationBarTitle({ 
      title: this.data.type === 'offer' ? '选择提供的物品' : '选择想换的物品' 
    });
    this.loadList();
  },

  onShow() {
    this.refreshList();
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadList();
    }
  },

  async loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await itemApi.getMyItems({
        current: this.data.current,
        size: this.data.size
      });

      // 过滤掉排除的物品
      const filteredList = (res.data.records || []).filter(
        item => item.id !== this.data.excludeId
      );

      const newList = this.data.current === 1 
        ? filteredList 
        : [...this.data.itemList, ...filteredList];

      this.setData({
        itemList: newList,
        hasMore: this.data.current < res.data.pages,
        current: this.data.current + 1
      });
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshList() {
    this.setData({ current: 1, hasMore: true, itemList: [] });
    await this.loadList();
  },

  onSelect(e) {
    const selectedItem = e.currentTarget.dataset.item;
    
    // 将选中的物品保存到全局变量
    if (this.data.type === 'offer') {
      app.globalData.selectedOfferItem = selectedItem;
    } else {
      app.globalData.selectedRequestItem = selectedItem;
    }

    // 返回上一页
    wx.navigateBack();
  }
});
