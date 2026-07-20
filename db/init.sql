CREATE DATABASE IF NOT EXISTS `ecommerce_db`;
USE `ecommerce_db`;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT,
  `avatar_path` VARCHAR(255),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL,
  `metadata_xml` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `items_json` TEXT DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT,
  `user_id` INT,
  `content` TEXT,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data
INSERT INTO `roles` (`id`, `role_name`) VALUES 
(1, 'admin'),
(2, 'user');

INSERT INTO `users` (`id`, `username`, `password`, `role_id`, `avatar_path`) VALUES
(1, 'admin', 'adminSecurePasswordHash123!', 1, '/uploads/avatars/admin.png'),
(2, 'user1', 'user1PasswordHash', 2, '/uploads/avatars/user1.png'),
(3, 'user2', 'user2PasswordHash', 2, NULL);

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `metadata_xml`) VALUES
(1, 'CyberRange Workstation x100', 'High performance workstation for cyber security simulation and testing.', 1500.00, 10, '<metadata><model>X100</model><vendor>SecOps Tech</vendor><cpu>AMD Ryzen 9</cpu></metadata>'),
(2, 'Ethical Hacking Guide Book', 'Step by step guide to practice cyber defense and offensive techniques.', 45.50, 100, '<metadata><format>Paperback</format><edition>3rd</edition></metadata>'),
(3, 'Smart Secure Lock', 'IoT Lock with advanced encryption protocols.', 120.00, 25, NULL);

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `items_json`) VALUES
(1, 2, 1545.50, 'completed', '[{"id":1,"name":"CyberRange Workstation x100","price":1500.00,"quantity":1},{"id":2,"name":"Ethical Hacking Guide Book","price":45.50,"quantity":1}]'),
(2, 3, 120.00, 'pending', '[{"id":3,"name":"Smart Secure Lock","price":120.00,"quantity":1}]');

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `content`) VALUES
(1, 1, 2, 'Amazing speed! Perfect for running nested virtual machines in the cyber lab.'),
(2, 2, 3, 'Very comprehensive and easy to follow. Helped me pass my security certification.');
