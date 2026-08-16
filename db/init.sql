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
  `email` VARCHAR(255),
  `displayName` VARCHAR(255),
  `phone` VARCHAR(50),
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
  `brand` VARCHAR(255),
  `category` VARCHAR(255),
  `metadata_xml` TEXT,
  `image_path` TEXT
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


-- =========================================================
-- Seed roles
-- =========================================================

INSERT INTO `roles` (`id`, `role_name`) VALUES 
(1, 'admin'),
(2, 'user');


-- =========================================================
-- Seed users
-- =========================================================

INSERT INTO `users` (`id`, `username`, `password`, `role_id`, `avatar_path`) VALUES
(1, 'admin', 'adminSecurePasswordHash123!', 1, '/uploads/avatars/admin.png'),
(2, 'user1', 'user1PasswordHash', 2, '/uploads/avatars/user1.png'),
(3, 'user2', 'user2PasswordHash', 2, NULL);


-- =========================================================
-- Seed games
-- =========================================================

INSERT INTO `products`
(`id`, `name`, `description`, `price`, `stock`, `brand`, `category`, `metadata_xml`, `image_path`)
VALUES

(1,
 'Black Myth: Wukong',
 'Action RPG based on classical Chinese novel Journey to the West.',
 59.99,
 100,
 'Game Science',
 'Nhập vai',
 '<metadata><publisher>Game Science</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg'),

(2,
 'Cyberpunk 2077',
 'Futuristic open-world action-adventure RPG in Night City.',
 59.99,
 120,
 'CD Projekt Red',
 'Nhập vai',
 '<metadata><publisher>CD Projekt Red</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg'),

(3,
 'GTA V',
 'Open-world action thriller set in Los Santos and Blaine County.',
 29.99,
 80,
 'Rockstar Games',
 'Hành động',
 '<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg'),

(4,
 'Elden Ring',
 'Fantasy action RPG set in the Lands Between, created with George R.R. Martin.',
 59.99,
 200,
 'FromSoftware',
 'Nhập vai',
 '<metadata><publisher>FromSoftware</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg'),

(5,
 'Counter-Strike 2',
 'Tactical first-person shooter featuring source 2 engine updates.',
 14.99,
 150,
 'Valve',
 'Hành động',
 '<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg'),

(6,
 'Portal 2',
 'Mind-bending first-person puzzle adventure featuring cooperative gameplay.',
 9.99,
 140,
 'Valve',
 'Hành động',
 '<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg'),

(7,
 'Civilization VI',
 'Turn-based strategy game where you build an empire to stand the test of time.',
 59.99,
 100,
 '2K Games',
 'Chiến thuật',
 '<metadata><publisher>2K Games</publisher><genre>Chiến thuật</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg'),

(8,
 'Microsoft Flight Simulator',
 'Highly detailed aviation simulation of the entire globe.',
 69.99,
 150,
 'Xbox Game Studios',
 'Mô phỏng',
 '<metadata><publisher>Xbox Game Studios</publisher><genre>Mô phỏng</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg'),

(9,
 'Hades II',
 'Rogue-like dungeon crawler fighting chronos, Titan of Time.',
 29.99,
 200,
 'Supergiant Games',
 'Nhập vai',
 '<metadata><publisher>Supergiant Games</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg'),

(10,
 'Red Dead Redemption 2',
 'Epic Western open-world adventure detailing outlaw Arthur Morgan.',
 59.99,
 250,
 'Rockstar Games',
 'Hành động',
 '<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg'),

(11,
 'Baldur''s Gate 3',
 'Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal.',
 59.99,
 180,
 'Larian Studios',
 'Nhập vai',
 '<metadata><publisher>Larian Studios</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg'),

(12,
 'The Witcher 3: Wild Hunt',
 'Become a professional monster slayer and embark on an adventure of epic proportions.',
 39.99,
 300,
 'CD Projekt Red',
 'Nhập vai',
 '<metadata><publisher>CD Projekt Red</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg'),

(13,
 'Hogwarts Legacy',
 'Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret.',
 59.99,
 140,
 'Warner Bros. Games',
 'Nhập vai',
 '<metadata><publisher>Warner Bros. Games</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg'),

