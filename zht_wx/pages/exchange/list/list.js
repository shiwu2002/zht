// pages/exchange/list.js
const { exchangeApi } = require('../../utils/api');

Page({
  data: {
    currentTab: 0,
    exchangeList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10,
    statusMap: ['未知', '待确认', '进行中', '已完成', '已取消', '已拒绝']
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
      const params = {
        current: this.data.current,
        size: this.data.size
      };
      if (this.data.currentTab > 0) {
        params.type = this.data.currentTab;
      }

      const res = await exchangeApi.getMyList(params);
      const newList = this.data.current === 1 
        ? res.data.records 
        : [...this.data.exchangeList, ...res.data.records];

      this.setData({
        exchangeList: newList,
        hasMore: this.data.current < res.data.pages,
        current: this.data.current + 1
      });
    } catch (err) {
      console.error('加载交换记录失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshList() {
    this.setData({ current: 1, hasMore: true, exchangeList: [] });
    await this.loadList();
  },

  onTabChange(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ currentTab: tab });
    this.refreshList();
  },

  toDetail(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exchange/detail?id=${exchangeId}`
    });
  },

  async confirmExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认交换',
      content: '确认完成这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.confirm(exchangeId);
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('确认失败', err);
          }
        }
      }
    });
  },

  async rejectExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒绝交换',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.reject(exchangeId, res.content || '无理由');
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('拒绝失败', err);
          }
        }
      }
    });
  }
});
