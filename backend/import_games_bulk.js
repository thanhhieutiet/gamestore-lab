/**
 * =============================================================================
 * BULK GAME IMPORT SCRIPT (Standalone)
 * =============================================================================
 * 
 * File: import_games_bulk.js
 * Purpose: Import a large catalog of games into the ecommerce database.
 *          - Skips games that already exist in DB (checked by name).
 *          - Completely independent from import_games.js to avoid overwriting.
 * 
 * Usage:
 *   Inside Docker:   node import_games_bulk.js
 *   Outside Docker:  DB_HOST=localhost node import_games_bulk.js
 * 
 * =============================================================================
 */

const mysql = require('mysql2');

// ---------------------------------------------------------------------------
// Database connection (mirrors original import_games.js pattern)
// ---------------------------------------------------------------------------
const dbHost = process.env.DB_HOST || 'db';

const connection = mysql.createConnection({
  host: dbHost,
  user: 'dbuser',
  password: 'dbpassword',
  database: 'ecommerce_db'
});

// ---------------------------------------------------------------------------
// Full game catalog – organized by category for easier maintenance
// ---------------------------------------------------------------------------

// ===== NHẬP VAI (RPG) =====
const rpgGames = [
  {
    name: 'Dark Souls III',
    description: 'Dark Souls III là phiên bản mới nhất trong loạt game hành động nhập vai nổi tiếng với độ khó cao. Khám phá thế giới rộng lớn, đầy bí ẩn và nguy hiểm.',
    price: 39.99,
    stock: 130,
    brand: 'FromSoftware',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg'
  },
  {
    name: 'Diablo IV',
    description: 'Trở lại thế giới tối tăm Sanctuary trong cuộc chiến chống lại Lilith. Hack-and-slash RPG kinh điển với đồ họa đỉnh cao.',
    price: 69.99,
    stock: 200,
    brand: 'Blizzard Entertainment',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2344520/header.jpg'
  },
  {
    name: 'Final Fantasy XVI',
    description: 'Phiên bản mới nhất của dòng game Final Fantasy huyền thoại, mang đến câu chuyện sử thi trong thế giới Valisthea.',
    price: 49.99,
    stock: 110,
    brand: 'Square Enix',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1642350/header.jpg'
  },
  {
    name: 'Final Fantasy VII Rebirth',
    description: 'Phần tiếp theo của Final Fantasy VII Remake, hành trình tiếp tục cùng Cloud và các đồng đội rời khỏi Midgar.',
    price: 69.99,
    stock: 90,
    brand: 'Square Enix',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2909400/header.jpg'
  },
  {
    name: 'Dragon Age: The Veilguard',
    description: 'Phần mới nhất trong series Dragon Age, xây dựng đội hình và chiến đấu chống lại mối đe dọa cổ đại.',
    price: 59.99,
    stock: 100,
    brand: 'Electronic Arts',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1845910/header.jpg'
  },
  {
    name: 'Divinity: Original Sin 2',
    description: 'RPG chiến thuật theo lượt đỉnh cao với hệ thống chiến đấu sáng tạo và câu chuyện đa nhánh.',
    price: 44.99,
    stock: 180,
    brand: 'Larian Studios',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/435150/header.jpg'
  },
  {
    name: 'Persona 5 Royal',
    description: 'JRPG huyền thoại - vào vai học sinh ban ngày, Phantom Thief ban đêm tại Tokyo.',
    price: 59.99,
    stock: 120,
    brand: 'ATLUS',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg'
  },
  {
    name: 'NieR: Automata',
    description: 'Trải nghiệm cuộc chiến giữa máy móc và android trong thế giới hậu tận thế đầy triết lý.',
    price: 39.99,
    stock: 160,
    brand: 'Square Enix',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/524220/header.jpg'
  },
  {
    name: 'Dragon\'s Dogma 2',
    description: 'RPG thế giới mở với hệ thống chiến đấu hành động phong phú và AI đồng hành thông minh.',
    price: 69.99,
    stock: 80,
    brand: 'Capcom',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/header.jpg'
  },
  {
    name: 'Starfield',
    description: 'RPG không gian quy mô lớn từ Bethesda. Khám phá hơn 1.000 hành tinh trong thiên hà rộng lớn.',
    price: 69.99,
    stock: 150,
    brand: 'Bethesda Game Studios',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg'
  },
  {
    name: 'Skyrim Special Edition',
    description: 'Phiên bản nâng cấp của The Elder Scrolls V: Skyrim huyền thoại với đồ họa cải tiến.',
    price: 39.99,
    stock: 300,
    brand: 'Bethesda Game Studios',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg'
  },
  {
    name: 'Path of Exile 2',
    description: 'Action RPG free-to-play với hệ thống skill tree khổng lồ và gameplay loot đa dạng.',
    price: 29.99,
    stock: 500,
    brand: 'Grinding Gear Games',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2694490/header.jpg'
  },
  {
    name: 'Monster Hunter Wilds',
    description: 'Phiên bản mới nhất của Monster Hunter, săn quái vật khổng lồ trong thế giới hoang dã rộng lớn.',
    price: 59.99,
    stock: 170,
    brand: 'Capcom',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg'
  },
  {
    name: 'Lies of P',
    description: 'Soulslike RPG lấy cảm hứng từ câu chuyện Pinocchio, đặt trong thành phố Belle Époque đen tối.',
    price: 39.99,
    stock: 140,
    brand: 'Neowiz',
    category: 'Nhập vai',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1627720/header.jpg'
  }
];

