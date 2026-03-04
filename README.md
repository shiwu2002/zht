# 闲置物品交换平台 - 全栈解决方案

基于微信小程序 + Spring Boot的闲置物品交换平台，包含后端服务和小程序前端两部分。

## 项目简介

本项目是一个完整的闲置物品交换平台，采用前后端分离架构：
- **后端服务**：基于Spring Boot 3.5.11 + MyBatis-Plus + MySQL开发
- **小程序前端**：基于微信原生小程序框架开发

支持用户通过微信小程序进行闲置物品的发布、检索、交换、沟通等功能。

## 技术栈

### 后端技术栈
- **Spring Boot**: 3.5.11
- **Java**: 21
- **MyBatis-Plus**: 3.5.9
- **MySQL**: 8.0+
- **Redis**: 缓存支持
- **JWT**: 用户认证
- **微信小程序SDK**: 4.6.0
- **WebSocket**: 即时通讯
- **Knife4j**: API文档
- **Hutool**: 工具类库

### 小程序技术栈
- **微信小程序原生框架**
- **JavaScript ES6+**
- **WXML/WXSS**

## 项目结构

```
zht/                                # 工作区根目录
├── zht/                           # 后端项目目录
│   ├── src/main/java/com/mzdx/zht/
│   │   ├── common/                # 通用类
│   │   ├── config/                # 配置类
│   │   ├── controller/            # 控制器层
│   │   ├── dto/                   # 数据传输对象
│   │   ├── entity/                # 实体类
│   │   ├── exception/             # 异常处理
│   │   ├── handler/               # 处理器
│   │   ├── interceptor/           # 拦截器
│   │   ├── mapper/                # Mapper接口
│   │   ├── service/               # 服务层
│   │   ├── utils/                 # 工具类
│   │   ├── vo/                    # 视图对象
│   │   └── websocket/             # WebSocket
│   ├── src/main/resources/
│   │   ├── sql/                   # SQL脚本
│   │   └── application.yml        # 配置文件
│   └── pom.xml                    # Maven配置
└── zht_wx/                        # 小程序项目目录
    ├── pages/                     # 页面
    │   ├── login/                 # 登录页
    │   ├── index/                 # 首页
    │   ├── item/                  # 物品相关
    │   ├── category/              # 分类页
    │   ├── exchange/              # 交换相关
    │   ├── message/               # 消息相关
    │   ├── favorite/              # 收藏页
    │   └── user/                  # 用户相关
    ├── utils/                     # 工具函数
    ├── images/                    # 图片资源
    ├── app.js                     # 小程序入口
    ├── app.json                   # 小程序配置
    └── README.md                  # 项目说明
```

## 功能模块

### 1. 用户模块
- 微信小程序授权登录
- 用户信息管理
- 手机号绑定
- 信用分系统

### 2. 物品模块
- 物品发布（支持图文上传、分类标签）
- 物品检索（关键词搜索、分类筛选、距离排序）
- 物品详情查看
- 我的发布管理
- 附近物品查询

### 3. 交换模块
- 发起交换申请
- 确认/拒绝交换
- 交换状态跟踪
- 交换记录查询

### 4. 消息模块
- 即时通讯（WebSocket）
- 会话列表
- 聊天记录
- 未读消息提醒

### 5. 收藏模块
- 添加/取消收藏
- 我的收藏列表

### 6. 评价模块
- 交换后评价
- 用户评价列表
- 信用分更新

### 7. 举报模块
- 提交举报
- 举报处理（管理员）

### 8. 文件模块
- 图片上传（本地存储）
- 图片删除

## 快速开始

### 1. 环境要求

#### 后端环境
- JDK 21+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

#### 小程序环境
- 微信开发者工具
- 有效的微信小程序AppID

### 2. 后端部署

#### 数据库配置
修改 `zht/src/main/resources/application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/zht?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

#### 初始化数据库
执行以下SQL脚本：

```bash
# 创建数据库表
cd zht
mysql -u root -p < src/main/resources/sql/schema.sql

# 初始化分类数据
mysql -u root -p < src/main/resources/sql/data.sql
```

#### 微信小程序配置
修改 `application.yml` 中的微信小程序配置：

```yaml
wechat:
  miniapp:
    appId: your_appid
    secret: your_secret
```

#### Redis配置
修改 `application.yml` 中的Redis配置：

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password  # 如果没有密码可以删除此行
```

#### 运行后端项目
```bash
# 使用Maven运行
cd zht
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/zht-0.0.1-SNAPSHOT.jar
```

