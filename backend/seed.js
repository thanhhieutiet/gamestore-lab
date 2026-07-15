const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: 'db',
  user: 'dbuser',
  password: 'dbpassword',
  database: 'ecommerce_db',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
  runSeeding();
});

function runSeeding() {
  const alterQueries = [
    "ALTER TABLE users ADD COLUMN displayName VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL",
    "ALTER TABLE products ADD COLUMN image_path VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE products ADD COLUMN brand VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT NULL"
  ];

  let index = 0;
  function runNextAlter() {
    if (index < alterQueries.length) {
      const query = alterQueries[index++];
      connection.query(query, (err) => {
        if (err) {
          console.log(`Alter query skipped or exists: ${query} (${err.message})`);
        } else {
          console.log(`Alter query succeeded: ${query}`);
        }
        runNextAlter();
      });
    } else {
      performInserts();
    }
  }
  
  runNextAlter();
}

function performInserts() {
  const seedSql = `
    SET FOREIGN_KEY_CHECKS = 0;
    
    TRUNCATE TABLE reviews;
    TRUNCATE TABLE orders;
    TRUNCATE TABLE products;
    TRUNCATE TABLE users;
    TRUNCATE TABLE roles;
    
    INSERT INTO roles (id, role_name) VALUES 
    (1, 'admin'),
    (2, 'user');
    
    INSERT INTO users (id, username, password, role_id, displayName, email, phone, avatar_path) VALUES
    (1, 'admin', 'adminSecurePasswordHash123!', 1, 'System Administrator', 'admin@shoplab.local', '0987654321', '/uploads/avatars/admin.svg'),
    (2, 'user1', 'user1PasswordHash', 2, 'Nguyen Van A', 'usera@gmail.com', '0901234567', '/uploads/avatars/user1.svg'),
    (3, 'user2', 'user2PasswordHash', 2, 'Tran Thi B', 'userb@gmail.com', '0912345678', NULL);
    
    INSERT INTO products (id, name, description, price, stock, brand, category, metadata_xml, image_path) VALUES
    (1, 'Black Myth: Wukong', 'Action RPG based on classical Chinese novel Journey to the West.', 59.99, 10, 'Game Science', 'Nhập vai', '<metadata><publisher>Game Science</publisher><genre>Nhập vai</genre></metadata>', '/uploads/products/game_wukong.svg'),
    (2, 'Cyberpunk 2077', 'Futuristic open-world action-adventure RPG in Night City.', 59.99, 12, 'CD Projekt Red', 'Nhập vai', '<metadata><publisher>CD Projekt Red</publisher><genre>Nhập vai</genre></metadata>', '/uploads/products/game_cyberpunk.svg'),
    (3, 'GTA V', 'Open-world action thriller set in Los Santos and Blaine County.', 29.99, 8, 'Rockstar Games', 'Hành động', '<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>', '/uploads/products/game_gtav.svg'),
    (4, 'Elden Ring', 'Fantasy action RPG set in the Lands Between, created with George R.R. Martin.', 59.99, 20, 'FromSoftware', 'Nhập vai', '<metadata><publisher>FromSoftware</publisher><genre>Nhập vai</genre></metadata>', '/uploads/products/game_eldenring.svg'),
    (5, 'Counter-Strike 2', 'Tactical first-person shooter featuring source 2 engine updates.', 14.99, 15, 'Valve', 'Hành động', '<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>', '/uploads/products/game_cs2.svg'),
    (6, 'Portal 2', 'Mind-bending first-person puzzle adventure featuring cooperative gameplay.', 9.99, 14, 'Valve', 'Hành động', '<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>', '/uploads/products/game_portal2.svg'),
    (7, 'Civilization VI', 'Turn-based strategy game where you build an empire to stand the test of time.', 59.99, 10, '2K Games', 'Chiến thuật', '<metadata><publisher>2K Games</publisher><genre>Chiến thuật</genre></metadata>', '/uploads/products/game_civ6.svg'),
    (8, 'Microsoft Flight Simulator', 'Highly detailed aviation simulation of the entire globe.', 69.99, 15, 'Xbox Game Studios', 'Mô phỏng', '<metadata><publisher>Xbox Game Studios</publisher><genre>Mô phỏng</genre></metadata>', '/uploads/products/game_flight.svg'),
    (9, 'Hades II', 'Rogue-like dungeon crawler fighting chronos, Titan of Time.', 29.99, 200, 'Supergiant Games', 'Nhập vai', '<metadata><publisher>Supergiant Games</publisher><genre>Nhập vai</genre></metadata>', '/uploads/products/game_hades.svg'),
    (10, 'Red Dead Redemption 2', 'Epic Western open-world adventure detailing outlaw Arthur Morgan.', 59.99, 25, 'Rockstar Games', 'Hành động', '<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>', '/uploads/products/game_rdr2.svg');
    
    INSERT INTO orders (id, user_id, total_amount, status) VALUES
    (1, 2, 89.98, 'completed'),
    (2, 3, 59.99, 'pending');
    
    INSERT INTO reviews (id, product_id, user_id, content) VALUES
    (1, 1, 2, 'Stunning graphics and incredible boss fights!'),
    (2, 6, 3, 'The best puzzle game ever made. Highly recommended!');
    
    SET FOREIGN_KEY_CHECKS = 1;
  `;
  
  connection.query(seedSql, (err) => {
    if (err) {
      console.error('Error seeding database:', err);
      connection.end();
      process.exit(1);
    }
    console.log('Database successfully seeded.');
    generateImages();
  });
}