// ===== HÀNH ĐỘNG (Action) =====
const actionGames = [
  {
    name: 'God of War Ragnarök',
    description: 'Kratos và Atreus đối mặt với Ragnarök trong cuộc phiêu lưu hoành tráng qua Chín Cõi.',
    price: 59.99,
    stock: 180,
    brand: 'Santa Monica Studio',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg'
  },
  {
    name: 'Devil May Cry 5',
    description: 'Game hành động hack-and-slash đỉnh cao với combo chiến đấu cực mượt và phong cách.',
    price: 29.99,
    stock: 200,
    brand: 'Capcom',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/header.jpg'
  },
  {
    name: 'Doom Eternal',
    description: 'FPS hành động tốc độ cao, tiêu diệt quỷ dữ với kho vũ khí khủng và gameplay điên cuồng.',
    price: 39.99,
    stock: 150,
    brand: 'id Software',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg'
  },
  {
    name: 'Marvel\'s Spider-Man Remastered',
    description: 'Đu dây qua New York, chiến đấu với tội phạm trong vai Spider-Man huyền thoại.',
    price: 59.99,
    stock: 120,
    brand: 'Insomniac Games',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg'
  },
  {
    name: 'Horizon Forbidden West',
    description: 'Aloy tiếp tục hành trình khám phá vùng đất cấm phía Tây, chiến đấu với máy móc khổng lồ.',
    price: 59.99,
    stock: 100,
    brand: 'Guerrilla Games',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/header.jpg'
  },
  {
    name: 'Metal Gear Solid V: The Phantom Pain',
    description: 'Game hành động lén lút thế giới mở từ huyền thoại Hideo Kojima.',
    price: 19.99,
    stock: 250,
    brand: 'Konami',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/287700/header.jpg'
  },
  {
    name: 'Ghostrunner 2',
    description: 'Game hành động nhịp độ nhanh kết hợp parkour và kiếm katana trong thế giới cyberpunk.',
    price: 39.99,
    stock: 90,
    brand: '505 Games',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2144740/header.jpg'
  },
  {
    name: 'Hi-Fi Rush',
    description: 'Game hành động nhịp điệu độc đáo - chiến đấu theo nhạc với phong cách hoạt hình sống động.',
    price: 29.99,
    stock: 180,
    brand: 'Tango Gameworks',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817230/header.jpg'
  },
  {
    name: 'Dead Space Remake',
    description: 'Bản remake kinh điển - sống sót trên tàu USG Ishimura đầy Necromorph.',
    price: 59.99,
    stock: 75,
    brand: 'Electronic Arts',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1693980/header.jpg'
  },
  {
    name: 'Armored Core VI: Fires of Rubicon',
    description: 'Mech action từ FromSoftware. Tùy chỉnh và điều khiển robot chiến đấu khổng lồ.',
    price: 59.99,
    stock: 110,
    brand: 'FromSoftware',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888160/header.jpg'
  },
  {
    name: 'Titanfall 2',
    description: 'FPS hành động kết hợp chiến đấu bộ binh và điều khiển Titan khổng lồ.',
    price: 29.99,
    stock: 200,
    brand: 'Respawn Entertainment',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1237970/header.jpg'
  },
  {
    name: 'Halo Infinite',
    description: 'Master Chief trở lại trong cuộc chiến bảo vệ nhân loại trên hành tinh Zeta Halo.',
    price: 59.99,
    stock: 130,
    brand: '343 Industries',
    category: 'Hành động',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1240440/header.jpg'
  }
];

