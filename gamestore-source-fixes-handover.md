# GameLab --- Báo cáo các thay đổi cần đồng bộ về source code

## Mục đích

Trong quá trình deploy `gamestore-lab` từ GitHub lên Ubuntu + Docker, đã
phát hiện một số lỗi do môi trường deploy và source code hiện tại chưa
đồng bộ hoàn toàn.

Trên máy Ubuntu đã sửa/chữa cháy trực tiếp để hệ thống chạy được. File
này dùng làm **handover cho Agent quản lý source code trên máy dev**, để
Agent cập nhật lại source chính thức rồi `git push`.

> **Quan trọng:** Không chỉ sửa Ubuntu rồi để đó. Các thay đổi bên dưới
> cần được cập nhật vào source/repository để lần clone/deploy tiếp theo
> không lặp lại lỗi.

------------------------------------------------------------------------

# 1. Node.js / dependency

## Vấn đề

Ubuntu ban đầu đang dùng:

``` bash
node -v
v12.22.9
```

Khi chạy:

``` bash
node import_games.js
```

bị:

``` text
Error: Cannot find module 'mysql2'
```

Sau khi `npm install mysql2`, dependency lại kéo theo package sử dụng:

``` text
node:buffer
```

và Node.js 12 không hỗ trợ cách import này.

Ngoài ra npm cảnh báo nhiều package yêu cầu Node.js mới hơn:

``` text
color@5.0.3 -> node >=18
color-convert@3.1.3 -> node >=14.6
triple-beam@1.4.1 -> node >=14
```

## Đã xử lý trên Ubuntu

Đã chuyển sang:

``` text
Node.js v22.23.2
npm v10.9.8
```

sau đó xóa dependency cũ và cài lại:

``` bash
rm -rf node_modules
npm install
```

## Agent cần làm

### 1. Không commit `node_modules`

Đảm bảo `.gitignore` có:

``` gitignore
node_modules/
```

### 2. `package.json` phải khai báo đầy đủ dependency

Đặc biệt phải có:

``` json
"mysql2": "..."
```

Không được phụ thuộc vào việc developer/deployer tự chạy
`npm install mysql2` sau khi clone.

### 3. Nên khai báo Node.js version

Khuyến nghị thêm vào `package.json`:

``` json
"engines": {
  "node": ">=18"
}
```

Hoặc nếu project quyết định chuẩn hóa Node 22:

``` json
"engines": {
  "node": ">=22"
}
```

Nếu project dùng NVM, có thể thêm `.nvmrc`:

``` text
22
```

### 4. Commit `package-lock.json`

Sau khi dependency ổn định:

``` bash
npm install
```

và commit:

``` text
package.json
package-lock.json
```

Không commit:

``` text
node_modules/
```

------------------------------------------------------------------------

# 2. Database host: Docker vs chạy script trực tiếp trên Ubuntu

## Vấn đề

`import_games.js` có logic:

``` js
const dbHost = process.env.DB_HOST || "db";
```

Điều này đúng khi script chạy bên trong Docker Compose vì service
database có hostname:

``` text
db
```

Nhưng khi chạy trực tiếp trên Ubuntu:

``` bash
DB_HOST=localhost node import_games.js
```

thì phải dùng:

``` text
localhost
```

Nếu không:

``` text
getaddrinfo EAI_AGAIN db
```

## Nguyên tắc cần giữ

### Backend chạy trong Docker

``` text
DB_HOST=db
```

### Script chạy trực tiếp trên Ubuntu

``` text
DB_HOST=localhost
```

Không hard-code `localhost` vào backend Docker.

## Agent cần kiểm tra

`docker-compose.yml` nên truyền biến môi trường rõ ràng cho backend, ví
dụ:

``` yaml
environment:
  DB_HOST: db
  DB_USER: dbuser
  DB_PASSWORD: dbpassword
  DB_NAME: ecommerce_db
```

Và backend nên đọc:

``` js
process.env.DB_HOST
process.env.DB_USER
process.env.DB_PASSWORD
process.env.DB_NAME
```

Nếu source hiện tại đang hard-code user/password/database thì có thể giữ
behavior hiện tại nếu mục tiêu lab yêu cầu, nhưng **DB host phải hỗ trợ
Docker và local**.

------------------------------------------------------------------------

# 3. Database schema của `products` bị thiếu column

## Vấn đề

`import_games.js` đang insert:

``` sql
brand
category
metadata_xml
image_path
```

nhưng `init.sql` ban đầu chỉ tạo:

``` text
id
name
description
price
stock
metadata_xml
```

Do đó import lần đầu lỗi:

``` text
Unknown column 'brand' in 'field list'
```

Sau khi thêm `brand`, tiếp tục lỗi:

``` text
Unknown column 'category' in 'field list'
```

Cuối cùng đã thêm đầy đủ:

``` text
brand
category
image_path
```

## Schema chính thức cần có

Bảng `products` phải tương đương:

``` sql
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL,
  `metadata_xml` TEXT,
  `brand` VARCHAR(255),
  `category` VARCHAR(255),
  `image_path` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Agent cần làm

Sửa **source `init.sql` chính thức** để schema mới được tạo ngay từ đầu.

Không để tình trạng:

``` text
init.sql -> schema cũ
import_games.js -> schema mới
```

vì clone/deploy trên máy mới sẽ lại lỗi.

------------------------------------------------------------------------

# 4. Không nên để `init.sql` seed 3 sản phẩm cũ

## Vấn đề

`init.sql` ban đầu seed:

``` text
CyberRange Workstation x100
Ethical Hacking Guide Book
Smart Secure Lock
```

Đây là các sản phẩm demo cũ, không đồng nhất với UI GameLab hiện tại.

Trong khi `import_games.js` đã có 20 game thật/demo với:

-   brand
-   category
-   metadata_xml
-   image_path

Sau khi import đúng, UI đã hiển thị đẹp với game và ảnh tương ứng.

## Quyết định cần áp dụng

`init.sql` nên seed trực tiếp **20 game hiện tại**.

Mục tiêu:

``` text
docker compose down -v
docker compose up -d
```

=\> database mới được tạo ra đã có đầy đủ game.

Không cần phụ thuộc vào việc người dùng phải chạy:

``` bash
node import_games.js
```

sau đó.

------------------------------------------------------------------------

# 5. Seed 20 game trong `init.sql`

Danh sách cần đồng bộ với `import_games.js`:

1.  Black Myth: Wukong
2.  Cyberpunk 2077
3.  GTA V
4.  Elden Ring
5.  Counter-Strike 2
6.  Portal 2
7.  Civilization VI
8.  Microsoft Flight Simulator
9.  Hades II
10. Red Dead Redemption 2
11. Baldur's Gate 3
12. The Witcher 3: Wild Hunt
13. Hogwarts Legacy
14. Sekiro: Shadows Die Twice
15. Monster Hunter: World
16. Resident Evil 4
17. Forza Horizon 5
18. Hollow Knight
19. Age of Empires IV
20. Street Fighter 6

Mỗi record phải có:

``` text
name
description
price
stock
brand
category
metadata_xml
image_path
```

`image_path` phải giữ URL ảnh game đang được `import_games.js` sử dụng.

Các URL hiện tại dùng Steam CDN dạng:

``` text
https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/<APP_ID>/header.jpg
```

Không tự thay bằng URL khác nếu chưa kiểm tra.

------------------------------------------------------------------------

# 6. Orders và Reviews phải được seed lại theo 20 game mới

Không nên giữ orders cũ tham chiếu tới:

``` text
CyberRange Workstation x100
Ethical Hacking Guide Book
Smart Secure Lock
```

vì những sản phẩm này không còn là catalog chính.

## Orders

Có thể seed một số order demo sử dụng các game mới.

Ví dụ:

``` sql
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
  89.97,
  'completed',
  '[{"id":2,"name":"Cyberpunk 2077","price":59.99,"quantity":1},{"id":18,"name":"Hollow Knight","price":14.99,"quantity":2}]'
),
(
  3,
  2,
  89.97,
  'pending',
  '[{"id":10,"name":"Red Dead Redemption 2","price":59.99,"quantity":1},{"id":5,"name":"Counter-Strike 2","price":14.99,"quantity":2}]'
),
(
  4,
  3,
  69.96,
  'completed',
  '[{"id":16,"name":"Resident Evil 4","price":39.99,"quantity":1},{"id":6,"name":"Portal 2","price":9.99,"quantity":3}]'
);
```

**Lưu ý:** `total_amount` phải khớp với `items_json`.

------------------------------------------------------------------------

# 7. Reviews

Reviews cũng phải tham chiếu `product_id` của 20 game mới.

Ví dụ:

``` sql
INSERT INTO `reviews`
(`id`, `product_id`, `user_id`, `content`)
VALUES
(1, 1, 2, 'Amazing action RPG with beautiful visuals and a great combat system.'),
(2, 2, 3, 'The world design is impressive and Night City feels very immersive.'),
(3, 4, 2, 'Challenging but extremely rewarding. The exploration is fantastic.'),
(4, 5, 3, 'Great competitive FPS. Matches are fast and the gunplay feels responsive.'),
(5, 10, 2, 'One of the best open-world games I have played. The world is incredibly detailed.'),
(6, 18, 3, 'Beautiful art style, challenging combat and a surprisingly deep world.'),
(7, 16, 2, 'The atmosphere and survival horror elements are excellent.');
```

Không cần review cho cả 20 game. Chỉ cần đủ dữ liệu demo để test UI.

------------------------------------------------------------------------

# 8. Foreign Key cần được giữ đúng

Cấu trúc quan hệ:

``` text
users
  │
  ├───────────────┐
  │               │
  ▼               ▼
