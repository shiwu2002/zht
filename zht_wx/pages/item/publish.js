// pages/item/publish.js
const { itemApi, categoryApi, fileApi } = require('../../utils/api');

Page({
  data: {
    images: [],
    title: '',
    description: '',
    categories: [],
    categoryIndex: 0,
    categoryId: 0,
    exchangeTypes: ['面对面交换', '邮寄交换', '均可'],
    exchangeIndex: 0,
    exchangeType: 1,
    price: '',
    location: '',
    longitude: 0,
    latitude: 0,
    tags: '',
    loading: false
  },

  onLoad() {
    this.loadCategories();
  },

  // 加载分类
  async loadCategories() {
    try {
      const res = await categoryApi.getList();
      this.setData({
        categories: res.data,
        categoryId: res.data[0]?.id
      });
    } catch (err) {
      console.error('加载分类失败', err);
    }
  },

  // 上传图片
  async uploadImage() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...' });
        
        try {
          for (const file of res.tempFiles) {
            const uploadRes = await fileApi.upload(file.tempFilePath);
            this.setData({
              images: [...this.data.images, uploadRes.data]
            });
          }
          wx.hideLoading();
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      categoryId: this.data.categories[index].id
    });
  },

  // 描述输入
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 交换方式选择
  onExchangeChange(e) {
    const index = e.detail.value;
    this.setData({
      exchangeIndex: index,
      exchangeType: index + 1
    });
  },

  // 价格输入
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  // 获取位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
        // 逆地理编码获取地址
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/',
          data: {
            location: `${res.latitude},${res.longitude}`,
            key: '您的腾讯地图 Key'
          },
          success: (res) => {
            if (res.data.status === 0) {
              this.setData({
                location: res.data.result.address
              });
            }
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '获取位置失败', icon: 'none' });
      }
    });
  },

  // 标签输入
  onTagsInput(e) {
    this.setData({ tags: e.detail.value });
  },

  // 提交发布
  async onSubmit() {
    const { images, title, description, categoryId, exchangeType, price, location, longitude, latitude, tags } = this.data;

    if (images.length === 0) {
      wx.showToast({ title: '请上传物品图片', icon: 'none' });
      return;
    }
    if (!title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!description) {
      wx.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }
    if (!location) {
      wx.showToast({ title: '请选择位置', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      await itemApi.publish({
        title,
        description,
        images,
        categoryId,
        exchangeType,
        price: price ? parseFloat(price) : 0,
        location,
        longitude,
        latitude,
        tags: tags ? tags.split(/[,,]/).map(t => t.trim()).filter(t => t) : []
      });

      wx.showToast({ title: '发布成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('发布失败', err);
    } finally {
      this.setData({ loading: false });
    }
  }
});
