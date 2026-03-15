-- 邮箱验证功能升级脚本
-- 执行时间：2026-03-15

USE zht;

-- 在用户表中添加邮箱相关字段
ALTER TABLE `tb_user` 
ADD COLUMN `email` VARCHAR(100) COMMENT '邮箱' AFTER `phone`,
ADD COLUMN `email_verified` TINYINT DEFAULT 0 COMMENT '邮箱是否验证：0-未验证，1-已验证' AFTER `email`;

-- 为邮箱字段添加索引
ALTER TABLE `tb_user` ADD INDEX `idx_email` (`email`);
