// pages/item/my.js
const { itemApi } = require('../../../utils/api');

Page({
  data: {
    itemList: [],
    statusMap: ['未知', '在售', '已下架']
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    try {
      const res = await itemApi.getMyItems({ current: 1, size: 50 });
      this.setData({ itemList: res.data.records || [] });
    } catch (err) {
      console.error('加载失败', err);
    }
  },

  toDetail(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/item/detail/detail?id=${itemId}` });
  },

  editItem(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/item/edit?id=${itemId}` });
  },

  deleteItem(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个物品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await itemApi.delete(itemId);
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadList();
          } catch (err) {
            console.error('删除失败', err);
          }
        }
      }
    });
  }
});
