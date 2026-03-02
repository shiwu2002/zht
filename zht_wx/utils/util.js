/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

/**
 * 格式化相对时间
 */
const formatRelativeTime = timestamp => {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;
  return formatTime(new Date(timestamp));
};

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * 节流函数
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 计算距离
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6378137; // 地球半径
  const radLat1 = lat1 * Math.PI / 180;
  const radLat2 = lat2 * Math.PI / 180;
  const a = radLat1 - radLat2;
  const b = (lng1 - lng2) * Math.PI / 180;
  const s = 2 * R * Math.asin(Math.sqrt(
    Math.sin(a/2) * Math.sin(a/2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(b/2) * Math.sin(b/2)
  ));
  return Math.round(s); // 米
};

module.exports = {
  formatTime,
  formatRelativeTime,
  debounce,
  throttle,
  calculateDistance
};
