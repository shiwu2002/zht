// pages/exchange/detail.js
const { exchangeApi, reviewApi, userApi } = require('../../../utils/api');

Page({
  data: {
    id: 0,
    detail: null,
    userId: 0,
    statusMap: ['待确认', '已确认', '已完成', '已拒绝', '已取消'],
    isApplicant: false,
    // 物品信息
    offerItem: null,
    requestItem: null,
    // 评价信息
    review: null,
    // 是否可以评价（交换已完成且当前用户是申请人且还未评价）
    canReview: false
  },

  onLoad(options) {
    this.setData({ id: options.id });
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userId: userInfo?.id || 0 });
    // 先加载详情，再加载评价，最后检查是否可以评价
    this.loadDetail();
    // loadReview 会在 loadDetail 完成后通过回调或 Promise 处理
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

      // 判断当前用户是申请人还是物品主人
      const isApplicant = rawData.applicantId === this.data.userId;

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
      
      this.setData({
        detail: formattedData,
        isApplicant: isApplicant,
        offerItem: offerItem,
        requestItem: requestItem,
        targetUserId: isApplicant ? rawData.ownerId : rawData.applicantId,
        targetUserNickname: isApplicant ? rawData.ownerNickname : rawData.applicantNickname,
        targetUserAvatar: isApplicant ? rawData.ownerAvatar : rawData.applicantAvatar,
        canReview: false
      });

      // 加载详情完成后，加载评价
      this.loadReview();
    } catch (err) {
      console.error('加载详情失败', err);
      wx.showToast({ title: '加载失败：' + (err.message || '未知错误'), icon: 'none' });
    }
  },

  // 图片加载错误处理
  onImageError(e) {
    const type = e.currentTarget.dataset.type;

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
            await this.loadDetail();
          } catch (err) {
            console.error('完成失败', err);
          }
        }
      }
    });
  },

  // 检查是否可以评价
  async checkCanReview() {
    // 只有交换已完成 (status=2)、且还未评价时才可以评价
    const statusOk = this.data.detail?.status === 2;
    const noReview = !this.data.review;

    if (statusOk && noReview) {
      this.setData({ canReview: true });
    }
  },

  // 跳转评价页面
  goToReview() {
    const { detail } = this.data;

    // 从 detail 中获取目标用户 ID，或者从直接存储的字段获取
    const targetUserId = this.data.targetUserId || detail?.targetUserId;
    const targetUserNickname = this.data.targetUserNickname || detail?.targetUserName;
    const targetUserAvatar = this.data.targetUserAvatar || detail?.targetUserAvatar;
    const itemTitle = detail?.itemTitle || '';

    if (!targetUserId) {
      wx.showToast({ title: '用户信息不完整', icon: 'none' });
      return;
    }

    const url = `/pages/review/add/add?exchangeId=${this.data.id}&targetUserId=${targetUserId}&targetNickname=${targetUserNickname || '未知用户'}&targetAvatar=${targetUserAvatar || ''}&itemTitle=${encodeURIComponent(itemTitle)}`;
    wx.navigateTo({ url });
  },

  // 加载评价
  async loadReview() {
    try {
      const res = await reviewApi.getExchangeReview(this.data.id);

      if (res.data) {
        const review = res.data;
        // 补充评价者头像和名称
        const enrichedReview = await this.enrichReviewData(review);
        this.setData({
          review: enrichedReview,
          canReview: false // 已有评价，不能再次评价
        });
      } else {
        // 没有评价，检查是否可以评价
        this.checkCanReview();
      }
    } catch (err) {
      // 如果没有评价，不显示错误
      if (err.code !== 404) {
        console.error('加载评价失败', err);
      }
      // 404 表示没有评价，检查是否可以评价
      this.checkCanReview();
    }
  },

  // 补充评价数据（头像、名称）
  async enrichReviewData(review) {
    if (!review) return null;

    try {
      const reviewerId = review.reviewerId;
      return {
        ...review,
        reviewerAvatar: '/images/login/morentouxiang.png',
        reviewerName: '用户'
      };
    } catch (err) {
      return {
        ...review,
        reviewerAvatar: '/images/login/morentouxiang.png',
        reviewerName: '用户'
      };
    }
  }
});