orders          reviews
                  │
                  ▼
               products
```

Cụ thể:

``` text
orders.user_id
    -> users.id

reviews.user_id
    -> users.id

reviews.product_id
    -> products.id
```

Không seed `reviews` tham chiếu tới product đã xóa.

Không seed `orders.items_json` chứa sản phẩm không tồn tại.

------------------------------------------------------------------------

# 9. Frontend API URL --- lỗi quan trọng nhất khi deploy

## Vấn đề

Frontend hiện tại có nhiều chỗ hard-code:

``` js
const API = "http://localhost:3000/api";
```

và:

``` js
const BASE_URL = "http://localhost:3000";
```

Điều này chạy được trên máy dev nếu browser và backend cùng ở localhost.

Nhưng khi deploy:

``` text
Client browser
      |
      | HTTP
      v
pfSense port forwarding
      |
      v
Ubuntu
      |
      +--> Nginx :80
              |
              +--> Frontend
              |
              +--> /api -> backend:3000
```

Browser của máy client hiểu:

``` text
localhost
```

là **chính máy client**, không phải Ubuntu server.

Do đó browser cố gọi:

``` text
http://localhost:3000/api/products
```

và nhận:

``` text
net::ERR_CONNECTION_REFUSED
```

## Đây chính là nguyên nhân khiến web không hiển thị game

Database đã có:

``` text
20 products
```

Backend container đang chạy:

``` text
Server is running on port 3000
```

Nginx cũng đã reverse proxy:

``` nginx
location /api {
    proxy_pass http://backend:3000;
}
```

Nhưng frontend lại bypass Nginx và gọi thẳng:

``` text
localhost:3000
```

------------------------------------------------------------------------

# 10. Frontend phải dùng relative URL

Đây là thay đổi quan trọng cần Agent thực hiện trên source chính.

Thay:

``` js
const API = "http://localhost:3000/api";
```

bằng:

``` js
const API = "/api";
```

Thay:

``` js
const BASE_URL = "http://localhost:3000";
```

bằng:

``` js
const BASE_URL = "";
```

hoặc tốt hơn, nếu logic phù hợp:

``` js
const BASE_URL = window.location.origin;
```

Nhưng với architecture hiện tại, ưu tiên:

``` js
const API = "/api";
const BASE_URL = "";
```

để browser gọi:

``` text
http://<public-host>/api/products
```

và Nginx forward nội bộ:

``` text
/api
  -> backend:3000
