// pages/exchange/list.js
const { exchangeApi } = require('../../../utils/api');

Page({
  data: {
    currentTab: 0, // 0-全部，1-我发起的，2-我收到的
    exchangeList: [],
    allExchangeList: [], // 存储所有数据用于前端过滤
    loading: false,
    hasMore: true,
    current: 1,
    size: 50,
    statusMap: ['待确认', '已确认', '已完成', '已拒绝', '已取消']
  },

  onShow() {
    this.refreshList();
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadList();
    }
  },

  async loadList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const params = {
        current: this.data.current,
        size: this.data.size,
        type: this.data.currentTab // 传递 type 参数给后端：0-全部，1-我发起的，2-我收到的
      };
      
      console.log('加载交换列表，参数:', params);
      
      // 调用交换记录接口
      const res = await exchangeApi.getMyList(params);
      console.log('交换列表数据:', res.data);
      
      // 检查返回的数据是否是交换记录
      if (!res.data || !res.data.records) {
        console.error('返回数据格式错误');
        wx.showToast({ title: '数据格式错误', icon: 'none' });
        this.setData({ loading: false });
        return;
      }
      
      const newList = this.data.current === 1 
        ? res.data.records 
        : [...this.data.allExchangeList, ...res.data.records];

      this.setData({
        allExchangeList: newList,
        hasMore: this.data.current < res.data.pages,
        current: this.data.current + 1,
        exchangeList: newList // 直接使用后端返回的过滤数据
      });
    } catch (err) {
      console.error('加载交换记录失败', err);
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async refreshList() {
    this.setData({ current: 1, hasMore: true, allExchangeList: [], exchangeList: [] });
    await this.loadList();
  },

  onTabChange(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    console.log('切换 Tab:', tab);
    this.setData({ currentTab: tab });
    this.refreshList();
  },

  toDetail(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exchange/detail/detail?id=${exchangeId}`
    });
  },

  async confirmExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认交换',
      content: '确认完成这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.confirm(exchangeId);
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('确认失败', err);
          }
        }
      }
    });
  },

  async rejectExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒绝交换',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.reject(exchangeId, res.content || '无理由');
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('拒绝失败', err);
          }
        }
      }
    });
  },

  async cancelExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消交换',
      content: '确定要取消这次交换吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.cancel(exchangeId);
            wx.showToast({ title: '已取消', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('取消失败', err);
          }
        }
      }
    });
  },

  async completeExchange(e) {
    const exchangeId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成交换',
      content: '确认已经完成交换了吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await exchangeApi.complete(exchangeId);
            wx.showToast({ title: '已完成', icon: 'success' });
            this.refreshList();
          } catch (err) {
            console.error('完成失败', err);
          }
        }
      }
    });
  }
});
