/**
 * API 配置
 */
const BASE_URL = 'http://localhost:8080/api'; // 根据实际后端地址修改

/**
 * 封装请求方法
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          wx.removeStorageSync('token');
          wx.reLaunch({ url: '/pages/login/login' });
          reject({ code: 401, message: '请先登录' });
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * 用户相关 API
 */
const userApi = {
  login: (data) => request({ url: '/user/login', method: 'POST', data }),
  getInfo: () => request({ url: '/user/info', method: 'GET' }),
  updateInfo: (data) => request({ url: '/user/update', method: 'PUT', data }),
  bindPhone: (phone) => request({ url: '/user/bind-phone', method: 'POST', data: { phone } }),
  getCreditScore: () => request({ url: '/user/credit-score', method: 'GET' }),
  // 获取其他用户信息
  getUserInfoById: (userId) => request({ url: `/user/info/${userId}`, method: 'GET' })
};

/**
 * 文件相关 API
 */
const fileApi = {
  upload: (filePath) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      wx.uploadFile({
        url: BASE_URL + '/file/upload',
        filePath: filePath,
        name: 'file',
        header: { 'Authorization': token ? `Bearer ${token}` : '' },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) resolve(data);
          else reject(data);
        },
        fail: (err) => reject(err)
      });
    });
  },
  delete: (fileName) => request({ url: '/file/delete', method: 'DELETE', data: { fileName } })
};

/**
 * 物品相关 API
 */
const itemApi = {
  publish: (data) => request({ url: '/item/publish', method: 'POST', data }),
  update: (data) => request({ url: '/item/update', method: 'PUT', data }),
  delete: (itemId) => request({ url: `/item/${itemId}`, method: 'DELETE' }),
  getDetail: (itemId) => request({ url: `/item/${itemId}`, method: 'GET' }),
  getList: (params) => request({ url: '/item/list', method: 'GET', data: params }),
  getMyItems: (params) => request({ url: '/item/my', method: 'GET', data: params }),
  getNearby: (params) => request({ url: '/item/nearby', method: 'GET', data: params })
};

/**
 * 分类相关 API
 */
const categoryApi = {
  getList: () => request({ url: '/category/list', method: 'GET' }),
  getHot: () => request({ url: '/category/hot', method: 'GET' })
};

/**
 * 交换相关 API
 */
const exchangeApi = {
  create: (data) => request({ url: '/exchange/create', method: 'POST', data }),
  confirm: (exchangeId) => request({ url: `/exchange/confirm/${exchangeId}`, method: 'POST' }),
  reject: (exchangeId, reason) => request({ url: `/exchange/reject/${exchangeId}`, method: 'POST', data: { reason } }),
  cancel: (exchangeId) => request({ url: `/exchange/cancel/${exchangeId}`, method: 'POST' }),
  complete: (exchangeId) => request({ url: `/exchange/complete/${exchangeId}`, method: 'POST' }),
  getDetail: (exchangeId) => request({ url: `/exchange/${exchangeId}`, method: 'GET' }),
  getMyList: (params) => request({ url: '/exchange/my', method: 'GET', data: params })
};

/**
 * 评价相关 API
 */
const reviewApi = {
  add: (data) => request({ url: '/review/add', method: 'POST', data }),
  getUserList: (userId, params) => request({ url: `/review/user/${userId}`, method: 'GET', data: params }),
  getExchangeReview: (exchangeId) => request({ url: `/review/exchange/${exchangeId}`, method: 'GET' })
};

/**
 * 收藏相关 API
 */
const favoriteApi = {
  add: (itemId) => request({ url: `/favorite/add/${itemId}`, method: 'POST' }),
  remove: (itemId) => request({ url: `/favorite/remove/${itemId}`, method: 'DELETE' }),
  check: (itemId) => request({ url: `/favorite/check/${itemId}`, method: 'GET' }),
  getMyList: (params) => request({ url: '/favorite/my', method: 'GET', data: params })
};

/**
 * 消息相关 API
 */
const messageApi = {
  // 发送消息
  send: (data) => request({ url: '/message/send', method: 'POST', data }),
  
  // 获取会话列表 (所有聊天对象的最近消息摘要)
  getConversations: () => request({ url: '/message/conversations', method: 'GET' }),
  
  // 获取与特定用户的聊天记录 (需要传递 targetUserId)
  getHistory: (params) => request({ url: '/message/history', method: 'GET', data: params }),
  
  // 标记消息已读
  markRead: (messageId) => request({ url: `/message/read/${messageId}`, method: 'POST' }),
  
  // 获取未读消息数
  getUnreadCount: () => request({ url: '/message/unread-count', method: 'GET' }),
  
  // 获取与特定用户关于特定物品的聊天记录
  getItemHistory: (targetUserId, itemId, params) => request({ 
    url: '/message/history', 
    method: 'GET', 
    data: { ...params, targetUserId, itemId } 
  })
};

/**
 * 举报相关 API
 */
const reportApi = {
  submit: (data) => request({ url: '/report/submit', method: 'POST', data }),
  getList: (params) => request({ url: '/report/list', method: 'GET', data: params }),
  handle: (reportId, status, handleResult) => request({ url: `/report/handle/${reportId}`, method: 'POST', data: { status, handleResult } })
};

module.exports = {
  BASE_URL,
  request,
  userApi,
  fileApi,
  itemApi,
  categoryApi,
  exchangeApi,
  reviewApi,
  favoriteApi,
  messageApi,
  reportApi
};