(14,
 'Sekiro: Shadows Die Twice',
 'Carve your own clever path to vengeance in the award-winning adventure from developer FromSoftware.',
 59.99,
 90,
 'FromSoftware',
 'Nhập vai',
 '<metadata><publisher>FromSoftware</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg'),

(15,
 'Monster Hunter: World',
 'Welcome to a new world! Take on the role of a hunter and slay ferocious monsters.',
 29.99,
 110,
 'Capcom',
 'Nhập vai',
 '<metadata><publisher>Capcom</publisher><genre>Nhập vai</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg'),

(16,
 'Resident Evil 4',
 'Survival is just the beginning. Six years have passed since the disaster in Raccoon City.',
 39.99,
 85,
 'Capcom',
 'Hành động',
 '<metadata><publisher>Capcom</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg'),

(17,
 'Forza Horizon 5',
 'Your Ultimate Horizon Adventure awaits! Explore the vibrant open world landscapes of Mexico.',
 59.99,
 75,
 'Xbox Game Studios',
 'Mô phỏng',
 '<metadata><publisher>Xbox Game Studios</publisher><genre>Mô phỏng</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg'),

(18,
 'Hollow Knight',
 'Forge your own path in Hollow Knight! An epic action adventure through a ruined kingdom.',
 14.99,
 350,
 'Team Cherry',
 'Hành động',
 '<metadata><publisher>Team Cherry</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg'),

(19,
 'Age of Empires IV',
 'One of the most beloved real-time strategy games returns to glory with Age of Empires IV.',
 39.99,
 120,
 'Xbox Game Studios',
 'Chiến thuật',
 '<metadata><publisher>Xbox Game Studios</publisher><genre>Chiến thuật</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg'),

(20,
 'Street Fighter 6',
 'Here comes Capcom''s newest challenger! Street Fighter 6 spans three distinct game modes.',
 59.99,
 95,
 'Capcom',
 'Hành động',
 '<metadata><publisher>Capcom</publisher><genre>Hành động</genre></metadata>',
 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/header.jpg');


-- =========================================================
-- Seed orders
-- =========================================================

INSERT INTO `orders`
(`id`, `user_id`, `total_amount`, `status`, `items_json`)
VALUES

(
  1,
  2,
  119.98,
  'completed',
  '[{"id":1,"name":"Black Myth: Wukong","price":59.99,"quantity":1},{"id":4,"name":"Elden Ring","price":59.99,"quantity":1}]'
),

(
  2,
  3,
  89.98,
  'completed',
  '[{"id":2,"name":"Cyberpunk 2077","price":59.99,"quantity":1},{"id":18,"name":"Hollow Knight","price":14.99,"quantity":2}]'
),

(
  3,
  2,
  89.98,
  'pending',
  '[{"id":10,"name":"Red Dead Redemption 2","price":59.99,"quantity":1},{"id":5,"name":"Counter-Strike 2","price":14.99,"quantity":2}]'
),

(
  4,
  3,
  69.98,
  'completed',
  '[{"id":16,"name":"Resident Evil 4","price":39.99,"quantity":1},{"id":6,"name":"Portal 2","price":9.99,"quantity":3}]'
);


-- =========================================================
-- Seed reviews
-- =========================================================

INSERT INTO `reviews`
(`id`, `product_id`, `user_id`, `content`)
VALUES

(
  1,
  1,
  2,
  'Amazing action RPG with beautiful visuals and a great combat system.'
),

(
  2,
  2,
  3,
  'The world design is impressive and Night City feels very immersive.'
),

(
  3,
  4,
  2,
  'Challenging but extremely rewarding. The exploration is fantastic.'
),

(
  4,
  5,
  3,
  'Great competitive FPS. Matches are fast and the gunplay feels responsive.'
),

(
  5,
  10,
  2,
  'One of the best open-world games I have played. The world is incredibly detailed.'
),

(
  6,
  18,
  3,
  'Beautiful art style, challenging combat and a surprisingly deep world.'
),

(
  7,
  16,
  2,
  'The atmosphere and survival horror elements are excellent.'
);