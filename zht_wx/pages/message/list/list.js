// pages/message/list.js
const { messageApi, reviewApi, userApi } = require('../../../utils/api');
const app = getApp();

Page({
  data: {
    conversations: [],
    reviews: [],
    currentTab: 'all', // 'all' - 全部，'message' - 消息，'review' - 评价
    userId: null,
    userCache: {} // 缓存用户信息，避免重复请求
  },

  onLoad() {
    // 获取当前登录用户 ID
    const currentUserId = app.globalData.userInfo?.id;
    console.log('onLoad 获取当前用户 ID:', currentUserId);
    console.log('app.globalData.userInfo:', app.globalData.userInfo);
    this.setData({ userId: currentUserId });
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  async loadData() {
    await Promise.all([
      this.loadConversations(),
      this.loadReviews()
    ]);
  },

  // 加载会话列表
  async loadConversations() {
    try {
      const res = await messageApi.getConversations();
      console.log('获取会话列表响应:', res);
      console.log('响应 data 字段:', res.data);
      
      // 后端返回的是消息记录数组，需要转换为会话列表
      // 每条消息包含：id, senderId, receiverId, content, createTime 等
      const messages = res.data || [];
      
      // 获取当前用户 ID
      const currentUserId = this.data.userId;
      console.log('当前用户 ID:', currentUserId);
      
      if (!currentUserId) {
        console.error('错误：当前用户未登录');
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      // 将消息转换为会话列表
      const conversationMap = new Map();
      
      messages.forEach(msg => {
        // 确定对方用户 ID (不是当前用户的那个)
        const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        
        // 如果这个用户的会话还没记录，或者这条消息更新，则更新会话
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userNickname: '用户' + otherUserId, // 默认昵称
            userAvatar: '/images/other/xiaoxi.png', // 默认头像
            lastContent: msg.content,
            lastTime: msg.createTime,
            unreadCount: msg.isRead === 0 && msg.receiverId === currentUserId ? 1 : 0,
            itemId: msg.itemId
          });
        } else {
          // 更新已有会话 (取最新的消息)
          const existing = conversationMap.get(otherUserId);
          if (msg.createTime > existing.lastTime) {
            existing.lastContent = msg.content;
            existing.lastTime = msg.createTime;
            if (msg.isRead === 0 && msg.receiverId === currentUserId) {
              existing.unreadCount += 1;
            }
          }
        }
      });
      
      // 转换为数组
      let conversations = Array.from(conversationMap.values());
      console.log('转换后的会话列表:', conversations);
      
      // 批量加载用户详情信息
      conversations = await this.loadUserDetails(conversations);
      console.log('加载用户详情后的会话列表:', conversations);
      console.log('第一条会话数据:', conversations[0]);
      
      this.setData({ conversations: conversations });
    } catch (err) {
      console.error('加载会话失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  
  // 批量加载用户详情
  async loadUserDetails(conversations) {
    // 收集需要查询的用户 ID (只查询缓存中没有的)
    const userIds = conversations
      .filter(c => !this.data.userCache[c.userId])
      .map(c => c.userId);
    
    console.log('需要加载用户详情的 ID:', userIds);
    
    // 批量请求用户信息
    if (userIds.length > 0) {
      try {
        const promises = userIds.map(async (uid) => {
          try {
            const res = await userApi.getUserInfoById(uid);
            if (res.data) {
              // 缓存用户信息
              this.setData({
                [`userCache[${uid}]`]: {
                  nickname: res.data.nickname || '用户' + uid,
                  avatar: res.data.avatar || '/images/other/xiaoxi.png'
                }
              });
            }
          } catch (err) {
            console.error('获取用户' + uid + '信息失败:', err);
          }
        });
        
        await Promise.all(promises);
        
        // 更新会话列表中的用户信息
        conversations = conversations.map(conv => {
          const userInfo = this.data.userCache[conv.userId];
          if (userInfo) {
            return {
              ...conv,
              userNickname: userInfo.nickname,
              userAvatar: userInfo.avatar
            };
          }
          return conv;
        });
      } catch (err) {
        console.error('批量加载用户详情失败:', err);
      }
    }
    
    return conversations;
  },

  // 加载评价列表
  async loadReviews() {
    try {
      if (!this.data.userId) {
        console.log('用户未登录，跳过评价加载');
        return;
      }

      const res = await reviewApi.getUserList(this.data.userId, {
        current: 1,
        size: 10
      });
      console.log('获取评价列表响应:', res);

      let reviews = [];
      if (res.data && Array.isArray(res.data.records)) {
        reviews = res.data.records;
      } else if (Array.isArray(res.data)) {
        reviews = res.data;
      }

      console.log('处理后的评价列表:', reviews);
      this.setData({ reviews: reviews });
    } catch (err) {
      console.error('加载评价失败', err);
    }
  },

  // 切换 Tab
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 跳转聊天
  toChat(e) {
    const user = e.currentTarget.dataset.user;
    console.log('跳转到聊天页面，用户信息:', user);
    console.log('用户 ID 类型:', typeof user.userId, '值:', user.userId);
    console.log('用户完整数据:', JSON.stringify(user));
    
    // 检查 userId 是否存在
    if (!user.userId) {
      console.error('错误：用户 ID 不存在', user);
      wx.showToast({ title: '用户信息不完整', icon: 'none' });
      return;
    }
    
    // 构建跳转参数，注意参数名要与聊天页面接收的一致
    const params = {
      targetUserId: user.userId,  // 使用 targetUserId 作为参数名
      userName: user.userNickname || '未知用户',
      avatar: user.userAvatar || '/images/other/xiaoxi.png'
    };
    
    // 如果有物品信息，也一起传递
    if (user.itemId) {
      params.itemId = user.itemId;
      params.itemTitle = encodeURIComponent(user.itemTitle || '');
    }
    
    // 构建查询字符串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const url = `/pages/message/chat/chat?${queryString}`;
    console.log('跳转 URL:', url);
    wx.navigateTo({ url });
  },

  // 查看评价详情 (跳转到交换详情或物品详情)
  viewReview(e) {
    const review = e.currentTarget.dataset.review;
    console.log('查看评价:', review);
    // TODO: 根据 exchangeId 跳转到交换详情页
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
