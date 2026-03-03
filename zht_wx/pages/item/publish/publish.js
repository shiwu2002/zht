// pages/item/publish.js
const { itemApi, categoryApi, fileApi } = require('../../../utils/api');
const { uploadImages, deleteImage, previewImage } = require('../../../utils/imageUploader');

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
    loading: false,
    showLocationPicker: false,
    manualLocation: ''
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

  // 上传图片（多图）
  async uploadImage() {
    try {
      const newImages = await uploadImages({
        count: 9,
        existingImages: this.data.images,
        onProgress: (progress) => {
          wx.showLoading({ 
            title: `上传中 ${progress.uploaded}/${progress.total}`,
            mask: true 
          });
        }
      });
      
      this.setData({ images: newImages });
      wx.hideLoading();
    } catch (err) {
      console.error('上传图片失败', err);
      wx.hideLoading();
    }
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const newImages = deleteImage(this.data.images, index);
    this.setData({ images: newImages });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    previewImage(this.data.images, index);
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
    wx.showModal({
      title: '选择位置',
      content: '请选择获取位置的方式',
      confirmText: '自动获取',
      cancelText: '手动输入',
      success: (res) => {
        if (res.confirm) {
          this.autoGetLocation();
        } else if (res.cancel) {
          this.setData({ showLocationPicker: true });
        }
      }
    });
  },

  // 自动获取位置
  autoGetLocation() {
    wx.showLoading({ title: '正在获取位置...', mask: true });
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('获取位置成功:', res);
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
        // 逆地理编码获取地址
        this.reverseGeocoding(res.latitude, res.longitude);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取位置失败', err);
        // 自动获取失败，提示用户手动输入或地图选点
        wx.showModal({
          title: '提示',
          content: '自动获取位置失败，请在地图上选择位置',
          showCancel: true,
          confirmText: '地图选点',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.chooseLocationOnMap();
            }
          }
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 逆地理编码
  reverseGeocoding(latitude, longitude) {
    // 注意：需要在腾讯地图开放平台申请 key
    // https://lbs.qq.com/dev/console/application/mine
    const QQ_MAP_KEY = '您的腾讯地图 Key'; // 请替换为实际的 key
    
    wx.showLoading({ title: '正在获取地址...', mask: true });
    
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: QQ_MAP_KEY
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status === 0 && res.data.result) {
          // 使用详细地址作为显示文本
          const fullAddress = res.data.result.address;
          console.log('逆地理编码成功:', fullAddress);
          this.setData({
            location: fullAddress
          });
          wx.showToast({ title: '位置获取成功', icon: 'success' });
        } else {
          wx.hideLoading();
          console.error('逆地理编码失败:', res.data);
          // 如果逆地理编码失败，提示用户手动输入
          wx.showModal({
            title: '提示',
            content: '无法获取详细地址，请在地图上选择位置',
            showCancel: true,
            confirmText: '地图选点',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.chooseLocationOnMap();
              }
            }
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        console.error('逆地理编码请求失败');
        // 如果请求失败，提示用户手动输入
        wx.showModal({
          title: '提示',
          content: '无法获取详细地址，请在地图上选择位置',
          showCancel: true,
          confirmText: '地图选点',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.chooseLocationOnMap();
            }
          }
        });
      }
    });
  },

  // 手动输入位置
  onManualLocationInput(e) {
    this.setData({
      manualLocation: e.detail.value
    });
  },

  // 确认手动输入的位置
  confirmManualLocation() {
    if (!this.data.manualLocation) {
      wx.showToast({ title: '请输入位置', icon: 'none' });
      return;
    }
    this.setData({
      location: this.data.manualLocation,
      showLocationPicker: false
    });
    wx.showToast({ title: '位置已设置', icon: 'success' });
  },

  // 取消手动输入
  cancelManualLocation() {
    this.setData({
      showLocationPicker: false
    });
  },

  // 在地图上选择位置
  chooseLocationOnMap() {
    console.log('准备调用 wx.chooseLocation');
    wx.chooseLocation({
      success: (res) => {
        console.log('地图选点成功:', res);
        // 使用地图返回的详细地址
        const fullAddress = res.address + ' ' + res.name;
        console.log('详细地址:', fullAddress);
        this.setData({
          location: fullAddress.trim(),
          longitude: res.longitude,
          latitude: res.latitude,
          showLocationPicker: false
        });
        wx.showToast({ title: '位置已选择', icon: 'success' });
      },
      fail: (err) => {
        console.error('地图选点失败:', err);
        wx.showToast({ title: '选择失败，请重试', icon: 'none' });
      },
      complete: () => {
        console.log('地图选点完成');
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
        tags: tags || ''
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
