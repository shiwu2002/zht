// pages/item/list.js
const { itemApi } = require('../../../utils/api');

Page({
  data: {
    categoryId: 0,
    categoryName: '',
    itemList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10
  },

  onLoad(options) {
    this.setData({
      categoryId: options.categoryId,
      categoryName: options.categoryName
    });
    wx.setNavigationBarTitle({ title: options.categoryName || '物品列表' });
    this.loadList();
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
      const res = await itemApi.getList({
        current: this.data.current,
        size: this.data.size,
        categoryId: this.data.categoryId
      });

      const newList = this.data.current === 1 
        ? res.data.records 
        : [...this.data.itemList, ...res.data.records];

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

  toDetail(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/item/detail/detail?id=${itemId}` });
  }
});