function generateImages() {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  const productsDir = path.join(uploadsDir, 'products');
  const avatarsDir = path.join(uploadsDir, 'avatars');
  
  if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
  
  const gameWukongSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#1c1917"/>
  <path d="M 200,60 L 270,100 L 270,170 C 270,220 200,250 200,250 C 200,250 130,220 130,170 L 130,100 Z" fill="#78716c" stroke="#d97706" stroke-width="6"/>
  <path d="M 120,60 L 280,220 M 280,60 L 120,220" stroke="#e7e5e4" stroke-width="8" stroke-linecap="round"/>
  <path d="M 120,60 L 280,220 M 280,60 L 120,220" stroke="#d97706" stroke-width="3" stroke-linecap="round"/>
  <path d="M 200,75 L 255,110 L 255,170 C 255,210 200,235 200,235 C 200,235 145,210 145,170 L 145,110 Z" fill="#44403c" stroke="#f59e0b" stroke-width="3"/>
  <text x="200" y="280" font-family="sans-serif" font-size="16" fill="#f59e0b" text-anchor="middle" font-weight="bold">SWORD &amp; SHIELD</text>
</svg>`;

  const gameCyberpunkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#090514"/>
  <line x1="0" y1="220" x2="400" y2="220" stroke="#f43f5e" stroke-width="2"/>
  <line x1="50" y1="220" x2="20" y2="300" stroke="#f43f5e" stroke-width="1"/>
  <line x1="150" y1="220" x2="130" y2="300" stroke="#f43f5e" stroke-width="1"/>
  <line x1="250" y1="220" x2="270" y2="300" stroke="#f43f5e" stroke-width="1"/>
  <line x1="350" y1="220" x2="380" y2="300" stroke="#f43f5e" stroke-width="1"/>
  <path d="M 160,80 C 160,50 240,50 240,80 C 240,110 230,120 230,130 L 220,130 L 220,150 L 180,150 L 180,130 L 170,130 C 170,120 160,110 160,80 Z" fill="none" stroke="#06b6d4" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="185" cy="90" r="10" fill="#06b6d4"/>
  <circle cx="215" cy="90" r="10" fill="#06b6d4"/>
  <path d="M 200,105 L 195,115 L 205,115 Z" fill="#06b6d4"/>
  <line x1="190" y1="140" x2="190" y2="150" stroke="#06b6d4" stroke-width="3"/>
  <line x1="200" y1="140" x2="200" y2="150" stroke="#06b6d4" stroke-width="3"/>
  <line x1="210" y1="140" x2="210" y2="150" stroke="#06b6d4" stroke-width="3"/>
  <text x="200" y="260" font-family="sans-serif" font-size="20" fill="#f43f5e" text-anchor="middle" font-weight="bold" letter-spacing="4">NEON SKULL</text>
</svg>`;

  const gameGtavSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#15803d"/>
  <path d="M 0,220 Q 100,180 200,220 T 400,220 L 400,300 L 0,300 Z" fill="#14532d"/>
  <path d="M 100,180 L 130,140 L 270,140 L 300,180 L 320,180 C 330,180 340,190 340,200 L 340,220 L 60,220 L 60,200 C 60,190 70,180 80,180 Z" fill="#fbbf24" stroke="#1e293b" stroke-width="4"/>
  <path d="M 140,148 L 195,148 L 195,175 L 115,175 Z" fill="#1e293b"/>
  <path d="M 205,148 L 260,148 L 285,175 L 205,175 Z" fill="#1e293b"/>
  <circle cx="110" cy="220" r="25" fill="#1e293b" stroke="#cbd5e1" stroke-width="4"/>
  <circle cx="290" cy="220" r="25" fill="#1e293b" stroke="#cbd5e1" stroke-width="4"/>
  <circle cx="110" cy="220" r="10" fill="#94a3b8"/>
  <circle cx="290" cy="220" r="10" fill="#94a3b8"/>
  <text x="200" y="270" font-family="sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="bold">RACING CAR</text>
</svg>`;

  const gameEldenringSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#0c0a09"/>
  <circle cx="200" cy="110" r="50" fill="none" stroke="#ca8a04" stroke-width="4"/>
  <circle cx="200" cy="150" r="60" fill="none" stroke="#eab308" stroke-width="4"/>
  <circle cx="160" cy="150" r="45" fill="none" stroke="#ca8a04" stroke-width="3"/>
  <circle cx="240" cy="150" r="45" fill="none" stroke="#ca8a04" stroke-width="3"/>
  <line x1="200" y1="30" x2="200" y2="230" stroke="#fef08a" stroke-width="3"/>
  <path d="M 120,200 Q 200,240 280,200" fill="none" stroke="#eab308" stroke-width="4"/>
  <text x="200" y="275" font-family="Georgia, serif" font-size="20" fill="#fef08a" text-anchor="middle" letter-spacing="3">GOLDEN RINGS</text>
</svg>`;

  const gameCs2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#1e1b4b"/>
  <line x1="0" y1="150" x2="400" y2="150" stroke="#312e81" stroke-width="1"/>
  <line x1="200" y1="0" x2="200" y2="300" stroke="#312e81" stroke-width="1"/>
  <circle cx="200" cy="130" r="60" fill="none" stroke="#22c55e" stroke-width="3"/>
  <circle cx="200" cy="130" r="5" fill="#22c55e"/>
  <line x1="200" y1="50" x2="200" y2="100" stroke="#22c55e" stroke-width="4"/>
  <line x1="200" y1="160" x2="200" y2="210" stroke="#22c55e" stroke-width="4"/>
  <line x1="120" y1="130" x2="170" y2="130" stroke="#22c55e" stroke-width="4"/>
  <line x1="230" y1="130" x2="280" y2="130" stroke="#22c55e" stroke-width="4"/>
  <text x="200" y="260" font-family="sans-serif" font-size="24" fill="#f97316" text-anchor="middle" font-weight="black">CROSSHAIR</text>
</svg>`;

  const gamePortal2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#0f172a"/>
  <ellipse cx="130" cy="140" rx="35" ry="70" fill="#1e293b" stroke="#06b6d4" stroke-width="8"/>
  <ellipse cx="270" cy="140" rx="35" ry="70" fill="#1e293b" stroke="#f97316" stroke-width="8"/>
  <path d="M 110,140 L 130,140 L 140,155 M 130,140 L 145,130" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
  <path d="M 270,140 L 290,140 L 305,155 M 290,140 L 300,125" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
  <circle cx="295" cy="120" r="5" fill="#cbd5e1"/>
  <text x="200" y="260" font-family="monospace" font-size="24" fill="#e2e8f0" text-anchor="middle" font-weight="bold">PORTAL RINGS</text>
</svg>`;

  const gameCiv6Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#0f172a"/>
  <circle cx="200" cy="130" r="70" fill="#1d4ed8" stroke="#f59e0b" stroke-width="4"/>
  <path d="M 160,100 Q 180,80 210,100 T 230,140 T 180,180 T 150,140 Z" fill="#15803d"/>
  <path d="M 220,100 Q 240,90 250,110 T 230,150 Z" fill="#15803d"/>
  <path d="M 170,90 L 185,80 L 200,90 L 200,110 L 185,120 L 170,110 Z" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.6"/>
  <path d="M 200,90 L 215,80 L 230,90 L 230,110 L 215,120 L 200,110 Z" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.6"/>
  <path d="M 185,120 L 200,110 L 215,120 L 215,140 L 200,150 L 185,140 Z" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.6"/>
  <text x="200" y="250" font-family="Georgia, serif" font-size="22" fill="#f59e0b" text-anchor="middle" font-weight="bold">GLOBE MAP</text>
</svg>`;

  const gameFlightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#38bdf8"/>
  <circle cx="80" cy="180" r="40" fill="#f8fafc"/>
  <circle cx="120" cy="190" r="30" fill="#f8fafc"/>
  <circle cx="320" cy="150" r="50" fill="#f8fafc"/>
  <circle cx="280" cy="160" r="35" fill="#f8fafc"/>
  <path d="M 80,120 L 320,120 L 200,140 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <ellipse cx="200" cy="130" rx="15" ry="30" fill="#ffffff" stroke="#475569" stroke-width="2"/>
  <rect x="130" y="125" width="14" height="20" rx="3" fill="#475569"/>
  <rect x="256" y="125" width="14" height="20" rx="3" fill="#475569"/>
  <path d="M 200,100 L 200,70 L 205,70 L 208,100 Z" fill="#cbd5e1"/>
  <text x="200" y="250" font-family="sans-serif" font-size="18" fill="#0f172a" text-anchor="middle" font-weight="bold">AIRPLANE</text>
</svg>`;

  const gameHadesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#180808"/>
  <path d="M 50,300 Q 80,180 120,300 Q 150,150 200,300 Q 250,170 280,300 Q 330,190 350,300 Z" fill="#b91c1c" opacity="0.6"/>
  <path d="M 80,300 Q 120,200 160,300 Q 200,180 240,300 Q 280,210 320,300 Z" fill="#ea580c" opacity="0.8"/>
  <line x1="200" y1="240" x2="200" y2="60" stroke="#f59e0b" stroke-width="6"/>
  <path d="M 200,40 L 215,70 L 185,70 Z" fill="#f59e0b"/>
  <path d="M 180,60 Q 190,80 200,80 Q 210,80 220,60" fill="none" stroke="#f59e0b" stroke-width="4"/>
  <text x="200" y="270" font-family="Georgia, serif" font-size="24" fill="#fecdd3" text-anchor="middle" font-weight="bold" letter-spacing="5">FLAMING SPEAR</text>
</svg>`;

  const gameRdr2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#7f1d1d"/>
  <circle cx="200" cy="180" r="90" fill="#f97316"/>
  <rect x="0" y="220" width="400" height="80" fill="#1c1917"/>
  <path d="M 150,150 Q 170,100 200,105 Q 230,100 250,150 Z" fill="#292524" stroke="#1c1917" stroke-width="3"/>
  <path d="M 160,150 Q 200,115 240,150" fill="none" stroke="#b91c1c" stroke-width="4"/>
  <path d="M 110,165 Q 200,140 290,165 Q 310,175 290,180 Q 200,165 110,180 Q 90,175 110,165 Z" fill="#292524" stroke="#1c1917" stroke-width="2"/>
  <text x="200" y="260" font-family="Impact, sans-serif" font-size="22" fill="#ffffff" text-anchor="middle" font-weight="bold" letter-spacing="2">COWBOY HAT</text>
</svg>`;

  const adminAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="50" fill="#312e81"/>
  <circle cx="50" cy="40" r="18" fill="#e2e8f0"/>
  <path d="M20 80 C20 62 30 58 50 58 C70 58 80 62 80 80 Z" fill="#e2e8f0"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" stroke-width="4"/>
</svg>`;

  const userAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="50" fill="#1e293b"/>
  <rect x="25" y="38" width="50" height="28" rx="10" fill="#cbd5e1"/>
  <path d="M 25,43 C 20,43 15,55 18,65 C 20,70 27,65 27,60 Z" fill="#cbd5e1"/>
  <path d="M 75,43 C 80,43 85,55 82,65 C 80,70 73,65 73,60 Z" fill="#cbd5e1"/>
  <path d="M 33,48 L 37,48 L 37,44 L 39,44 L 39,48 L 43,48 L 43,50 L 39,50 L 39,54 L 37,54 L 37,50 L 33,50 Z" fill="#475569"/>
  <circle cx="61" cy="47" r="2.5" fill="#f43f5e"/>
  <circle cx="67" cy="47" r="2.5" fill="#3b82f6"/>
  <circle cx="64" cy="44" r="2.5" fill="#10b981"/>
  <circle cx="64" cy="50" r="2.5" fill="#f59e0b"/>
</svg>`;

  fs.writeFileSync(path.join(productsDir, 'game_wukong.svg'), gameWukongSvg);
  fs.writeFileSync(path.join(productsDir, 'game_cyberpunk.svg'), gameCyberpunkSvg);
  fs.writeFileSync(path.join(productsDir, 'game_gtav.svg'), gameGtavSvg);
  fs.writeFileSync(path.join(productsDir, 'game_eldenring.svg'), gameEldenringSvg);
  fs.writeFileSync(path.join(productsDir, 'game_cs2.svg'), gameCs2Svg);
  fs.writeFileSync(path.join(productsDir, 'game_portal2.svg'), gamePortal2Svg);
  fs.writeFileSync(path.join(productsDir, 'game_civ6.svg'), gameCiv6Svg);
  fs.writeFileSync(path.join(productsDir, 'game_flight.svg'), gameFlightSvg);
  fs.writeFileSync(path.join(productsDir, 'game_hades.svg'), gameHadesSvg);
  fs.writeFileSync(path.join(productsDir, 'game_rdr2.svg'), gameRdr2Svg);
  
  fs.writeFileSync(path.join(avatarsDir, 'admin.svg'), adminAvatarSvg);
  fs.writeFileSync(path.join(avatarsDir, 'user1.svg'), userAvatarSvg);
  
  console.log('Seeded vector images for products and avatars.');
  connection.end();
  console.log('Seeding process complete.');
}