#### 访问API文档
项目启动后，访问：http://localhost:8080/doc.html

### 3. 小程序部署

#### 配置后端地址
修改 `zht_wx/utils/api.js` 中的 `BASE_URL`:

```javascript
const BASE_URL = 'http://your-backend-ip:8080/api';
```

#### 导入微信开发者工具
1. 打开微信开发者工具
2. 导入项目，选择 `zht_wx` 目录
3. 填写您的 AppID
4. 编译运行

## API接口说明

### 用户相关
- `POST /api/user/login` - 微信小程序登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/update` - 更新用户信息
- `POST /api/user/bind-phone` - 绑定手机号
- `GET /api/user/credit-score` - 获取信用分

### 物品相关
- `POST /api/item/publish` - 发布物品
- `PUT /api/item/update` - 更新物品
- `DELETE /api/item/{itemId}` - 删除物品
- `GET /api/item/{itemId}` - 获取物品详情
- `GET /api/item/list` - 分页查询物品列表
- `GET /api/item/my` - 获取我的发布
- `GET /api/item/nearby` - 获取附近的物品

### 交换相关
- `POST /api/exchange/create` - 发起交换申请
- `POST /api/exchange/confirm/{exchangeId}` - 确认交换
- `POST /api/exchange/reject/{exchangeId}` - 拒绝交换
- `POST /api/exchange/cancel/{exchangeId}` - 取消交换
- `POST /api/exchange/complete/{exchangeId}` - 完成交换
- `GET /api/exchange/{exchangeId}` - 获取交换详情
- `GET /api/exchange/my` - 获取我的交换记录

### 消息相关
- `POST /api/message/send` - 发送消息
- `GET /api/message/conversations` - 获取会话列表
- `GET /api/message/history` - 获取聊天记录
- `POST /api/message/read/{messageId}` - 标记消息已读
- `GET /api/message/unread-count` - 获取未读消息数

### WebSocket连接
- `ws://localhost:8080/ws/chat?token={jwt_token}` - WebSocket聊天连接

## 数据库表说明

### user - 用户表
存储用户基本信息、微信openid、信用分等

### category - 分类表
物品分类信息

### item - 物品表
物品详细信息，包括标题、描述、图片、位置等

### exchange - 交换表
交换记录，包括交换双方、物品、状态等

### message - 消息表
用户间的聊天消息

### favorite - 收藏表
用户收藏的物品

### review - 评价表
交换后的用户评价

### report - 举报表
用户举报记录

## 注意事项

1. **JWT密钥配置**：请修改 `application.yml` 中的 `jwt.secret` 为自己的密钥
2. **文件上传路径**：默认上传路径为 `./uploads/`，可在 `application.yml` 中修改
3. **微信小程序配置**：需要在微信公众平台获取 appId 和 secret
4. **Redis配置**：如果不使用Redis，需要注释掉相关配置
5. **跨域配置**：已在 `WebMvcConfig` 中配置CORS，可根据需要调整

## 常见问题

### 1. 数据库连接失败
- 检查MySQL是否启动
- 检查数据库连接信息是否正确
- 检查数据库是否已创建

### 2. Redis连接失败
- 检查Redis是否启动
- 检查Redis连接信息是否正确
- 如果不使用Redis，可以注释掉相关配置

### 3. 微信登录失败
- 检查微信小程序配置是否正确
- 检查网络连接是否正常
- 查看日志了解具体错误信息

### 4. 文件上传失败
- 检查上传目录是否存在且有写权限
- 检查文件大小是否超过限制（默认10MB）
- 检查文件类型是否支持

### 5. 小程序无法连接后端
- 检查后端服务是否已启动
- 检查网络是否通畅
- 检查后端地址配置是否正确

## 后续优化建议

### 后端优化
1. **性能优化**
   - 添加Redis缓存
   - 数据库查询优化
   - 添加分页查询索引

2. **功能扩展**
   - 添加物流对接
   - 添加支付功能
   - 添加推荐算法
   - 添加数据统计分析

3. **安全加固**
   - 添加接口限流
   - 添加敏感词过滤
   - 完善权限控制
   - 添加操作日志

### 小程序优化
1. **功能完善**
   - 搜索功能
   - 物品编辑
   - 评价功能
   - 举报功能
   - 地址管理
   - WebSocket 实时消息
   - 分享功能

## 联系方式

如有问题或建议，欢迎反馈。

## 许可证

本项目仅供学习交流使用。
