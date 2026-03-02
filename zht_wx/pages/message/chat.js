// pages/message/chat.js
const { messageApi } = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userId: 0,
    userName: '',
    otherAvatar: '',
    userInfo: null,
    messages: [],
    inputValue: '',
    scrollToView: ''
  },

  onLoad(options) {
    this.setData({
      userId: options.userId,
      userName: options.userName,
      otherAvatar: options.avatar
    });
    this.userInfo = app.globalData.userInfo;
    this.setData({ userInfo: this.userInfo });
    this.loadHistory();
  },

  async loadHistory() {
    try {
      const res = await messageApi.getHistory({
        targetUserId: this.data.userId,
        current: 1,
        size: 20
      });
      const messages = res.data.records.reverse();
      this.setData({ 
        messages: messages,
        scrollToView: messages.length > 0 ? 'msg-' + (messages.length - 1) : ''
      });
    } catch (err) {
      console.error('加载聊天记录失败', err);
    }
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async onSend() {
    if (!this.data.inputValue.trim()) return;

    const content = this.data.inputValue.trim();
    this.setData({ inputValue: '' });

    try {
      await messageApi.send({
        receiverId: this.data.userId,
        content: content,
        type: 1
      });

      // 添加本地消息
      const newMessage = {
        senderId: this.userInfo.id,
        content: content,
        createTime: this.formatTime(new Date())
      };
      
      this.setData({
        messages: [...this.data.messages, newMessage],
        scrollToView: 'msg-' + this.data.messages.length
      });
    } catch (err) {
      console.error('发送消息失败', err);
      this.setData({ inputValue: content });
    }
  },

  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
});
