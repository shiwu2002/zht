# IconFont 图标使用指南

## 从 iconfont.cn 获取图标

### 步骤 1: 访问网站
打开 https://www.iconfont.cn

### 步骤 2: 搜索图标
在搜索框搜索需要的图标，推荐搜索词：
- 📚 教材类：`book`、`书本 `、`教育`、`学习`
- 💻 数码类：`phone`、`computer`、`数码 `、`电子`
- 👕 服饰类：`clothes`、`shirt`、`衣服`、`服装`
- 🏠 生活类：`home`、`life`、`生活 `、`家居`
- ⚽ 运动类：`sport`、`basketball`、`运动 `、`健身`
- 🍔 美食类：`food`、`restaurant`、`美食`、`餐饮`
- 💄 美妆类：`beauty`、`cosmetic`、`美妆 `、`化妆`
- 📦 其他类：`more`、`other`、`其他`、`分类`

### 步骤 3: 添加图标到项目
1. 点击喜欢的图标，添加到购物车
2. 点击右上角购物车图标
3. 点击"添加至项目"
4. 选择已有项目或创建新项目（如：校园二手）

### 步骤 4: 下载资源
1. 进入"我的项目"
2. 点击"Font 文件"
3. 点击"下载"按钮

### 步骤 5: 集成到项目

#### 方式一：本地字体文件（推荐）
1. 解压下载的资源包
2. 将字体文件复制到项目：
   ```
   zht_wx/
   └── fonts/
       ├── iconfont.woff2
       ├── iconfont.woff
       └── iconfont.ttf
   ```
3. 打开 `style/iconfont.wxss`
4. 取消 `@font-face` 注释
5. 复制资源包中的 CSS 内容，替换 Unicode 编码

#### 方式二：在线链接
1. 在项目页面获取"在线引用"链接
2. 在 `app.wxss` 顶部添加：
   ```css
   @import url('//at.alicdn.com/t/c/font_xxxxxx.css');
   ```

### 步骤 6: 更新分类图标映射
编辑 `pages/category/category.js` 中的 `CATEGORY_ICONS` 对象：

```javascript
const CATEGORY_ICONS = {
  '教材': { iconClass: 'book', iconUnicode: '\ue62d' }, // 替换为实际的 Unicode
  '数码': { iconClass: 'digital', iconUnicode: '\ue652' },
  // ... 其他分类
};
```

## 推荐图标风格

保持图标风格一致，推荐选择：
- **线条图标** - 简洁现代
- **面性图标** - 视觉突出
- **渐变图标** - 时尚活泼

## 颜色搭配

当前分类卡片使用了渐变色背景：
- 教材：紫色渐变 `#667eea → #764ba2`
- 数码：绿色渐变 `#07c160 → #06ad56`
- 服饰：粉色渐变 `#f093fb → #f5576c`
- 生活：蓝色渐变 `#4facfe → #00f2fe`
- 运动：橙粉渐变 `#fa709a → #fee140`
- 美食：青粉渐变 `#a8edea → #fed6e3`
- 美妆：粉紫渐变 `#ff9a9e → #fecfef`
- 其他：灰色渐变 `#e0e0e0 → #f5f5f5`

可根据图标颜色调整卡片背景色。

## 预览效果

分类页面现在显示为 4 列网格，每个分类卡片包含：
- 渐变色图标背景
- 分类名称
- 物品数量统计

支持搜索过滤功能！
