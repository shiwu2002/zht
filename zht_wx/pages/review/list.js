// pages/review/list.js
const { reviewApi, userApi } = require('../../../utils/api');

Page({
  data: {
    userId: 0,
    reviewList: [],
    loading: false,
    hasMore: true,
    current: 1,
    size: 10
  },

  onLoad(options) {
    this.setData({ userId: options.userId });
    this.loadReviews();
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadReviews();
    }
  },

  async loadReviews() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await reviewApi.getUserList(this.data.userId, {
        current: this.data.current,
        size: this.data.size
      });

      const reviews = res.data.records || [];
      
      // 获取评价者头像信息
      const enrichedReviews = await this.enrichReviewerAvatars(reviews);

      const newList = this.data.current === 1
        ? enrichedReviews
        : [...this.data.reviewList, ...enrichedReviews];

      this.setData({
        reviewList: newList,
        hasMore: this.data.current < res.data.pages,
        current: this.data.current + 1
      });
    } catch (err) {
      console.error('加载评价列表失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 补充评价者头像信息
  async enrichReviewerAvatars(reviews) {
    if (!reviews || reviews.length === 0) return [];

    // 根据后端返回的数据结构，评价数据应该包含 reviewerId
    // 如果需要获取头像，需要后端在返回评价列表时同时返回评价者头像
    // 或者提供一个批量获取用户信息的接口
    
    return reviews.map(review => ({
      ...review,
      // 如果后端返回的数据中包含头像，则使用；否则使用默认头像
      reviewerAvatar: review.reviewerAvatar || '/images/login/morentouxiang.png',
      reviewerName: review.reviewerName || '用户'
    }));
  },

  onRefresh() {
    this.setData({ current: 1, hasMore: true, reviewList: [] });
    this.loadReviews();
  }
});
