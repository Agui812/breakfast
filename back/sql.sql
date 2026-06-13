-- 早餐店预约自取系统数据库
CREATE DATABASE IF NOT EXISTS breakfast_shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE breakfast_shop;

-- ----------------------------
-- 1. 用户表（用于微信小程序登录）
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) NOT NULL COMMENT '微信用户唯一标识',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '用户头像',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`) COMMENT '微信openid唯一索引，避免重复注册'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表（微信小程序登录）';

-- ----------------------------
-- 2. 餐品分类表
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `sort` int NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态 1=启用 0=禁用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐品分类表';

-- 初始化分类数据
INSERT INTO `category` (`name`, `sort`, `status`) VALUES
('包子类', 1, 1),
('粥品类', 2, 1),
('豆浆类', 3, 1),
('点心类', 4, 1),
('蛋类', 5, 1);

-- ----------------------------
-- 3. 餐品表（核心：每日限量、库存）
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '餐品ID',
  `category_id` int DEFAULT NULL COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '餐品名称',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `daily_stock` int NOT NULL DEFAULT 0 COMMENT '每日限量总数',
  `current_stock` int NOT NULL DEFAULT 0 COMMENT '当前剩余库存',
  `image` varchar(255) DEFAULT NULL COMMENT '图片地址',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态 1=在售 0=售罄/下架',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐品表';

-- 初始化示例数据
INSERT INTO `product` (`category_id`, `name`, `price`, `daily_stock`, `current_stock`, `status`) VALUES
(1, '肉包', 2.5, 300, 300, 1),
(1, '菜包', 2.0, 200, 200, 1),
(3, '豆浆', 3.0, 500, 500, 1),
(5, '茶叶蛋', 1.5, 150, 150, 1);

-- ----------------------------
-- 4. 订单主表（预约、自取时间、取餐码）
-- ----------------------------
DROP TABLE IF EXISTS `order_info`;
CREATE TABLE `order_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `pickup_code` varchar(10) NOT NULL COMMENT '取餐码（4-6位数字）',
  `nickname` varchar(50) DEFAULT NULL COMMENT '顾客昵称',
  `phone` varchar(11) DEFAULT NULL COMMENT '顾客电话（可选）',
  `user_id` INT NULL COMMENT '关联用户ID',
  `pickup_time` datetime NOT NULL COMMENT '顾客选择的自取时间',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `order_status` tinyint NOT NULL DEFAULT 1 COMMENT '订单状态 1=待制作 2=已完成 3=已取餐',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `pickup_code` (`pickup_code`),
  KEY `pickup_time` (`pickup_time`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- ----------------------------
-- 5. 订单明细表（记录买了什么、多少个）
-- ----------------------------
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `product_id` int NOT NULL COMMENT '餐品ID',
  `product_name` varchar(50) NOT NULL COMMENT '餐品名称（快照）',
  `price` decimal(10,2) NOT NULL COMMENT '下单时单价',
  `quantity` int NOT NULL COMMENT '购买数量',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------
-- 6. 系统配置表（营业时间段）
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `business_start` time NOT NULL DEFAULT '06:00:00' COMMENT '营业开始时间',
  `business_end` time NOT NULL DEFAULT '10:00:00' COMMENT '营业结束时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化营业时间
INSERT INTO `system_config` (`business_start`, `business_end`) VALUES ('06:00:00', '10:00:00');

-- ----------------------------
-- 7. 打印日志表（订单打印记录）
-- ----------------------------
DROP TABLE IF EXISTS `print_log`;
CREATE TABLE `print_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '打印ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `print_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '打印时间',
  PRIMARY KEY (`id`),
  KEY `order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单打印日志表';

-- ----------------------------
-- 8. 用户反馈表（用于小程序用户提交反馈/建议）
-- ----------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `user_id` INT NULL COMMENT '关联用户ID',
  `content` TEXT NOT NULL COMMENT '反馈内容',
  `contact` VARCHAR(50) DEFAULT NULL COMMENT '联系方式（手机号/微信）',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理状态：0=待处理 1=已处理',
  `reply` TEXT DEFAULT NULL COMMENT '商家回复内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户反馈表';
