-- 闲置物品交换平台数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS zht DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE zht;

-- 用户表
CREATE TABLE IF NOT EXISTS `tb_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `openid` VARCHAR(100) NOT NULL COMMENT '微信openid',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(255) COMMENT '头像',
    `phone` VARCHAR(20) COMMENT '手机号',
    `gender` TINYINT COMMENT '性别：0-未知，1-男，2-女',
    `address` VARCHAR(200) COMMENT '地址',
    `credit_score` INT DEFAULT 100 COMMENT '信用分',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_openid` (`openid`),
    KEY `idx_phone` (`phone`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS `tb_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(255) COMMENT '分类图标',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 物品表
CREATE TABLE IF NOT EXISTS `tb_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '物品ID',
    `user_id` BIGINT NOT NULL COMMENT '发布用户ID',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `title` VARCHAR(100) NOT NULL COMMENT '物品标题',
    `description` TEXT COMMENT '物品描述',
    `images` TEXT COMMENT '物品图片（JSON数组）',
    `tags` VARCHAR(200) COMMENT '标签',
    `exchange_type` TINYINT NOT NULL COMMENT '类型：1-交换，2-赠送，3-低价转卖',
    `price` DECIMAL(10,2) COMMENT '价格（低价转卖时使用）',
    `exchange_condition` VARCHAR(200) COMMENT '交换条件',
    `location` VARCHAR(200) COMMENT '位置',
    `longitude` DOUBLE COMMENT '经度',
    `latitude` DOUBLE COMMENT '纬度',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架，2-已交换',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `favorite_count` INT DEFAULT 0 COMMENT '收藏次数',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物品表';

-- 交换表
CREATE TABLE IF NOT EXISTS `tb_exchange` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '交换ID',
    `request_user_id` BIGINT NOT NULL COMMENT '发起用户ID',
    `offer_user_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `request_item_id` BIGINT NOT NULL COMMENT '请求物品ID',
    `offer_item_id` BIGINT NOT NULL COMMENT '提供物品ID',
    `message` TEXT COMMENT '留言',
    `status` TINYINT DEFAULT 0 COMMENT '状态：0-待确认，1-已确认，2-已完成，3-已拒绝，4-已取消',
    `reject_reason` VARCHAR(200) COMMENT '拒绝原因',
    `completed_time` DATETIME COMMENT '完成时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_request_user_id` (`request_user_id`),
    KEY `idx_offer_user_id` (`offer_user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交换表';

-- 消息表
CREATE TABLE IF NOT EXISTS `tb_message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
    `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
    `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
    `item_id` BIGINT COMMENT '关联物品ID',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `type` TINYINT DEFAULT 1 COMMENT '类型：1-文本，2-图片',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_receiver_id` (`receiver_id`),
    KEY `idx_item_id` (`item_id`),
    KEY `idx_deleted` (`deleted`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `tb_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `item_id` BIGINT NOT NULL COMMENT '物品ID',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
    KEY `idx_item_id` (`item_id`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 评价表
CREATE TABLE IF NOT EXISTS `tb_review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
    `exchange_id` BIGINT NOT NULL COMMENT '交换ID',
    `reviewer_id` BIGINT NOT NULL COMMENT '评价者ID',
    `reviewed_id` BIGINT NOT NULL COMMENT '被评价者ID',
    `rating` TINYINT NOT NULL COMMENT '评分：1-5星',
    `content` TEXT COMMENT '评价内容',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_exchange_id` (`exchange_id`),
    KEY `idx_reviewed_id` (`reviewed_id`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 举报表
CREATE TABLE IF NOT EXISTS `tb_report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '举报ID',
    `reporter_id` BIGINT NOT NULL COMMENT '举报者ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID（物品ID或用户ID）',
    `target_type` TINYINT NOT NULL COMMENT '目标类型：1-物品，2-用户',
    `reason` VARCHAR(200) NOT NULL COMMENT '举报原因',
    `description` TEXT COMMENT '详细描述',
    `status` TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-已处理，2-已驳回',
    `handle_result` TEXT COMMENT '处理结果',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_reporter_id` (`reporter_id`),
    KEY `idx_target_id` (`target_id`),
    KEY `idx_status` (`status`),
    KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';