// ===== CHIẾN THUẬT (Strategy) =====
const strategyGames = [
  {
    name: 'Total War: Warhammer III',
    description: 'Chiến thuật thời gian thực quy mô lớn trong thế giới fantasy Warhammer.',
    price: 59.99,
    stock: 100,
    brand: 'Creative Assembly',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1142710/header.jpg'
  },
  {
    name: 'Crusader Kings III',
    description: 'Grand strategy RPG - xây dựng triều đại, quản lý chính trị, chiến tranh thời Trung Cổ.',
    price: 49.99,
    stock: 120,
    brand: 'Paradox Interactive',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1158310/header.jpg'
  },
  {
    name: 'XCOM 2',
    description: 'Chiến thuật theo lượt - lãnh đạo lực lượng kháng chiến chống lại quân xâm lược ngoài hành tinh.',
    price: 19.99,
    stock: 200,
    brand: '2K Games',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268500/header.jpg'
  },
  {
    name: 'Frostpunk 2',
    description: 'Xây dựng và quản lý thành phố trong kỷ băng hà. Mỗi quyết định đều có cái giá.',
    price: 44.99,
    stock: 130,
    brand: '11 bit studios',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1619510/header.jpg'
  },
  {
    name: 'Stellaris',
    description: 'Grand strategy trong không gian - xây dựng đế chế liên sao, khám phá thiên hà rộng lớn.',
    price: 39.99,
    stock: 180,
    brand: 'Paradox Interactive',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/281990/header.jpg'
  },
  {
    name: 'Factorio',
    description: 'Xây dựng và tối ưu hóa nhà máy tự động khổng lồ trên hành tinh xa lạ.',
    price: 35.00,
    stock: 400,
    brand: 'Wube Software',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg'
  },
  {
    name: 'Company of Heroes 3',
    description: 'Chiến thuật thời gian thực WW2 - chỉ huy lực lượng trên chiến trường Địa Trung Hải.',
    price: 59.99,
    stock: 85,
    brand: 'Relic Entertainment',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1677280/header.jpg'
  },
  {
    name: 'Manor Lords',
    description: 'Chiến thuật xây dựng thành phố thời Trung Cổ với hệ thống kinh tế và chiến đấu thực tế.',
    price: 39.99,
    stock: 160,
    brand: 'Slavic Magic',
    category: 'Chiến thuật',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/header.jpg'
  }
];

// ===== MÔ PHỎNG (Simulation) =====
const simulationGames = [
  {
    name: 'Cities: Skylines II',
    description: 'Xây dựng và quản lý thành phố mơ ước với quy mô và chi tiết chưa từng có.',
    price: 49.99,
    stock: 140,
    brand: 'Colossal Order',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/949230/header.jpg'
  },
  {
    name: 'Euro Truck Simulator 2',
    description: 'Lái xe tải vượt qua châu Âu, giao hàng và xây dựng đế chế vận tải.',
    price: 19.99,
    stock: 300,
    brand: 'SCS Software',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/227300/header.jpg'
  },
  {
    name: 'Planet Zoo',
    description: 'Xây dựng vườn thú mơ ước với hàng trăm loài động vật và tùy chỉnh chi tiết.',
    price: 44.99,
    stock: 120,
    brand: 'Frontier Developments',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/703080/header.jpg'
  },
  {
    name: 'Farming Simulator 25',
    description: 'Quản lý nông trại hiện đại với hàng trăm loại máy móc và cây trồng thực tế.',
    price: 49.99,
    stock: 160,
    brand: 'GIANTS Software',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2300320/header.jpg'
  },
  {
    name: 'The Sims 4',
    description: 'Tạo nhân vật, xây nhà và sống cuộc sống ảo với vô vàn khả năng.',
    price: 0.00,
    stock: 999,
    brand: 'Electronic Arts',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg'
  },
  {
    name: 'Kerbal Space Program 2',
    description: 'Thiết kế tên lửa, khám phá không gian với vật lý mô phỏng chân thực.',
    price: 49.99,
    stock: 70,
    brand: 'Intercept Games',
    category: 'Mô phỏng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/954850/header.jpg'
  }
];

