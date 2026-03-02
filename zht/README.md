# 闲置物品交换平台 - 后端项目

基于微信小程序的闲置物品交换平台后端服务，使用Spring Boot 3.5.11 + MyBatis-Plus + MySQL开发。

## 项目简介

本项目是一个完整的闲置物品交换平台后端系统，支持用户通过微信小程序进行闲置物品的发布、检索、交换、沟通等功能。

## 技术栈

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

## 项目结构

```
zht/
├── src/main/java/com/mzdx/zht/
│   ├── common/              # 通用类
│   │   ├── Result.java      # 统一返回结果
│   │   └── ResultCode.java  # 状态码枚举
│   ├── config/              # 配置类
│   │   ├── WebMvcConfig.java
│   │   ├── WeChatConfig.java
│   │   ├── Knife4jConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── MyBatisPlusConfig.java
│   ├── controller/          # 控制器层
│   │   ├── UserController.java
│   │   ├── ItemController.java
│   │   ├── CategoryController.java
│   │   ├── ExchangeController.java
│   │   ├── MessageController.java
│   │   ├── FavoriteController.java
│   │   ├── ReviewController.java
│   │   ├── ReportController.java
│   │   └── FileController.java
│   ├── dto/                 # 数据传输对象
│   ├── entity/              # 实体类
│   ├── exception/           # 异常处理
│   ├── handler/             # 处理器
│   ├── interceptor/         # 拦截器
│   ├── mapper/              # Mapper接口
│   ├── service/             # 服务层
│   ├── utils/               # 工具类
│   ├── vo/                  # 视图对象
│   └── websocket/           # WebSocket
├── src/main/resources/
│   ├── sql/                 # SQL脚本
│   │   ├── schema.sql       # 数据库表结构
│   │   └── data.sql         # 初始数据
│   └── application.yml      # 配置文件
└── pom.xml                  # Maven配置
```

## 核心功能模块

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

- JDK 21+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

### 2. 数据库配置

修改 `src/main/resources/application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/zht?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 3. 初始化数据库

执行以下SQL脚本：

```bash
# 创建数据库表
mysql -u root -p < src/main/resources/sql/schema.sql

# 初始化分类数据
mysql -u root -p < src/main/resources/sql/data.sql
```

### 4. 微信小程序配置

修改 `application.yml` 中的微信小程序配置：

```yaml
wechat:
  miniapp:
    appId: your_appid
    secret: your_secret
```

### 5. Redis配置

修改 `application.yml` 中的Redis配置：

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password  # 如果没有密码可以删除此行
```

### 6. 运行项目

```bash
# 使用Maven运行
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/zht-0.0.1-SNAPSHOT.jar
```

### 7. 访问API文档

项目启动后，访问：http://localhost:8080/doc.html

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

## 开发建议

1. 使用Knife4j进行API测试：http://localhost:8080/doc.html
2. 查看日志了解系统运行状态
3. 建议使用Postman或其他API测试工具进行接口测试
4. WebSocket测试可使用在线工具或浏览器控制台

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

## 后续优化建议

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

## 联系方式

如有问题或建议，欢迎反馈。

## 许可证

本项目仅供学习交流使用。
