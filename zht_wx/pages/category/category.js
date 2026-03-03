// pages/category/category.js
const { categoryApi, itemApi } = require('../../utils/api');

// 分类图标映射（使用后端返回的 icon 字段作为键）
const CATEGORY_ICONS = {
  'book': '/images/classify/book.png',
  'digital': '/images/classify/digital.png',
  'clothes': '/images/classify/clothes.png',
  'home': '/images/classify/home.png',
  'sports': '/images/classify/sports.png',
  'food': '/images/classify/food.png',
  'beauty': '/images/classify/beauty.png',
  'toy': '/images/classify/toy.png',
  'stationery': '/images/classify/stationery.png',
  'other': '/images/classify/other.png'
};

Page({
  data: {
    categories: [],
    filteredCategories: [],
    searchText: ''
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const res = await categoryApi.getList();
      const categories = (res.data || []).map(item => {
        // 根据后端返回的 icon 字段精确匹配图标
        const iconPath = this.getIconByCategory(item.icon);
        return {
          ...item,
          iconPath: iconPath
        };
      });
      
      this.setData({
        categories,
        filteredCategories: categories
      });
    } catch (err) {
      console.error('加载分类失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 根据后端返回的 icon 字段获取图标路径
  getIconByCategory(iconKey) {
    // 精确匹配 icon 字段
    if (iconKey && CATEGORY_ICONS[iconKey]) {
      return CATEGORY_ICONS[iconKey];
    }
    // 默认返回其他图标
    return CATEGORY_ICONS['other'];
  },

  // 搜索分类
  onSearch(e) {
    const searchText = e.detail.value.trim().toLowerCase();
    this.setData({ searchText });

    if (!searchText) {
      this.setData({ filteredCategories: this.data.categories });
      return;
    }

    const filtered = this.data.categories.filter(item => 
      item.name.toLowerCase().includes(searchText)
    );
    this.setData({ filteredCategories: filtered });
  },

  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    
    wx.navigateTo({
      url: `/pages/item/list?categoryId=${categoryId}&categoryName=${categoryName}`
    });
  }
});
