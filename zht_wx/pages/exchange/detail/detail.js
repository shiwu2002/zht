// pages/exchange/detail.js
const { exchangeApi } = require('../../../utils/api');

Page({
  data: {
    id: 0,
    detail: null,
    userId: 0,
    statusMap: ['待确认', '已确认', '已完成', '已拒绝', '已取消'],
    isApplicant: false,
    // 物品信息
    offerItem: null,
    requestItem: null
  },

  onLoad(options) {
    this.setData({ id: options.id });
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userId: userInfo?.id || 0 });
    this.loadDetail();
  },

  // 提取图片 URL（处理可能的数组格式）
  extractImageUrl(imageStr) {
    if (!imageStr || typeof imageStr !== 'string') return null;
    
    // 去除首尾空格
    let str = imageStr.trim();
    
    console.log('[extractImageUrl] 输入:', str);
    
    // 如果包含 http 或 https，直接提取 URL 部分
    if (str.includes('http://') || str.includes('https://')) {
      // 提取第一个 http(s) 开始的部分
      const httpMatch = str.match(/https?:\/\/[^\s\]"']+/);
      if (httpMatch) {
        console.log('[extractImageUrl] 提取 HTTP URL:', httpMatch[0]);
        return httpMatch[0];
      }
    }
    
    // 如果是数组格式，提取第一个 URL
    if (str.startsWith('[')) {
      try {
        // 尝试 JSON 解析（需要完整的数组格式）
        if (str.endsWith(']')) {
          const urls = JSON.parse(str);
          if (Array.isArray(urls) && urls.length > 0) {
            const url = urls[0].trim();
            console.log('[extractImageUrl] JSON 解析:', url);
            return url;
          }
        }
      } catch (e) {
        console.log('[extractImageUrl] JSON 解析失败:', e.message);
      }
      
      // 手动提取方括号内的内容
      const match = str.match(/\[(.*?)\]/);
      if (match && match[1]) {
        // 如果有多个 URL 用逗号分隔，取第一个
        const firstUrl = match[1].split(',')[0].trim();
        // 去除引号
        const cleanUrl = firstUrl.replace(/["']/g, '').trim();
        console.log('[extractImageUrl] 正则提取:', cleanUrl);
        return cleanUrl;
      }
    }
    
    // 如果是普通字符串，直接返回（去除可能的引号）
    const cleanStr = str.replace(/["']/g, '').trim();
    console.log('[extractImageUrl] 直接返回:', cleanStr);
    return cleanStr;
  },

  async loadDetail() {
    try {
      const res = await exchangeApi.getDetail(this.data.id);
      
      // 处理分页数据结构，从 records 数组中获取第一条记录
      let rawData;
      if (res.data && res.data.records && res.data.records.length > 0) {
        rawData = res.data.records[0];
      } else if (res.data && Array.isArray(res.data)) {
        // 如果直接返回数组
        rawData = res.data[0];
      } else {
        // 如果直接返回对象
        rawData = res.data;
      }
      
      if (!rawData) {
        wx.showToast({ title: '未找到数据', icon: 'none' });
        return;
      }
      
      console.log('原始数据:', rawData);
      console.log('当前用户 ID:', this.data.userId);
      
      // 判断当前用户是申请人还是物品主人
      const isApplicant = rawData.applicantId === this.data.userId;
      
      console.log('是否为申请人:', isApplicant);
      console.log('rawData.applicantId:', rawData.applicantId, 'this.data.userId:', this.data.userId);
      
      // 构建对方信息（如果不是申请人，对方就是申请人；如果是申请人，对方就是物品主人）
      const targetUserInfo = isApplicant ? {
        nickname: rawData.ownerNickname || '未知用户',
        avatar: rawData.ownerAvatar || '/images/login/morentouxiang.png',
        credit: 0
      } : {
        nickname: rawData.applicantNickname || '未知用户',
        avatar: rawData.applicantAvatar || '/images/login/morentouxiang.png',
        credit: 0
      };
      
      console.log('对方信息:', targetUserInfo);
      console.log('对方昵称:', targetUserInfo.nickname);
      console.log('对方头像:', targetUserInfo.avatar);
      
      // 确保昵称和头像有值
      if (!targetUserInfo.nickname || targetUserInfo.nickname === '未知用户') {
        console.warn('对方昵称为空，使用默认值');
      }
      if (!rawData.itemTitle) {
        console.warn('物品标题为空');
      }
      
      // 格式化时间
      const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
          return dateStr;
        }
      };
      
      // 构建映射后的数据
      const formattedData = {
        ...rawData,
        exchangeNo: `EX${rawData.id.toString().padStart(6, '0')}`,
        createTime: formatDateTime(rawData.createTime),
        completeTime: rawData.completedTime ? formatDateTime(rawData.completedTime) : null,
        targetUserName: targetUserInfo.nickname,
        targetUserAvatar: targetUserInfo.avatar,
        targetUserCredit: targetUserInfo.credit,
        targetUserId: isApplicant ? rawData.ownerId : rawData.applicantId,
        requestUserId: rawData.applicantId
      };
      
      // 构建提供的物品信息
      const offerItem = {
        id: rawData.offerItemId || rawData.itemId,
        title: rawData.offerItemTitle || rawData.itemTitle || '未知物品',
        image: this.extractImageUrl(rawData.offerItemImage) || this.extractImageUrl(rawData.itemImage) || '/images/login/morentouxiang.png'
      };
      
      // 构建请求的物品信息
      const requestItem = {
        id: rawData.itemId,
        title: rawData.itemTitle || '未知物品',
        image: this.extractImageUrl(rawData.itemImage) || '/images/login/morentouxiang.png'
      };
      
      console.log('映射后的数据:', formattedData);
      console.log('提供的物品:', offerItem);
      console.log('请求的物品:', requestItem);
      console.log('targetUserName:', formattedData.targetUserName);
      console.log('isApplicant:', isApplicant);
      
      // 调试图片路径
      console.log('offerItemImage 原始值:', rawData.offerItemImage);
      console.log('offerItemImage 类型:', typeof rawData.offerItemImage);
      const extractedOfferImage = this.extractImageUrl(rawData.offerItemImage);
      console.log('offerItemImage 提取后:', extractedOfferImage);
      
      const extractedItemImage = this.extractImageUrl(rawData.itemImage);
      console.log('itemImage 原始值:', rawData.itemImage);
      console.log('itemImage 类型:', typeof rawData.itemImage);
      console.log('itemImage 提取后:', extractedItemImage);
      
      console.log('最终 offerItem:', offerItem);
      console.log('最终 requestItem:', requestItem);
      
      this.setData({ 
        detail: formattedData,
        isApplicant: isApplicant,
        offerItem: offerItem,
        requestItem: requestItem
      });
      
      // 验证 setData 后的值
      setTimeout(() => {
        console.log('验证 - page data.offerItem:', this.data.offerItem);
        console.log('验证 - page data.requestItem:', this.data.requestItem);
        console.log('验证 - offerItem.image:', this.data.offerItem.image);
        console.log('验证 - requestItem.image:', this.data.requestItem.image);
      }, 100);
      
      console.log('setData 完成');
      console.log('page data.detail:', this.data.detail);
      console.log('page data.isApplicant:', this.data.isApplicant);
      console.log('page data.offerItem:', this.data.offerItem);
      console.log('page data.requestItem:', this.data.requestItem);
    } catch (err) {
      console.error('加载详情失败', err);
      wx.showToast({ title: '加载失败：' + (err.message || '未知错误'), icon: 'none' });
    }
  },

  // 图片加载错误处理
  onImageError(e) {
    const type = e.currentTarget.dataset.type;
    console.error(`${type} 物品图片加载失败`, e);
    
    // 设置默认图片
    if (type === 'offer') {
      const newOfferItem = { ...this.data.offerItem, image: '/images/login/morentouxiang.png' };
      this.setData({ offerItem: newOfferItem });
    } else if (type === 'request') {
      const newRequestItem = { ...this.data.requestItem, image: '/images/login/morentouxiang.png' };
      this.setData({ requestItem: newRequestItem });
    }
  },

  async onConfirm() {
    wx.showModal({
      title: '确认交换',
      content: '确认完成这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.confirm(this.data.id);
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('确认失败', err);
          }
        }
      }
    });
  },

  async onReject() {
    wx.showModal({
      title: '拒绝交换',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.reject(this.data.id, res.content || '无理由');
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('拒绝失败', err);
          }
        }
      }
    });
  },

  async onCancel() {
    wx.showModal({
      title: '取消交换',
      content: '确定要取消这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.cancel(this.data.id);
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('取消失败', err);
          }
        }
      }
    });
  },

  async onComplete() {
    wx.showModal({
      title: '完成交换',
      content: '确认已经完成交换了吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.complete(this.data.id);
            wx.showToast({ title: '已完成', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            console.error('完成失败', err);
          }
        }
      }
    });
  }
});
