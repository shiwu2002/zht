// pages/favorite/favorite.js
const { favoriteApi, itemApi } = require('../../utils/api');

Page({
  data: {
    itemList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10
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
      const res = await favoriteApi.getMyList({
        current: this.data.current,
        size: this.data.size
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
      console.error('加载收藏失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshList() {
    this.setData({ current: 1, hasMore: true, itemList: [] });
    await this.loadList();
  },

  toDetail(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item/detail/detail?id=${itemId}`
    });
  },

  async removeFavorite(e) {
    const itemId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await favoriteApi.remove(itemId);
            wx.showToast({ title: '已取消收藏', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('取消收藏失败', err);
          }
        }
      }
    });
  }
});