```

------------------------------------------------------------------------

# 11. Những file frontend cần kiểm tra

Từ source hiện tại, `localhost:3000` xuất hiện trong:

``` text
frontend/checkout.html
frontend/admin.html
frontend/index.html
frontend/register.html
frontend/orders.html
frontend/login.html
frontend/deals.html
frontend/library.html
frontend/product.html
frontend/profile.html
```

Agent cần grep lại toàn repository:

``` bash
grep -Rni "localhost:3000" frontend/
```

và loại bỏ các URL production không phù hợp.

Có thể dùng:

``` bash
grep -Rni "localhost:3000" .
```

nhưng bỏ qua:

``` text
node_modules/
README.md
prompt/
```

nếu đó chỉ là documentation/example.

------------------------------------------------------------------------

# 12. Nginx hiện tại đã đúng hướng

Nginx trong Docker đang có:

``` nginx
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri.html $uri/ =404;
}

location /api {
    proxy_pass http://backend:3000;
}

location /admin/products/import {
    proxy_pass http://backend:3000;
}

location /uploads {
    proxy_pass http://backend:3000;
}
```

Không cần đổi kiến trúc này chỉ để sửa lỗi API.

Vấn đề chính là frontend phải gọi:

``` text
/api/...
```

thay vì:

``` text
http://localhost:3000/api/...
```

------------------------------------------------------------------------

# 13. Không cần mở port 3000 ra public

Với kiến trúc hiện tại:

``` text
Internet / Client
       |
       v
pfSense
       |
       v
Ubuntu :80
       |
       v
Nginx
       |
       v
backend:3000
```

Backend chỉ cần accessible trong Docker network.

Không cần frontend browser truy cập trực tiếp:

``` text
Ubuntu:3000
```

và không cần expose public port 3000.

Điều này cũng phù hợp hơn với kiến trúc reverse proxy.

------------------------------------------------------------------------

# 14. Cần test deployment từ đầu

Sau khi Agent sửa source và push GitHub, trên Ubuntu test lại từ clean
state.

Ví dụ:

``` bash
git pull
```

Sau đó:

``` bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

Kiểm tra:

``` bash
docker ps
```

Mong muốn:

``` text
ecommerce-db
ecommerce-backend
ecommerce-nginx
```

đều running.

Database:

``` bash
docker exec -it ecommerce-db mysql -u root -p ecommerce_db
```

Sau đó:

``` sql
SHOW TABLES;
DESCRIBE products;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM reviews;
```

Expected:

``` text
products = 20
orders   = 4
reviews  = 7
```

Có thể kiểm tra:

``` sql
SELECT id, name, brand, category, image_path
FROM products;
```

------------------------------------------------------------------------

# 15. Test API qua Nginx

Không chỉ test trực tiếp backend.

Test:

``` bash
curl http://localhost/api/products
```

Nếu API hỗ trợ pagination:

``` bash
curl "http://localhost/api/products?page=1&limit=6"
```

Điểm quan trọng là API phải trả về dữ liệu qua:

``` text
Nginx -> backend
```

------------------------------------------------------------------------

# 16. Test từ máy client

Từ máy khác trong mạng:

``` text
http://<public-host>/
```

Mở DevTools -\> Network.

Request đúng phải có dạng:

``` text
GET /api/products?page=1&limit=6
```

hoặc:

``` text
GET http://<public-host>/api/products?page=1&limit=6
```

Không được xuất hiện:

``` text
GET http://localhost:3000/api/products
```

Nếu còn `localhost:3000`, frontend vẫn còn hard-code API URL.

