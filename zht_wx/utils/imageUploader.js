/**
 * 图片上传工具模块
 * 支持单图上传、多图上传、头像上传
 */

const { fileApi } = require('./api');

/**
 * 选择并上传图片
 * @param {Object} options - 配置选项
 * @param {number} options.count - 最多选择图片数量，默认 9
 * @param {boolean} options.isAvatar - 是否为头像上传（单图），默认 false
 * @param {Array} options.existingImages - 已有图片数组（用于多图追加）
 * @param {Function} options.onProgress - 上传进度回调
 * @returns {Promise<Array>} 上传后的图片 URL 数组
 */
const uploadImages = async (options = {}) => {
  const {
    count = 9,
    isAvatar = false,
    existingImages = [],
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: isAvatar ? 1 : count - existingImages.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...', mask: true });

        try {
          const uploadedUrls = [];
          const totalFiles = res.tempFiles.length;
          
          // 逐个上传
          for (let i = 0; i < res.tempFiles.length; i++) {
            const file = res.tempFiles[i];
            const uploadRes = await fileApi.upload(file.tempFilePath);
            
            // 提取图片 URL
            const imageUrl = extractImageUrl(uploadRes.data);
            uploadedUrls.push(imageUrl);
            
            // 进度回调
            if (onProgress) {
              onProgress({
                total: totalFiles,
                uploaded: i + 1,
                percent: Math.round(((i + 1) / totalFiles) * 100)
              });
            }
          }

          wx.hideLoading();
          
          // 如果是追加模式，合并已有图片
          const result = isAvatar 
            ? uploadedUrls 
            : [...existingImages, ...uploadedUrls];
          
          resolve(result);
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ 
            title: err.message || '上传失败', 
            icon: 'none' 
          });
          reject(err);
        }
      },
      fail: (err) => {
        wx.showToast({ 
          title: err.errMsg || '选择失败', 
          icon: 'none' 
        });
        reject(err);
      }
    });
  });
};

/**
 * 提取图片 URL（处理可能的数组格式）
 * @param {string|array} data - 后端返回的图片数据
 * @returns {string} 图片 URL
 */
const extractImageUrl = (data) => {
  if (!data) return null;
  
  // 如果是数组，取第一个
  if (Array.isArray(data)) {
    return data[0];
  }
  
  // 如果是字符串
  if (typeof data === 'string') {
    let str = data.trim();
    
    // 处理数组格式的字符串
    if (str.startsWith('[')) {
      try {
        const urls = JSON.parse(str);
        if (Array.isArray(urls) && urls.length > 0) {
          return urls[0].trim();
        }
      } catch (e) {
        // 手动提取
        const match = str.match(/\[(.*?)\]/);
        if (match && match[1]) {
          return match[1].split(',')[0].trim().replace(/["']/g, '');
        }
      }
    }
    
    // 直接返回 URL
    return str.replace(/["']/g, '').trim();
  }
  
  return data;
};

/**
 * 删除图片
 * @param {Array} images - 图片数组
 * @param {number} index - 要删除的索引
 * @returns {Array} 删除后的图片数组
 */
const deleteImage = (images, index) => {
  const newImages = [...images];
  newImages.splice(index, 1);
  return newImages;
};

/**
 * 预览图片
 * @param {Array} images - 图片数组
 * @param {number} current - 当前预览的图片索引
 */
const previewImage = (images, current = 0) => {
  wx.previewImage({
    urls: images,
    current: current
  });
};

module.exports = {
  uploadImages,
  extractImageUrl,
  deleteImage,
  previewImage
};
