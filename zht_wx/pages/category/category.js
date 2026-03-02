// pages/category/category.js
const { categoryApi, itemApi } = require('../../utils/api');

Page({
  data: {
    categories: []
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const res = await categoryApi.getList();
      this.setData({ categories: res.data || [] });
    } catch (err) {
      console.error('加载分类失败', err);
    }
  },

  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    
    wx.navigateTo({
      url: `/pages/item/list?categoryId=${categoryId}&categoryName=${categoryName}`
    });
  }
});