// ===== THỂ THAO (Sports) =====
const sportsGames = [
  {
    name: 'EA Sports FC 25',
    description: 'Game bóng đá hàng đầu thế giới với giải đấu và cầu thủ được cấp phép đầy đủ.',
    price: 69.99,
    stock: 200,
    brand: 'Electronic Arts',
    category: 'Thể thao',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2669320/header.jpg'
  },
  {
    name: 'NBA 2K25',
    description: 'Trải nghiệm bóng rổ chân thực nhất với chế độ MyCareer và MyTeam.',
    price: 69.99,
    stock: 130,
    brand: '2K Games',
    category: 'Thể thao',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2688950/header.jpg'
  },
  {
    name: 'Rocket League',
    description: 'Bóng đá kết hợp xe hơi tên lửa - gameplay cạnh tranh cực kỳ gây nghiện.',
    price: 0.00,
    stock: 999,
    brand: 'Psyonix',
    category: 'Thể thao',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252950/header.jpg'
  },
  {
    name: 'F1 24',
    description: 'Trải nghiệm giải đua F1 chính thức với tất cả đội đua, tay đua và đường đua.',
    price: 59.99,
    stock: 100,
    brand: 'Codemasters',
    category: 'Thể thao',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2488620/header.jpg'
  }
];

// ===== KINH DỊ (Horror) =====
const horrorGames = [
  {
    name: 'Alan Wake 2',
    description: 'Game kinh dị tâm lý - nhà văn Alan Wake mắc kẹt trong thế giới kinh hoàng từ tiểu thuyết của chính mình.',
    price: 59.99,
    stock: 90,
    brand: 'Remedy Entertainment',
    category: 'Kinh dị',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2667660/header.jpg'
  },
  {
    name: 'Resident Evil Village',
    description: 'Ethan Winters đối mặt với nỗi kinh hoàng mới tại một ngôi làng bí ẩn ở châu Âu.',
    price: 39.99,
    stock: 140,
    brand: 'Capcom',
    category: 'Kinh dị',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg'
  },
  {
    name: 'Silent Hill 2 Remake',
    description: 'Bản remake của tuyệt phẩm kinh dị tâm lý. James Sunderland trở lại Silent Hill tìm vợ.',
    price: 59.99,
    stock: 80,
    brand: 'Konami',
    category: 'Kinh dị',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2124490/header.jpg'
  },
  {
    name: 'Phasmophobia',
    description: 'Game kinh dị co-op - săn ma với đội bạn bè sử dụng thiết bị chuyên nghiệp.',
    price: 13.99,
    stock: 300,
    brand: 'Kinetic Games',
    category: 'Kinh dị',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg'
  },
  {
    name: 'Outlast II',
    description: 'Game kinh dị sinh tồn góc nhìn thứ nhất - không có vũ khí, chỉ có sự sợ hãi.',
    price: 29.99,
    stock: 160,
    brand: 'Red Barrels',
    category: 'Kinh dị',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/414700/header.jpg'
  }
];

// ===== PHIÊU LƯU (Adventure) =====
const adventureGames = [
  {
    name: 'It Takes Two',
    description: 'Game phiêu lưu co-op đoạt Game of the Year. Hai người chơi cùng giải cứu cuộc hôn nhân.',
    price: 39.99,
    stock: 200,
    brand: 'Hazelight Studios',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg'
  },
  {
    name: 'Uncharted: Legacy of Thieves Collection',
    description: 'Bộ sưu tập 2 game phiêu lưu hành động đỉnh cao từ Naughty Dog.',
    price: 49.99,
    stock: 90,
    brand: 'Naughty Dog',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1659420/header.jpg'
  },
  {
    name: 'The Last of Us Part I',
    description: 'Hành trình sinh tồn đầy cảm xúc của Joel và Ellie trong thế giới hậu tận thế.',
    price: 59.99,
    stock: 110,
    brand: 'Naughty Dog',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg'
  },
  {
    name: 'Stardew Valley',
    description: 'Game nông trại chill, xây dựng cuộc sống mới tại thị trấn nhỏ, kết bạn và yêu đương.',
    price: 14.99,
    stock: 500,
    brand: 'ConcernedApe',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg'
  },
  {
    name: 'Subnautica',
    description: 'Game sinh tồn dưới đại dương ngoài hành tinh - khám phá, chế tạo và xây dựng căn cứ.',
    price: 29.99,
    stock: 220,
    brand: 'Unknown Worlds Entertainment',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg'
  },
  {
    name: 'Death Stranding Director\'s Cut',
    description: 'Kết nối thế giới bị chia cắt trong kiệt tác từ Hideo Kojima.',
    price: 39.99,
    stock: 130,
    brand: 'Kojima Productions',
    category: 'Phiêu lưu',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg'
  }
];

