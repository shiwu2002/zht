// pages/item/edit.js
const { itemApi, fileApi, categoryApi } = require('../../utils/api');

Page({
  data: {
    id: 0,
    title: '',
    description: '',
    images: [],
    categoryId: 0,
    categories: [],
    exchangeTypes: ['未知', '面对面交换', '邮寄交换', '均可'],
    exchangeType: 1,
    price: '',
    exchangeCondition: '',
    location: '',
    longitude: 0,
    latitude: 0,
    uploading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: parseInt(options.id) });
      this.loadItem();
    }
    this.loadCategories();
  },

  async loadItem() {
    try {
      const res = await itemApi.getDetail(this.data.id);
      const item = res.data;
      this.setData({
        title: item.title,
        description: item.description,
        images: item.images || [],
        categoryId: item.categoryId,
        exchangeType: item.exchangeType || 1,
        price: item.price ? String(item.price) : '',
        exchangeCondition: item.exchangeCondition || '',
        location: item.location,
        longitude: item.longitude || 0,
        latitude: item.latitude || 0
      });
    } catch (err) {
      console.error('加载物品失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async loadCategories() {
    try {
      const res = await categoryApi.getList();
      this.setData({ categories: res.data || [] });
    } catch (err) {
      console.error('加载分类失败', err);
    }
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      success: async (res) => {
        this.setData({ uploading: true });
        try {
          const uploadPromises = res.tempFiles.map(file => fileApi.upload(file.tempFilePath));
          const uploadResults = await Promise.all(uploadPromises);
          const newImages = uploadResults.map(r => r.data);
          
          this.setData({
            images: [...this.data.images, ...newImages]
          });
        } catch (err) {
          console.error('上传失败', err);
          wx.showToast({ title: '上传失败', icon: 'none' });
        } finally {
          this.setData({ uploading: false });
        }
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const images = [...this.data.images];
          images.splice(index, 1);
          this.setData({ images });
        }
      }
    });
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 描述输入
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 分类选择
  onCategoryChange(e) {
    this.setData({ categoryId: parseInt(e.detail.value) });
  },

  // 交换方式选择
  onExchangeTypeChange(e) {
    this.setData({ exchangeType: parseInt(e.detail.value) });
  },

  // 价格输入
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  // 交换条件输入
  onConditionInput(e) {
    this.setData({ exchangeCondition: e.detail.value });
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.address + res.name,
          longitude: res.longitude,
          latitude: res.latitude
        });
      }
    });
  },

  // 提交
  async onSubmit() {
    if (!this.data.title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!this.data.description) {
      wx.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请上传图片', icon: 'none' });
      return;
    }
    if (!this.data.categoryId) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    if (!this.data.location) {
      wx.showToast({ title: '请选择位置', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const itemData = {
        id: this.data.id || undefined,
        title: this.data.title,
        description: this.data.description,
        images: this.data.images,
        categoryId: this.data.categoryId,
        exchangeType: this.data.exchangeType,
        price: this.data.price ? parseFloat(this.data.price) : undefined,
        exchangeCondition: this.data.exchangeCondition,
        location: this.data.location,
        longitude: this.data.longitude,
        latitude: this.data.latitude
      };

      if (this.data.id) {
        await itemApi.update(itemData);
        wx.showToast({ title: '修改成功', icon: 'success' });
      } else {
        await itemApi.publish(itemData);
        wx.showToast({ title: '发布成功', icon: 'success' });
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存失败', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
