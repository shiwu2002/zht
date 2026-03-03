# ZHT 平台后端 API 文档

本文档基于代码中的控制器与数据模型自动生成，统一返回使用 Result 包装。接口遵循 REST 风格，路径前缀以各控制器 `@RequestMapping` 为准。

- 基础返回结构 Result
  - code: 整型，业务状态码。成功固定为 200
  - message: 字符串，提示信息
  - data: 任意类型，业务数据
  - timestamp: 长整型，服务端时间戳(毫秒)

通用成功响应示例：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1710000000000
}
```

认证与鉴权说明：
- 标注“需要登录”的接口依赖后端从请求上下文中解析的用户ID：`@RequestAttribute("userId")`。
- 未标注“需要登录”的接口可匿名访问。
- 如需实际鉴权、签名、角色权限，请参照网关/拦截器配置（此文档仅依据控制器代码推断）。

HTTP 错误语义：
- 成功：`code=200`
- 失败：`code!=200`（如 400/401/403/404/500 等会通过统一异常处理转换为 Result.error(...)）

数据模型速览：
- DTO(请求体): LoginDTO, ItemDTO, ReviewDTO, ExchangeDTO, MessageDTO
- VO(响应体): UserVO, ItemVO, ExchangeVO
- 实体(部分接口直接返回): Category, Review, Message, Report, ExchangeVO/ItemVO 等

注意：
- 列表分页统一使用 MyBatis-Plus Page 对象封装，响应 `data` 中包含分页结构（records, current, size, total 等）。


## 1. 用户管理(User)

基础路径: `/api/user`

### 1.1 微信小程序登录
- 方法: POST
- 路径: `/api/user/login`
- 需要登录: 否
- 请求体 LoginDTO
  - code(string, 必填)
  - phone(string)
  - nickname(string)
  - avatar(string)
- 成功响应:
  - data(string): 认证令牌(Token)
- 示例请求:
```http
POST /api/user/login
Content-Type: application/json

{
  "code": "wx-miniapp-code",
  "phone": "13800000000",
  "nickname": "张三",
  "avatar": "https://example.com/avatar.png"
}
```
- 示例响应:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": "Bearer eyJhbGciOi...",
  "timestamp": 1710000000000
}
```

### 1.2 获取用户信息
- 方法: GET
- 路径: `/api/user/info`
- 需要登录: 是
- 成功响应:
  - data(UserVO)
    - id, nickname, avatar, phone, gender, address, creditScore, createTime

### 1.3 更新用户信息
- 方法: PUT
- 路径: `/api/user/update`
- 需要登录: 是
- 请求体 User(实体，后端会强制使用当前登录用户 id)
- 成功响应:
  - data(boolean)

### 1.4 绑定手机号
- 方法: POST
- 路径: `/api/user/bind-phone`
- 需要登录: 是
- 查询参数:
  - phone(string, 必填)
- 成功响应:
  - data(boolean)

### 1.5 获取用户信用分
- 方法: GET
- 路径: `/api/user/credit-score`
- 需要登录: 是
- 成功响应:
  - data(integer)


## 2. 文件管理(File)

基础路径: `/api/file`

### 2.1 上传图片
- 方法: POST
- 路径: `/api/file/upload`
- 需要登录: 未强制(视后端拦截器而定)
- 表单参数:
  - file(form-data, 必填, 文件)
- 成功响应:
  - data(string): 文件访问 URL

### 2.2 删除图片
- 方法: DELETE
- 路径: `/api/file/delete`
- 查询参数:
  - fileName(string, 必填)
- 成功响应:
  - data(boolean)=true


## 3. 物品管理(Item)

基础路径: `/api/item`

### 3.1 发布物品
- 方法: POST
- 路径: `/api/item/publish`
- 需要登录: 是
- 请求体 ItemDTO
  - id(long, 可选)
  - title(string, 必填)
  - description(string, 必填)
  - images(string[], 必填)
  - categoryId(long, 必填)
  - tags(string)
  - exchangeType(int, 必填)  // 交换类型，具体字典由前端/后端约定
  - price(decimal)
  - exchangeCondition(string)
  - location(string, 必填)
  - longitude(double)
  - latitude(double)
- 成功响应:
  - data(boolean)

### 3.2 更新物品
- 方法: PUT
- 路径: `/api/item/update`
- 需要登录: 是
- 请求体: ItemDTO（同发布）
- 成功响应:
  - data(boolean)

### 3.3 删除物品
- 方法: DELETE
- 路径: `/api/item/{itemId}`
- 需要登录: 是
- 路径参数:
  - itemId(long, 必填)
- 成功响应:
  - data(boolean)

### 3.4 获取物品详情
- 方法: GET
- 路径: `/api/item/{itemId}`
- 路径参数:
  - itemId(long, 必填)
- 成功响应:
  - data(ItemVO)

### 3.5 分页查询物品列表
- 方法: GET
- 路径: `/api/item/list`
- 查询参数:
  - current(int, 默认=1)
  - size(int, 默认=10)
  - categoryId(long, 可选)
  - keyword(string, 可选)
  - type(int, 可选)
  - sortBy(string, 默认="time")
- 成功响应:
  - data(Page<ItemVO>)