// ===== SINH TỒN (Survival) =====
const survivalGames = [
  {
    name: 'Palworld',
    description: 'Sinh tồn thế giới mở kết hợp bắt và huấn luyện sinh vật - Pokémon với súng!',
    price: 29.99,
    stock: 300,
    brand: 'Pocketpair',
    category: 'Sinh tồn',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg'
  },
  {
    name: 'Valheim',
    description: 'Sinh tồn trong thế giới thần thoại Bắc Âu. Xây dựng, chiến đấu và khám phá.',
    price: 19.99,
    stock: 250,
    brand: 'Iron Gate AB',
    category: 'Sinh tồn',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg'
  },
  {
    name: 'Rust',
    description: 'Game sinh tồn multiplayer hardcore - xây dựng, cướp bóc và sinh tồn bằng mọi giá.',
    price: 39.99,
    stock: 180,
    brand: 'Facepunch Studios',
    category: 'Sinh tồn',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg'
  },
  {
    name: 'Terraria',
    description: 'Game sandbox 2D kinh điển với khai thác, chiến đấu, xây dựng và khám phá.',
    price: 9.99,
    stock: 500,
    brand: 'Re-Logic',
    category: 'Sinh tồn',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg'
  },
  {
    name: 'The Forest',
    description: 'Sinh tồn trên hòn đảo bí ẩn đầy quái vật ăn thịt người, xây dựng nơi trú ẩn.',
    price: 19.99,
    stock: 200,
    brand: 'Endnight Games',
    category: 'Sinh tồn',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg'
  }
];

// ===== ĐUA XE (Racing) =====
const racingGames = [
  {
    name: 'Assetto Corsa Competizione',
    description: 'Sim đua xe GT chân thực nhất với vật lý lốp và khí động học chi tiết.',
    price: 39.99,
    stock: 100,
    brand: 'Kunos Simulazioni',
    category: 'Đua xe',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/805550/header.jpg'
  },
  {
    name: 'Need for Speed Unbound',
    description: 'Đua xe đường phố với phong cách nghệ thuật anime độc đáo và gameplay tốc độ cao.',
    price: 69.99,
    stock: 80,
    brand: 'Electronic Arts',
    category: 'Đua xe',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846380/header.jpg'
  },
  {
    name: 'Gran Turismo 7',
    description: 'Sim đua xe kinh điển từ PlayStation với hàng trăm xe và đường đua thực tế.',
    price: 59.99,
    stock: 90,
    brand: 'Polyphony Digital',
    category: 'Đua xe',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2440510/header.jpg'
  }
];

// ===== ĐỐI KHÁNG / MULTIPLAYER =====
const multiplayerGames = [
  {
    name: 'Apex Legends',
    description: 'Battle Royale miễn phí với Legend có kỹ năng đặc biệt và gameplay team-based.',
    price: 0.00,
    stock: 999,
    brand: 'Respawn Entertainment',
    category: 'Đối kháng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg'
  },
  {
    name: 'PUBG: Battlegrounds',
    description: 'Battle Royale nguyên bản - 100 người chơi, chỉ một người sống sót.',
    price: 0.00,
    stock: 999,
    brand: 'KRAFTON',
    category: 'Đối kháng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/578080/header.jpg'
  },
  {
    name: 'Overwatch 2',
    description: 'FPS team-based 5v5 với roster hero đa dạng và gameplay đồng đội kịch tính.',
    price: 0.00,
    stock: 999,
    brand: 'Blizzard Entertainment',
    category: 'Đối kháng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg'
  },
  {
    name: 'Valorant',
    description: 'FPS chiến thuật 5v5 từ Riot Games với hệ thống Agent và kỹ năng độc đáo.',
    price: 0.00,
    stock: 999,
    brand: 'Riot Games',
    category: 'Đối kháng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2게임/header.jpg'
  },
  {
    name: 'Rainbow Six Siege',
    description: 'FPS chiến thuật với hệ thống phá hủy môi trường và operator đặc biệt.',
    price: 19.99,
    stock: 200,
    brand: 'Ubisoft',
    category: 'Đối kháng',
    image_path: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/359550/header.jpg'
  }
];

