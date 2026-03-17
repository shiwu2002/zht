// pages/review/add.js
const { reviewApi, exchangeApi } = require('../../../utils/api');
const app = getApp();

Page({
  data: {
    exchangeId: 0,
    targetUserId: 0,
    targetUser: {
      nickname: '',
      avatar: ''
    },
    exchangeInfo: {
      itemTitle: ''
    },
    rating: 0,
    content: '',
    tags: [],
    tagOptions: ['守时守信', '友好沟通', '物品相符', '爽快交易', '值得推荐', '一般般', '需要改进'],
    ratingText: '请选择评分'
  },

  onLoad(options) {
    console.log('评价页面参数:', options);

    this.setData({
      exchangeId: parseInt(options.exchangeId),
      targetUserId: parseInt(options.targetUserId),
      'targetUser.nickname': options.targetNickname || '未知用户',
      'targetUser.avatar': options.targetAvatar,
      'exchangeInfo.itemTitle': options.itemTitle || '未知物品'
    });
  },

  // 选择评分
  onSelectRating(e) {
    const score = parseInt(e.currentTarget.dataset.score);
    const ratingTexts = ['非常不满意', '不满意', '一般', '满意', '非常满意'];

    this.setData({
      rating: score,
      ratingText: ratingTexts[score - 1]
    });
  },

  // 输入评价内容
  onInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 选择快捷标签
  onSelectTag(e) {
    const tag = e.currentTarget.dataset.tag;
    let tags = this.data.tags;

    if (tags.indexOf(tag) !== -1) {
      // 取消选择
      tags = tags.filter(t => t !== tag);
    } else {
      // 添加标签（最多 3 个）
      if (tags.length < 3) {
        tags = [...tags, tag];
      } else {
        wx.showToast({ title: '最多选择 3 个标签', icon: 'none' });
        return;
      }
    }

    this.setData({ tags });
  },

  // 提交评价
  async onSubmit() {
    const { rating, content, tags, exchangeId, targetUserId } = this.data;

    if (rating === 0) {
      wx.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    // 构建评价内容（包含标签）
    let finalContent = content;
    if (tags.length > 0) {
      finalContent = content + (content ? ' ' : '') + '[' + tags.join(', ') + ']';
    }

    try {
      await reviewApi.add({
        exchangeId: exchangeId,
        reviewedId: targetUserId,
        rating: rating,
        content: finalContent
      });

      wx.showToast({
        title: '评价成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('提交评价失败', err);
      if (err.code === 400 || err.message?.includes('已评价')) {
        wx.showToast({ title: '您已经评价过了', icon: 'none' });
      } else {
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      }
    }
  }
});
