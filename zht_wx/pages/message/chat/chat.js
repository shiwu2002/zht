// pages/message/chat.js
const { messageApi } = require('../../../utils/api');
const app = getApp();

Page({
  data: {
    currentUserId: 0,
    userName: '',
    userInfo: null,
    messages: [],
    inputValue: '',
    scrollToView: '',
    // 物品相关信息
    itemId: null,
    itemTitle: '',
    showItemInfo: false
  },

  onLoad(options) {
    console.log('聊天页面 onLoad 参数:', options);

    // 接收参数，优先使用 targetUserId，兼容旧的 userId 参数
    const targetUserId = options.targetUserId || options.userId;

    // 存储目标用户 ID 用于后续 API 调用
    this.targetUserId = targetUserId;

    this.setData({
      userName: options.userName,
      otherAvatar: options.avatar,
      itemId: options.itemId,
      itemTitle: options.itemTitle ? decodeURIComponent(options.itemTitle) : ''
    });

    // 如果从物品页面进入，显示物品信息
    if (options.itemId) {
      this.setData({ showItemInfo: true });
    }

    this.userInfo = app.globalData.userInfo;
    const currentUserId = this.userInfo?.id || 0;
    console.log('当前用户 ID:', currentUserId, 'userInfo:', this.userInfo);

    this.setData({
      userInfo: this.userInfo,
      currentUserId: currentUserId
    });
    this.loadHistory();
  },

  async loadHistory() {
    try {
      let res;
      if (this.data.itemId) {
        // 加载关于特定物品的聊天记录
        res = await messageApi.getItemHistory(this.targetUserId, this.data.itemId, {
          current: 1,
          size: 20
        });
      } else {
        // 加载与用户的所有聊天记录
        res = await messageApi.getHistory({
          targetUserId: this.targetUserId,
          current: 1,
          size: 20
        });
      }

      console.log('聊天记录响应:', res);

      const messages = res.data.records.reverse();
      console.log('处理后的消息列表:', messages);

      // 处理消息时间格式
      const formattedMessages = messages.map(msg => ({
        ...msg,
        createTime: this.formatTime(msg.createTime)
      }));

      this.setData({
        messages: formattedMessages,
        scrollToView: formattedMessages.length > 0 ? 'msg-' + (formattedMessages.length - 1) : ''
      });
      
      // 标记未读消息为已读
      this.markMessagesAsRead(messages);
    } catch (err) {
      console.error('加载聊天记录失败', err);
    }
  },
  
  // 批量标记消息已读
  async markMessagesAsRead(messages) {
    try {
      // 找出所有未读的消息 (isRead === 0)
      const unreadMessages = messages.filter(msg => msg.isRead === 0);
      
      if (unreadMessages.length === 0) {
        console.log('没有未读消息需要标记');
        return;
      }
      
      console.log('标记未读消息已读:', unreadMessages.length, '条');
      
      // 批量标记已读
      const promises = unreadMessages.map(msg => 
        messageApi.markRead(msg.id)
      );
      
      await Promise.all(promises);
      console.log('标记消息已读完成');
      
      // 触发会话列表页面刷新 (可选)
      const pages = getCurrentPages();
      const messageListPage = pages.find(page => page.route === 'pages/message/list/list');
      if (messageListPage) {
        messageListPage.loadConversations();
      }
    } catch (err) {
      console.error('标记消息已读失败', err);
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
      const sendData = {
        receiverId: this.targetUserId,
        content: content,
        type: 1
      };
      
      // 如果是从物品页面进入，关联物品 ID
      if (this.data.itemId) {
        sendData.itemId = this.data.itemId;
      }
      
      await messageApi.send(sendData);

      // 添加本地消息
      const newMessage = {
        senderId: this.userInfo.id,
        senderAvatar: this.userInfo.avatar,
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

  formatTime(timeStr) {
    if (!timeStr) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    // 处理后端返回的字符串格式 "2026-03-17T23:29:17"
    const date = new Date(timeStr);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
});