### 3.6 获取我的发布
- 方法: GET
- 路径: `/api/item/my`
- 需要登录: 是
- 查询参数:
  - current(int, 默认=1)
  - size(int, 默认=10)
- 成功响应:
  - data(Page<ItemVO>)

### 3.7 获取附近的物品
- 方法: GET
- 路径: `/api/item/nearby`
- 查询参数:
  - longitude(double, 必填)
  - latitude(double, 必填)
  - distance(int, 默认=5000) // 单位米
- 成功响应:
  - data(ItemVO[])


## 4. 评价管理(Review)

基础路径: `/api/review`

### 4.1 添加评价
- 方法: POST
- 路径: `/api/review/add`
- 需要登录: 是
- 请求体 ReviewDTO
  - exchangeId(long, 必填)
  - reviewedId(long, 必填)
  - rating(int, [1,5], 必填)
  - content(string, 可选)
- 成功响应:
  - data(boolean)

### 4.2 获取用户评价列表
- 方法: GET
- 路径: `/api/review/user/{userId}`
- 路径参数:
  - userId(long, 必填)
- 查询参数:
  - current(int, 默认=1)
  - size(int, 默认=10)
- 成功响应:
  - data(Page<Review>)

### 4.3 获取交换评价
- 方法: GET
- 路径: `/api/review/exchange/{exchangeId}`
- 需要登录: 是
- 路径参数:
  - exchangeId(long, 必填)
- 成功响应:
  - data(Review)


## 5. 交换管理(Exchange)

基础路径: `/api/exchange`

### 5.1 发起交换申请
- 方法: POST
- 路径: `/api/exchange/create`
- 需要登录: 是
- 请求体 ExchangeDTO
  - requestItemId(long, 必填)
  - offerItemId(long, 必填)
  - message(string, 可选)
- 成功响应:
  - data(boolean)

### 5.2 确认交换
- 方法: POST
- 路径: `/api/exchange/confirm/{exchangeId}`
- 需要登录: 是
- 路径参数:
  - exchangeId(long, 必填)
- 成功响应:
  - data(boolean)

### 5.3 拒绝交换
- 方法: POST
- 路径: `/api/exchange/reject/{exchangeId}`
- 需要登录: 是
- 路径参数:
  - exchangeId(long, 必填)
- 查询参数:
  - reason(string, 必填)
- 成功响应:
  - data(boolean)

### 5.4 取消交换
- 方法: POST
- 路径: `/api/exchange/cancel/{exchangeId}`
- 需要登录: 是
- 路径参数:
  - exchangeId(long, 必填)
- 成功响应:
  - data(boolean)

### 5.5 完成交换
- 方法: POST
- 路径: `/api/exchange/complete/{exchangeId}`
- 需要登录: 是
- 路径参数:
  - exchangeId(long, 必填)
- 成功响应:
  - data(boolean)

### 5.6 获取交换详情
- 方法: GET
- 路径: `/api/exchange/{exchangeId}`
- 路径参数:
  - exchangeId(long, 必填)
- 成功响应:
  - data(ExchangeVO)

### 5.7 获取我的交换记录
- 方法: GET
- 路径: `/api/exchange/my`
- 需要登录: 是
- 查询参数:
  - current(int, 默认=1)
  - size(int, 默认=10)
  - type(int, 可选)
- 成功响应:
  - data(Page<ExchangeVO>)


## 6. 分类管理(Category)

基础路径: `/api/category`

### 6.1 获取所有分类
- 方法: GET
- 路径: `/api/category/list`
- 成功响应:
  - data(Category[])

### 6.2 获取热门分类
- 方法: GET
- 路径: `/api/category/hot`
- 成功响应:
  - data(Category[])


## 7. 收藏管理(Favorite)

基础路径: `/api/favorite`

### 7.1 添加收藏
- 方法: POST
- 路径: `/api/favorite/add/{itemId}`
- 需要登录: 是
- 路径参数:
  - itemId(long, 必填)
- 成功响应:
  - data(boolean)

### 7.2 取消收藏
- 方法: DELETE
- 路径: `/api/favorite/remove/{itemId}`
- 需要登录: 是
- 路径参数:
  - itemId(long, 必填)
- 成功响应:
  - data(boolean)

### 7.3 检查是否已收藏
- 方法: GET
- 路径: `/api/favorite/check/{itemId}`
- 需要登录: 是
- 路径参数:
  - itemId(long, 必填)
- 成功响应:
  - data(boolean)

### 7.4 获取我的收藏
- 方法: GET
- 路径: `/api/favorite/my`
- 需要登录: 是
- 查询参数:
  - current(int, 默认=1)
  - size(int, 默认=10)
- 成功响应:
  - data(Page<ItemVO>)


## 8. 消息管理(Message)

基础路径: `/api/message`

### 8.1 发送消息
- 方法: POST
- 路径: `/api/message/send`
- 需要登录: 是
- 请求体 MessageDTO
  - receiverId(long, 必填)
  - itemId(long, 可选)
  - content(string, 必填)
  - type(int, 可选)
- 成功响应:
  - data(boolean)

### 8.2 获取会话列表
- 方法: GET
- 路径: `/api/message/conversations`
- 需要登录: 是
