// pages/item/search.js
const { itemApi } = require('../../../utils/api');

Page({
  data: {
    keyword: '',
    itemList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10,
    searchHistory: []
  },

  onLoad() {
    // 加载搜索历史
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  onSearch(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    
    if (keyword) {
      this.refreshList();
      // 保存搜索历史
      this.saveSearchHistory(keyword);
    } else {
      this.setData({ itemList: [] });
    }
  },

  saveSearchHistory(keyword) {
    let history = this.data.searchHistory;
    // 移除重复的
    history = history.filter(k => k !== keyword);
    // 添加到开头
    history.unshift(keyword);
    // 只保留最近 10 条
    history = history.slice(0, 10);
    
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);
  },

  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] });
          wx.removeStorageSync('searchHistory');
        }
      }
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore && this.data.keyword) {
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
        keyword: this.data.keyword
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
      console.error('搜索失败', err);
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
    wx.navigateTo({ url: `/pages/item/detail/detail?id=${itemId}` });
  },

  useHistoryKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.refreshList();
    this.saveSearchHistory(keyword);
  }
});
