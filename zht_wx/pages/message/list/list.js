// pages/message/list.js
const { messageApi } = require('../../../utils/api');

Page({
  data: {
    conversations: []
  },

  onShow() {
    this.loadConversations();
  },

  // 加载会话列表
  async loadConversations() {
    try {
      const res = await messageApi.getConversations();
      this.setData({ conversations: res.data || [] });
    } catch (err) {
      console.error('加载会话失败', err);
    }
  },

  // 跳转聊天
  toChat(e) {
    const user = e.currentTarget.dataset.user;
    wx.navigateTo({
      url: `/pages/message/chat?userId=${user.userId}&userName=${user.userNickname}&userAvatar=${user.userAvatar}`
    });
  }
});