// ---------------------------------------------------------------------------
// Combine all game arrays into a single catalog
// ---------------------------------------------------------------------------
const allGames = [
  ...rpgGames,
  ...actionGames,
  ...strategyGames,
  ...simulationGames,
  ...sportsGames,
  ...horrorGames,
  ...adventureGames,
  ...survivalGames,
  ...racingGames,
  ...multiplayerGames
];

// ---------------------------------------------------------------------------
// Helper: generate metadata_xml from brand + category (same format as original)
// ---------------------------------------------------------------------------
function generateMetadataXml(brand, category) {
  return `<metadata><publisher>${brand}</publisher><genre>${category}</genre></metadata>`;
}

// ---------------------------------------------------------------------------
// Main import logic with duplicate detection
// ---------------------------------------------------------------------------
function importGames() {
  // Step 1: Fetch all existing game names in one query to avoid N+1
  connection.query('SELECT name FROM products', (err, existingRows) => {
    if (err) {
      console.error('❌ Error fetching existing products:', err.message);
      connection.end();
      process.exit(1);
    }

    const existingNames = new Set(existingRows.map(row => row.name.toLowerCase().trim()));

    console.log(`📦 Database hiện có ${existingNames.size} sản phẩm.`);
    console.log(`📋 Danh sách import chứa ${allGames.length} game.\n`);

    // Step 2: Filter out duplicates
    const newGames = [];
    const skippedGames = [];

    for (const game of allGames) {
      if (existingNames.has(game.name.toLowerCase().trim())) {
        skippedGames.push(game.name);
      } else {
        newGames.push(game);
      }
    }

    if (skippedGames.length > 0) {
      console.log(`⏩ Bỏ qua ${skippedGames.length} game đã tồn tại trong DB:`);
      skippedGames.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }

    if (newGames.length === 0) {
      console.log('✅ Không có game mới nào cần import. Tất cả đều đã tồn tại!');
      connection.end();
      return;
    }

    console.log(`🚀 Bắt đầu import ${newGames.length} game mới...\n`);

    // Step 3: Insert new games sequentially
    let importedCount = 0;
    let errorCount = 0;

    function insertNext(index) {
      if (index >= newGames.length) {
        // ---- Summary ----
        console.log('\n' + '='.repeat(60));
        console.log('📊 KẾT QUẢ IMPORT:');
        console.log('='.repeat(60));
        console.log(`   ✅ Thành công:    ${importedCount}`);
        console.log(`   ⏩ Bỏ qua (trùng): ${skippedGames.length}`);
        console.log(`   ❌ Lỗi:           ${errorCount}`);
        console.log(`   📦 Tổng game:     ${allGames.length}`);
        console.log('='.repeat(60));
        connection.end();
        return;
      }

      const game = newGames[index];
      const metadataXml = game.metadata_xml || generateMetadataXml(game.brand, game.category);

      const query = `INSERT INTO products (name, description, price, stock, brand, category, metadata_xml, image_path) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        game.name,
        game.description,
        game.price,
        game.stock,
        game.brand,
        game.category,
        metadataXml,
        game.image_path
      ];

      connection.query(query, params, (insertErr) => {
        if (insertErr) {
          console.error(`   ❌ Lỗi import "${game.name}": ${insertErr.message}`);
          errorCount++;
        } else {
          importedCount++;
          console.log(`   ✅ [${importedCount}/${newGames.length}] ${game.name} (${game.category})`);
        }
        insertNext(index + 1);
      });
    }

    insertNext(0);
  });
}

// ---------------------------------------------------------------------------
// Connect and run
// ---------------------------------------------------------------------------
connection.connect((err) => {
  if (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    console.log('💡 Nếu chạy ngoài Docker, thử: DB_HOST=localhost node import_games_bulk.js');
    process.exit(1);
  }
  console.log('='.repeat(60));
  console.log('🎮 BULK GAME IMPORT SCRIPT');
  console.log(`🔗 Kết nối MySQL thành công tại: ${dbHost}`);
  console.log('='.repeat(60) + '\n');
  importGames();
});
