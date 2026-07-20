const mysql = require("mysql2");

// Support running both inside docker (host: 'db') and locally (host: 'localhost')
const dbHost = process.env.DB_HOST || "db";

const connection = mysql.createConnection({
  host: dbHost,
  user: "dbuser",
  password: "dbpassword",
  database: "ecommerce_db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err.message);
    console.log(
      "Try running with environment variable DB_HOST=localhost if running outside Docker.",
    );
    process.exit(1);
  }
  console.log(
    `Connected to MySQL database at ${dbHost}. Starting bulk import...`,
  );
  importGames();
});

const games = [
  {
    name: "Black Myth: Wukong",
    description:
      "Action RPG based on classical Chinese novel Journey to the West.",
    price: 59.99,
    stock: 100,
    brand: "Game Science",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>Game Science</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
  },
  {
    name: "Cyberpunk 2077",
    description: "Futuristic open-world action-adventure RPG in Night City.",
    price: 59.99,
    stock: 120,
    brand: "CD Projekt Red",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>CD Projekt Red</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
  },
  {
    name: "GTA V",
    description:
      "Open-world action thriller set in Los Santos and Blaine County.",
    price: 29.99,
    stock: 80,
    brand: "Rockstar Games",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
  },
  {
    name: "Elden Ring",
    description:
      "Fantasy action RPG set in the Lands Between, created with George R.R. Martin.",
    price: 59.99,
    stock: 200,
    brand: "FromSoftware",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>FromSoftware</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
  },
  {
    name: "Counter-Strike 2",
    description:
      "Tactical first-person shooter featuring source 2 engine updates.",
    price: 14.99,
    stock: 150,
    brand: "Valve",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
  },
  {
    name: "Portal 2",
    description:
      "Mind-bending first-person puzzle adventure featuring cooperative gameplay.",
    price: 9.99,
    stock: 140,
    brand: "Valve",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Valve</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg",
  },
  {
    name: "Civilization VI",
    description:
      "Turn-based strategy game where you build an empire to stand the test of time.",
    price: 59.99,
    stock: 100,
    brand: "2K Games",
    category: "Chiến thuật",
    metadata_xml:
      "<metadata><publisher>2K Games</publisher><genre>Chiến thuật</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg",
  },
  {
    name: "Microsoft Flight Simulator",
    description: "Highly detailed aviation simulation of the entire globe.",
    price: 69.99,
    stock: 150,
    brand: "Xbox Game Studios",
    category: "Mô phỏng",
    metadata_xml:
      "<metadata><publisher>Xbox Game Studios</publisher><genre>Mô phỏng</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg",
  },
  {
    name: "Hades II",
    description: "Rogue-like dungeon crawler fighting chronos, Titan of Time.",
    price: 29.99,
    stock: 200,
    brand: "Supergiant Games",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>Supergiant Games</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg",
  },
  {
    name: "Red Dead Redemption 2",
    description:
      "Epic Western open-world adventure detailing outlaw Arthur Morgan.",
    price: 59.99,
    stock: 250,
    brand: "Rockstar Games",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Rockstar Games</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
  },
  {
    name: "Baldur's Gate 3",
    description:
      "Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal.",
    price: 59.99,
    stock: 180,
    brand: "Larian Studios",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>Larian Studios</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
  },
  {
    name: "The Witcher 3: Wild Hunt",
    description:
      "Become a professional monster slayer and embark on an adventure of epic proportions.",
    price: 39.99,
    stock: 300,
    brand: "CD Projekt Red",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>CD Projekt Red</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
  },
  {
    name: "Hogwarts Legacy",
    description:
      "Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret.",
    price: 59.99,
    stock: 140,
    brand: "Warner Bros. Games",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>Warner Bros. Games</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg",
  },
  {
    name: "Sekiro: Shadows Die Twice",
    description:
      "Carve your own clever path to vengeance in the award-winning adventure from developer FromSoftware.",
    price: 59.99,
    stock: 90,
    brand: "FromSoftware",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>FromSoftware</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
  },
  {
    name: "Monster Hunter: World",
    description:
      "Welcome to a new world! Take on the role of a hunter and slay ferocious monsters.",
    price: 29.99,
    stock: 110,
    brand: "Capcom",
    category: "Nhập vai",
    metadata_xml:
      "<metadata><publisher>Capcom</publisher><genre>Nhập vai</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg",
  },
  {
    name: "Resident Evil 4",
    description:
      "Survival is just the beginning. Six years have passed since the disaster in Raccoon City.",
    price: 39.99,
    stock: 85,
    brand: "Capcom",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Capcom</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
  },
  {
    name: "Forza Horizon 5",
    description:
      "Your Ultimate Horizon Adventure awaits! Explore the vibrant open world landscapes of Mexico.",
    price: 59.99,
    stock: 75,
    brand: "Xbox Game Studios",
    category: "Mô phỏng",
    metadata_xml:
      "<metadata><publisher>Xbox Game Studios</publisher><genre>Mô phỏng</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
  },
  {
    name: "Hollow Knight",
    description:
      "Forge your own path in Hollow Knight! An epic action adventure through a ruined kingdom.",
    price: 14.99,
    stock: 350,
    brand: "Team Cherry",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Team Cherry</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
  },
  {
    name: "Age of Empires IV",
    description:
      "One of the most beloved real-time strategy games returns to glory with Age of Empires IV.",
    price: 39.99,
    stock: 120,
    brand: "Xbox Game Studios",
    category: "Chiến thuật",
    metadata_xml:
      "<metadata><publisher>Xbox Game Studios</publisher><genre>Chiến thuật</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg",
  },
  {
    name: "Street Fighter 6",
    description:
      "Here comes Capcom's newest challenger! Street Fighter 6 spans three distinct game modes.",
    price: 59.99,
    stock: 95,
    brand: "Capcom",
    category: "Hành động",
    metadata_xml:
      "<metadata><publisher>Capcom</publisher><genre>Hành động</genre></metadata>",
    image_path:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/header.jpg",
  },
];

function importGames() {
  let importedCount = 0;
  let skippedCount = 0;

  function importNext(index) {
    if (index >= games.length) {
      console.log(
        `Import completed. Success: ${importedCount}, Skipped (already exist): ${skippedCount}`,
      );
      connection.end();
      return;
    }

    const game = games[index];

    // Check if product with this name already exists
    connection.query(
      "SELECT id FROM products WHERE name = ?",
      [game.name],
      (err, results) => {
        if (err) {
          console.error(
            `Error checking existence of ${game.name}:`,
            err.message,
          );
          importNext(index + 1);
          return;
        }

        if (results && results.length > 0) {
          skippedCount++;
          importNext(index + 1);
        } else {
          const query =
            "INSERT INTO products (name, description, price, stock, brand, category, metadata_xml, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
          const params = [
            game.name,
            game.description,
            game.price,
            game.stock,
            game.brand,
            game.category,
            game.metadata_xml,
            game.image_path,
          ];

          connection.query(query, params, (insertErr) => {
            if (insertErr) {
              console.error(`Error importing ${game.name}:`, insertErr.message);
            } else {
              console.log(`Successfully imported: ${game.name}`);
              importedCount++;
            }
            importNext(index + 1);
          });
        }
      },
    );
  }

  importNext(0);
}
