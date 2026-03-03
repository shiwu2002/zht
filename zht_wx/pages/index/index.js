// pages/index/index.js
const { itemApi, categoryApi } = require('../../utils/api');

Page({
  data: {
    categories: [],
    currentCategory: 0,
    itemList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10,
    // 轮播图数据
    banners: [
      { id: 1, image: 'https://picsum.photos/800/400?random=1', url: '' },
      { id: 2, image: 'https://picsum.photos/800/400?random=2', url: '' },
      { id: 3, image: 'https://picsum.photos/800/400?random=3', url: '' }
    ]
  },

  onLoad() {
    this.loadCategories();
    this.loadItems();
  },

  onShow() {
    // 刷新列表
    this.refreshList();
  },

  onPullDownRefresh() {
    this.refreshList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadItems();
    }
  },

  // 加载分类
  async loadCategories() {
    try {
      const res = await categoryApi.getList();
      this.setData({
        categories: res.data || []
      });
    } catch (err) {
      console.error('加载分类失败', err);
    }
  },

  // 加载物品列表
  async loadItems() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const params = {
        current: this.data.current,
        size: this.data.size
      };

      if (this.data.currentCategory > 0) {
        params.categoryId = this.data.currentCategory;
      }

      const res = await itemApi.getList(params);
      const newList = this.data.current === 1 
        ? res.data.records 
        : [...this.data.itemList, ...res.data.records];

      this.setData({
        itemList: newList,
        hasMore: this.data.current < res.data.pages,
        current: this.data.current + 1
      });
    } catch (err) {
      console.error('加载物品失败', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 刷新列表
  async refreshList() {
    this.setData({
      current: 1,
      hasMore: true,
      itemList: []
    });
    await this.loadItems();
  },

  // 分类切换
  onCategoryTap(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id);
    if (categoryId === this.data.currentCategory) return;

    this.setData({
      currentCategory: categoryId,
      current: 1,
      hasMore: true,
      itemList: []
    });
    this.loadItems();
  },

  // 跳转搜索
  toSearch() {
    wx.navigateTo({
      url: '/pages/item/search'
    });
  },

  // 跳转发布
  toPublish() {
    wx.navigateTo({
      url: '/pages/item/publish'
    });
  },

  // 跳转详情
  toDetail(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item/detail/detail?id=${itemId}`
    });
  },

  // 轮播图点击
  onBannerTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  // 显示更多
  showMore() {
    wx.showToast({
      title: '更多功能开发中',
      icon: 'none'
    });
  }
});
