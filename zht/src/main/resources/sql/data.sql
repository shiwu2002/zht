-- Active: 1755070407905@@127.0.0.1@3306@zht
-- 初始化分类数据

USE zht;

INSERT INTO `tb_category` (`name`, `icon`, `sort`) VALUES
('图书', 'book', 1),
('数码', 'digital', 2),
('服装', 'clothes', 3),
('家居', 'home', 4),
('运动', 'sports', 5),
('美妆', 'beauty', 6),
('玩具', 'toy', 7),
('文具', 'stationery', 8),
('食品', 'food', 9),
('其他', 'other', 10);


INSERT INTO `tb_user` (`openid`, `nickname`, `avatar`, `phone`, `gender`, `address`, `credit_score`, `status`) VALUES
('oIHWf7gRcXtNgvaU20hfsfy922rI_2', '李四', 'https://example.com/avatar2.jpg', '13800138002', 1, '上海市浦东新区', 95, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_3', '王五', 'https://example.com/avatar3.jpg', '13800138003', 1, '广州市天河区', 90, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_4', '赵六', 'https://example.com/avatar4.jpg', '13800138004', 1, '深圳市南山区', 85, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_5', '钱七', 'https://example.com/avatar5.jpg', '13800138005', 1, '杭州市西湖区', 80, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_6', '孙八', 'https://example.com/avatar6.jpg', '13800138006', 2, '成都市武侯区', 75, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_7', '周九', 'https://example.com/avatar7.jpg', '13800138007', 2, '南京市鼓楼区', 70, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_8', '吴十', 'https://example.com/avatar8.jpg', '13800138008', 2, '武汉市江汉区', 65, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_9', '郑十一', 'https://example.com/avatar9.jpg', '13800138009', 1, '西安市雁塔区', 60, 1),
('oIHWf7gRcXtNgvaU20hfsfy922rI_10', '刘十二', 'https://example.com/avatar10.jpg', '13800138010', 2, '重庆市渝中区', 55, 1);



-- 物品表测试数据（10 条）
INSERT INTO `tb_item` (`user_id`, `category_id`, `title`, `description`, `images`, `tags`, `exchange_type`, `price`, `exchange_condition`, `location`, `longitude`, `latitude`, `status`, `view_count`, `favorite_count`) VALUES
(1, 1, 'Java 编程思想第 4 版', '9 成新，有少量笔记，适合 Java 初学者', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070]', '书籍，编程，Java', 2, NULL, '希望交换其他技术类书籍', '北京市朝阳区', 116.4074, 39.9042, 1, 156, 23),
(2, 2, 'iPhone 13 手机壳', '透明硅胶材质，使用过几次，无划痕', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070]', '数码配件，iPhone', 2, NULL, '赠送给需要的人', '上海市浦东新区', 121.5074, 31.2042, 1, 234, 45),
(3, 3, '优衣库羽绒服', '男士 L 码，黑色，95 新，过冬闲置', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070,https://avatars.githubusercontent.com/u/59555777]', '服装，男装，冬季', 1, NULL, '希望交换同等价值的衣物', '广州市天河区', 113.3274, 23.1242, 1, 189, 32),
(4, 4, '小米台灯', '智能 LED 台灯，可以调节亮度和色温', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070,https://avatars.githubusercontent.com/u/59555777]', '家居，照明，智能', 3, 50.00, '低价转卖，不包邮', '深圳市南山区', 113.9274, 22.5242, 1, 312, 67),
(5, 5, '瑜伽垫', '加厚 10mm，紫色，送收纳袋，仅使用过一次', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070]', '运动，健身，瑜伽', 2, NULL, '免费赠送，自提', '杭州市西湖区', 120.1274, 30.2242, 1, 278, 54),
(6, 6, 'MAC 口红', '色号#chili，专柜正品，只用过两次', '[https://avatars.githubusercontent.com/u/71991543]', '美妆，口红，MAC', 1, NULL, '希望交换其他品牌口红', '成都市武侯区', 104.0274, 30.6242, 1, 445, 89),
(7, 7, '乐高积木', '城市系列警察局，未拆封，适合 6 岁以上儿童', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070]', '玩具，乐高，益智', 3, 180.00, '低价转卖，可小刀', '南京市鼓楼区', 118.7274, 32.0242, 1, 523, 102),
(8, 8, '手账本套装', '包含手账本 + 贴纸 + 胶带，全新未使用', '[https://avatars.githubusercontent.com/u/71991543]', '文具，手账，套装', 2, NULL, '赠送给喜欢手账的朋友', '武汉市江汉区', 114.2274, 30.5242, 1, 167, 28),
(9, 9, '进口巧克力礼盒', '比利时原装进口，还有 3 个月过期，介意勿拍', '[https://avatars.githubusercontent.com/u/71991543,https://avatars.githubusercontent.com/u/37418070]', '食品，巧克力，进口', 3, 30.00, '临期特价，不议价', '西安市雁塔区', 108.9274, 34.2242, 1, 389, 76),
(10, 10, '收纳箱', '大号 50L，透明材质，搬家带不走', '[https://avatars.githubusercontent.com/u/71991543]', '其他，收纳，家居用品', 2, NULL, '免费赠送，需要自提', '重庆市渝中区', 106.5274, 29.5242, 1, 201, 41);

-- 交换表测试数据（10 条）
INSERT INTO `tb_exchange` (`request_user_id`, `offer_user_id`, `request_item_id`, `offer_item_id`, `message`, `status`, `reject_reason`, `completed_time`) VALUES
(1, 2, 1, 2, '你好，我对你的手机壳很感兴趣，可以用我的书交换吗？', 1, NULL, '2026-02-15 14:30:00'),
(2, 3, 2, 3, '请问羽绒服还在吗？想用我的手机壳交换', 0, NULL, NULL),
(3, 4, 3, 4, '羽绒服换台灯，可以吗？', 2, NULL, '2026-02-20 10:15:00'),
(4, 5, 4, 5, '台灯换瑜伽垫，双方都合适', 3, '成色不太好，抱歉', NULL),
(5, 6, 5, 6, '瑜伽垫换口红，考虑一下？', 1, NULL, '2026-02-25 16:45:00'),
(6, 7, 6, 7, '口红换乐高，可以商量', 2, NULL, '2026-02-28 09:20:00'),
(7, 8, 7, 8, '乐高换手账本，有兴趣吗？', 4, NULL, NULL),
(8, 9, 8, 9, '手账本换巧克力，可以吗？', 0, NULL, NULL),
(9, 10, 9, 10, '巧克力换收纳箱，急需', 1, NULL, '2026-03-01 11:00:00'),
(10, 1, 10, 1, '收纳箱换 Java 书，学习用', 3, '已经交换出去了', NULL);

-- 消息表测试数据（10 条）
INSERT INTO `tb_message` (`sender_id`, `receiver_id`, `item_id`, `content`, `type`, `is_read`) VALUES
(1, 2, 2, '你好，这个手机壳是什么型号的？', 1, 1),
(2, 1, 2, '是 iPhone 13 的，6.1 寸', 1, 1),
(1, 2, 2, '那可以用我的书交换吗？', 1, 1),
(2, 1, 2, '可以的，怎么交易？', 1, 1),
(3, 4, 3, '羽绒服什么尺码？', 1, 1),
(4, 3, 3, 'L 码，175cm 可以穿', 1, 1),
(5, 6, 5, '瑜伽垫还在吗？', 1, 0),
(6, 5, 5, '在的，什么时候要？', 1, 0),
(7, 8, 7, '乐高可以便宜点吗？', 1, 0),
(8, 7, 7, '最低 150，不能再少了', 1, 0);

-- 收藏表测试数据（10 条）
INSERT INTO `tb_favorite` (`user_id`, `item_id`) VALUES
(1, 3),
(1, 5),
(2, 1),
(2, 7),
(3, 2),
(3, 4),
(4, 6),
(5, 8),
(6, 9),
(7, 10);

-- 评价表测试数据（10 条）
INSERT INTO `tb_review` (`exchange_id`, `reviewer_id`, `reviewed_id`, `rating`, `content`) VALUES
(1, 1, 2, 5, '很好的卖家，沟通顺畅，物品描述准确！'),
(3, 3, 4, 4, '交易顺利，物品不错，就是有点小瑕疵'),
(5, 5, 6, 5, '非常满意的一次交换，推荐！'),
(6, 6, 7, 5, '卖家很热情，还送了小礼物'),
(9, 9, 10, 4, '东西还可以，物流有点慢'),
(1, 2, 1, 5, '买家很爽快，合作愉快！'),
(3, 4, 3, 4, '不错的交换对象，守时守信'),
(5, 6, 5, 5, '很好的买家，值得信任'),
(6, 7, 6, 5, '交易很顺利，谢谢配合'),
(9, 10, 9, 3, '一般般吧，物品和描述有些差距');

-- 举报表测试数据（10 条）
INSERT INTO `tb_report` (`reporter_id`, `target_id`, `target_type`, `reason`, `description`, `status`, `handle_result`) VALUES
(1, 4, 1, '虚假信息', '物品描述与实际不符，怀疑是商家', 1, '已核实，确认为虚假信息，已下架物品'),
(2, 7, 1, '违禁品', '疑似出售违禁物品', 2, '经核实不属于违禁品，举报驳回'),
(3, 5, 2, '恶意行为', '用户在聊天中使用侮辱性语言', 1, '已警告用户，扣除信用分 10 分'),
(4, 9, 1, '价格欺诈', '标价与实际要求不符', 0, NULL),
(5, 8, 2, '骚扰行为', '频繁发送无关消息', 1, '已对用户进行警告处理'),
(6, 10, 1, '重复发布', '同一物品重复发布多次', 1, '已删除重复物品，保留一个'),
(7, 6, 2, '诈骗行为', '收款后不发货', 0, NULL),
(8, 3, 1, '假冒伪劣', '出售假冒品牌商品', 2, '证据不足，无法认定'),
(9, 2, 2, '恶意差评', '给多个用户恶意差评', 1, '已删除相关评价，扣除信用分 20 分'),
(10, 1, 1, '其他问题', '物品图片涉及不当内容', 1, '已要求用户更换图片');