// pages/category/category.js
const { categoryApi, itemApi } = require('../../utils/api');

// 分类图标映射（从 iconfont 获取的 Unicode 编码）
// 访问 https://www.iconfont.cn 搜索对应图标，添加到项目中后获取 Unicode
const CATEGORY_ICONS = {
  '教材': { iconClass: 'book', iconUnicode: '\ue62d' },
  '数码': { iconClass: 'digital', iconUnicode: '\ue652' },
  '服饰': { iconClass: 'clothes', iconUnicode: '\ue609' },
  '生活': { iconClass: 'life', iconUnicode: '\ue636' },
  '运动': { iconClass: 'sport', iconUnicode: '\ue645' },
  '美食': { iconClass: 'food', iconUnicode: '\ue618' },
  '美妆': { iconClass: 'beauty', iconUnicode: '\ue601' },
  '其他': { iconClass: 'other', iconUnicode: '\ue644' }
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
        // 根据分类名称匹配图标
        const iconConfig = this.getIconByCategory(item.name);
        return {
          ...item,
          iconClass: iconConfig.iconClass,
          iconUnicode: iconConfig.iconUnicode
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

  // 根据分类名称获取图标配置
  getIconByCategory(categoryName) {
    for (const [key, config] of Object.entries(CATEGORY_ICONS)) {
      if (categoryName.includes(key)) {
        return config;
      }
    }
    // 默认返回其他图标
    return CATEGORY_ICONS['其他'];
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