------------------------------------------------------------------------

# 17. Checklist cho Agent

Agent cần thực hiện các việc sau trên source chính:

-   [ ] Kiểm tra `package.json`
-   [ ] Đảm bảo `mysql2` nằm trong dependencies
-   [ ] Commit `package-lock.json`
-   [ ] Không commit `node_modules`
-   [ ] Chuẩn hóa Node.js version (khuyến nghị Node 22)
-   [ ] Có thể thêm `.nvmrc` = `22`
-   [ ] Sửa `init.sql` schema `products`
-   [ ] Thêm `brand`
-   [ ] Thêm `category`
-   [ ] Thêm `image_path`
-   [ ] Thay 3 sản phẩm cũ bằng 20 game hiện tại
-   [ ] Seed `orders` theo 20 game mới
-   [ ] Seed `reviews` theo 20 game mới
-   [ ] Kiểm tra toàn bộ Foreign Key
-   [ ] Kiểm tra `items_json`
-   [ ] Kiểm tra `total_amount`
-   [ ] Tìm toàn bộ `localhost:3000` trong frontend
-   [ ] Đổi API URL thành `/api`
-   [ ] Đổi BASE URL thành relative/current-origin phù hợp
-   [ ] Kiểm tra Nginx `/api -> backend:3000`
-   [ ] Test clean deployment bằng
    `docker compose down -v && docker compose up`
-   [ ] Test API thông qua Nginx
-   [ ] Test từ máy client khác

------------------------------------------------------------------------

# 18. Kiến trúc cuối cùng mong muốn

``` text
                    Internet / Client
                           |
                           v
                       pfSense
                    Port Forward
                           |
                           v
                  Ubuntu VM / Host
                           |
                         :80
                           |
                           v
                  +----------------+
                  |     Nginx      |
                  | ecommerce-     |
                  | nginx          |
                  +----------------+
                    |            |
             static files       /api
                    |            |
                    |            v
                    |     +-------------+
                    |     |   Backend   |
                    |     |   :3000     |
                    |     +-------------+
                    |            |
                    |            v
                    |     +-------------+
                    |     |    MySQL    |
                    |     | ecommerce_db|
                    |     +-------------+
                    |
                    v
                 Browser
```

Browser **không biết và không cần biết** backend Docker đang chạy ở port
3000.

Browser chỉ cần:

``` text
/
 /api
 /uploads
```

Nginx chịu trách nhiệm route request vào đúng container.

------------------------------------------------------------------------

# 19. Kết luận

Lỗi vừa rồi không phải do MySQL không có game.

Database cuối cùng đã import thành công:

``` text
Successfully imported: ... (20 games)
Import completed. Success: 20, Skipped: 0
```

Lỗi web không hiển thị game là do **frontend browser gọi
`localhost:3000`**.

Trên máy client:

``` text
localhost != Ubuntu server
```

Sau khi đổi frontend từ:

``` js
http://localhost:3000/api
```

sang:

``` js
/api
```

request sẽ đi đúng flow:

``` text
Client
  -> public host :80
  -> Nginx
  -> backend:3000
  -> MySQL
```

Đồng thời cần đưa toàn bộ schema + seed data + dependency fixes vào
GitHub để **clean clone trên một máy khác vẫn chạy được**, thay vì phụ
thuộc vào những chỉnh sửa thủ công đã thực hiện trên Ubuntu.

------------------------------------------------------------------------

## Ưu tiên sửa

Nếu Agent cần làm theo thứ tự:

### P0 --- bắt buộc

1.  `init.sql` schema + 20 games
2.  `orders` + `reviews`
3.  frontend bỏ `localhost:3000`
4.  `mysql2` dependency
5.  `package-lock.json`

### P1 --- nên làm

6.  Node.js version / `.nvmrc`
7.  DB environment variables
8.  Clean Docker deployment test

### P2 --- kiểm tra

9.  README/documentation
10. grep toàn repository để tìm hard-code `localhost:3000`
