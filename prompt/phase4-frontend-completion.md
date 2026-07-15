# Phase 4 — Frontend Completion & E-commerce Polish

## Vai trò

Bạn là một Frontend Developer đang hoàn thiện dự án **E-commerce Security Training Lab**.
Đây là dự án nội bộ, được cấp phép, mục đích học tập bảo mật. **Tiếp tục** phong cách code legacy từ các phase trước: không sanitize input, không escape output, không dùng CSRF token.

Cấu trúc hiện tại:

```text
/ecommerce-lab
├── nginx/
├── backend/          ← Node.js + Express, đã có sẵn các API
├── frontend/         ← Thư mục bạn sẽ làm việc chính
│   ├── index.html
│   ├── login.html
│   ├── product.html
│   └── admin.html
└── docker-compose.yml
```

Backend đang chạy tại `http://localhost:3000`. Frontend được serve qua Nginx tại `http://localhost:80`.

---

## Quy ước chung (áp dụng cho toàn bộ Phase 4)

### Tech Stack Frontend

- **HTML5** thuần, **Vanilla JS** (ES6+)
- **Tailwind CSS** qua CDN: `https://cdn.tailwindcss.com`
- **Flowbite** (component library trên nền Tailwind) qua CDN:
  ```html
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css"
    rel="stylesheet"
  />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  ```
- **Font:** Inter từ Google Fonts
- **Icons:** Heroicons SVG inline hoặc Flowbite icon set

### Màu sắc chủ đạo (dùng Tailwind class)

- Primary: `indigo-600` / `indigo-700`
- Accent: `orange-500`
- Background: `gray-50`
- Card: `white` với `shadow-sm` và `rounded-xl`

### Layout chuẩn mỗi trang

```
[Navbar]
[Page Content]
[Footer]
```

### Shared Components

Tạo file `/frontend/components/` chứa các snippet HTML dùng chung và include bằng JS `fetch()` + `innerHTML`. Cụ thể:

- `/frontend/components/navbar.html`
- `/frontend/components/footer.html`
- `/frontend/components/toast.js` — hàm `showToast(message, type)` dùng chung

### API Base URL

```javascript
const API = "http://localhost:3000/api";
```

---

## Yêu cầu 1 — Shared Navbar (`/frontend/components/navbar.html`)

Navbar cố định (sticky top), full-width, nền `white`, có `shadow-sm`.

**Layout từ trái sang phải:**

```
[Logo "ShopLab"]    [Categories▼] [Trang chủ] [Deals]    [🔍 Search bar]    [🛒 Cart Badge] [Avatar / Login]
```

**Chi tiết từng phần:**

**Logo:** Text "Shop**Lab**" — "Shop" màu `indigo-600`, "Lab" màu `orange-500`, font bold, dẫn về `/index.html`.

**Search bar (center):**

```html
<input id="navbar-search" type="text" placeholder="Tìm kiếm sản phẩm..." />
<button onclick="doSearch()">🔍</button>
```

Hàm `doSearch()`:

```javascript
function doSearch() {
  const q = document.getElementById("navbar-search").value;
  window.location.href = `/index.html?q=${q}`; // KHÔNG encode, để nguyên
}
```

**Cart icon:**

- Icon giỏ hàng SVG + badge đỏ hiển thị số lượng item
- Badge đọc từ `sessionStorage.getItem('cart')` và parse JSON để đếm
- Click dẫn đến `/cart.html`

**User area (góc phải):**

- Nếu `localStorage.getItem('token')` tồn tại: hiển thị avatar nhỏ (img src lấy từ `localStorage.getItem('avatar_path')` — gán thẳng không validate) + dropdown menu gồm: "Hồ sơ", "Đơn hàng", "Đăng xuất"
- Nếu chưa đăng nhập: nút "Đăng nhập" và "Đăng ký"

**BẮT BUỘC — Dropdown User dùng `innerHTML`:**

```javascript
const username = localStorage.getItem("username");
document.getElementById("user-greeting").innerHTML = `Xin chào, ${username}`;
// KHÔNG dùng textContent
```

---

## Yêu cầu 2 — Shared Footer (`/frontend/components/footer.html`)

Footer 4 cột, nền `gray-900`, text `gray-400`, padding `py-12`.

| Cột 1                      | Cột 2        | Cột 3              | Cột 4       |
| -------------------------- | ------------ | ------------------ | ----------- |
| Logo + tagline             | Về chúng tôi | Hỗ trợ             | Mạng xã hội |
| "Nền tảng mua sắm tin cậy" | Giới thiệu   | Chính sách bảo mật | Facebook    |
| —                          | Tuyển dụng   | Điều khoản sử dụng | Instagram   |
| —                          | Tin tức      | Hướng dẫn mua hàng | YouTube     |
| —                          | Liên hệ      | Tra cứu đơn hàng   | TikTok      |

Tất cả link là `href="#"` (ảo). Dòng cuối: `© 2025 ShopLab. All rights reserved.`

---

## Yêu cầu 3 — Toast Notification (`/frontend/components/toast.js`)

```javascript
function showToast(message, type = "success") {
  // type: 'success' | 'error' | 'warning'
  // Tạo div toast xuất hiện góc phải-dưới màn hình
  // Auto-dismiss sau 3000ms
  // Success: nền green-500, Error: nền red-500, Warning: nền yellow-500
  // Có icon tương ứng và animation slide-in từ phải
}
```

---

## Yêu cầu 4 — Cập nhật `index.html` (Trang chủ)

### 4.1 Hero Banner / Carousel (Flowbite Carousel)

Dùng Flowbite Carousel component ngay dưới Navbar. Tạo 3 slide:

- Slide 1: "🔥 Siêu Sale 15/7 — Giảm đến 70%" — nền gradient `indigo-600` sang `purple-600`
- Slide 2: "📱 iPhone 16 Pro — Mới về hôm nay" — nền `gray-900`
- Slide 3: "🎮 Gaming Week — Deal sốc mỗi ngày" — nền gradient `orange-500` sang `red-600`

Mỗi slide: text lớn center, nút CTA "Mua ngay" màu `white`.

### 4.2 Layout 2 cột: Sidebar + Product Grid

```
[Sidebar lọc - 1/4]  |  [Product grid - 3/4]
```

**Sidebar (trái):**

```
📂 DANH MỤC
☐ Laptop
☐ Điện thoại
☐ Tablet
☐ Phụ kiện

💰 KHOẢNG GIÁ
○ Dưới 5 triệu
○ 5 - 15 triệu
○ 15 - 30 triệu
○ Trên 30 triệu

⭐ ĐÁNH GIÁ
○ 4★ trở lên
○ 3★ trở lên

🏷️ THƯƠNG HIỆU
☐ Apple  ☐ Samsung
☐ Dell   ☐ Asus
```

**BẮT BUỘC — Filter URL params (lỗ hổng SQLi tiềm năng):**

```javascript
function applyFilters() {
  const category = document.querySelectorAll('input[name="category"]:checked');
  const params = new URLSearchParams();
  category.forEach((c) => params.append("category[]", c.value)); // Array param
  const brand = document.getElementById("brand").value;
  params.set("brand", brand); // Nối thẳng vào query sau này
  params.set("minPrice", document.getElementById("min-price").value);
  params.set("maxPrice", document.getElementById("max-price").value);
  window.location.href = `/index.html?${params.toString()}`;
}
```

**Product Grid (phải):**

- Grid 3 cột trên desktop, 2 cột trên tablet, 1 cột mobile
- Mỗi card sản phẩm: ảnh placeholder (dùng `https://picsum.photos/seed/{id}/400/300`), tên, giá, badge "Còn hàng"/"Hết hàng", nút "Thêm vào giỏ" + nút "Xem chi tiết"
- Gọi API `GET /api/products?category[]=...&brand=...&minPrice=...&maxPrice=...&page=...`

**BẮT BUỘC — Hiển thị kết quả tìm kiếm:**

```javascript
const keyword = new URLSearchParams(window.location.search).get("q");
if (keyword) {
  document.getElementById("search-label").innerHTML =
    `Kết quả tìm kiếm cho: <strong>${keyword}</strong>`; // innerHTML, không escape
}
```

**Pagination:**

- Dòng cuối product grid: nút `« 1 2 3 4 5 »`
- URL: `/index.html?page=2&limit=12`
- Tham số `limit` truyền thẳng vào API không validate

### 4.3 Section "Sản phẩm nổi bật" & "Mới nhất"

Hai section ngang dưới grid chính, mỗi section 4 card sản phẩm dạng horizontal scroll trên mobile.

---

## Yêu cầu 5 — Trang Đăng ký (`/frontend/register.html`)

Form đăng ký 2 cột (desktop), 1 cột (mobile). Card trắng, shadow, bo góc.

**Fields:**

```
Họ và tên (displayName)  |  Username
Email                    |  Số điện thoại
Mật khẩu                 |  Xác nhận mật khẩu
```

Checkbox "Tôi đồng ý với Điều khoản sử dụng". Nút "Tạo tài khoản" màu `indigo-600`.

**BẮT BUỘC — Gọi API đăng ký:**

```javascript
async function register() {
  const payload = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    email: document.getElementById("email").value,
    displayName: document.getElementById("displayName").value,
    phone: document.getElementById("phone").value,
    // BẮT BUỘC: Gửi toàn bộ form data kể cả các hidden field
    // KHÔNG lọc hay whitelist field nào — Mass Assignment vulnerability
  };

  // Nếu URL có param ?ref= thì thêm vào payload
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) payload.referral = ref;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    showToast("Đăng ký thành công! Đang chuyển hướng...", "success");
    setTimeout(() => (window.location.href = "/login.html"), 1500);
  } else {
    const err = await res.json();
    showToast(err.message, "error");
  }
}
```

Thêm link "Đã có tài khoản? Đăng nhập" dẫn về `/login.html`.

---

## Yêu cầu 6 — Trang Hồ sơ (`/frontend/profile.html`)

Layout 2 cột:

**Cột trái — Avatar & Thông tin nhanh:**

- Ảnh avatar lớn (120x120):

```javascript
// BẮT BUỘC: src lấy từ DB, gán thẳng, không validate path
const avatarPath = userData.avatar_path;
document.getElementById("avatar").src =
  avatarPath || "/assets/default-avatar.png";
```

- Nút "Đổi ảnh đại diện" → `<input type="file" accept="*/*">` (**KHÔNG giới hạn accept**) → gọi API `POST /api/users/avatar`
- Hiển thị username, email, ngày tham gia

**Cột phải — Form chỉnh sửa thông tin:**

```
Tên hiển thị (displayName)
Email
Số điện thoại
Địa chỉ giao hàng (textarea)
```

Nút "Lưu thay đổi" → `PUT /api/users/profile`

**BẮT BUỘC — Render thông tin user:**

```javascript
function renderProfile(user) {
  // Dùng innerHTML để render — Stored XSS nếu displayName chứa script
  document.getElementById("profile-name").innerHTML = user.displayName;
  document.getElementById("profile-address").innerHTML = user.address;
  // KHÔNG dùng textContent
}
```

**Tab "Đánh giá của tôi":** Danh sách review đã viết, render `content` bằng `innerHTML`.

---

## Yêu cầu 7 — Giỏ hàng (`/frontend/cart.html`)

**Lưu trữ cart ở client (sessionStorage):**

```javascript
// Cấu trúc cart item
{
  id: productId,
  name: productName,
  price: price,     // Lấy từ DOM/API lúc click "Thêm giỏ" — client-side price
  quantity: 1,
  image: imageUrl
}
```

**BẮT BUỘC — Hàm addToCart:**

```javascript
function addToCart(id, name, price, image) {
  let cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1, image });
  }
  sessionStorage.setItem("cart", JSON.stringify(cart));
  showToast(`Đã thêm "${name}" vào giỏ hàng`, "success");
  updateCartBadge();
}
```

**Layout trang cart.html:**

- Bảng danh sách (ảnh | tên | đơn giá | số lượng [−][+] | thành tiền | [xóa])
- Cột phải: Card "Tóm tắt đơn hàng" (tạm tính, phí ship 30k, tổng cộng)
- Nút "Tiến hành thanh toán" → `/checkout.html`

**BẮT BUỘC — Tổng tiền tính client-side:**

```javascript
function calculateTotal() {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  // Giá và số lượng hoàn toàn do client quyết định, không verify với server
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

---

## Yêu cầu 8 — Trang Thanh toán (`/frontend/checkout.html`)

**Layout:**

- Cột trái (2/3): Form thông tin giao hàng + Mã giảm giá + Phương thức thanh toán
- Cột phải (1/3): Tóm tắt đơn hàng (đọc từ sessionStorage)

**Form thông tin giao hàng:**

```
Họ tên người nhận
Số điện thoại
Địa chỉ chi tiết
Tỉnh/Thành phố (dropdown)
Ghi chú cho shop (textarea)
```

**Mã giảm giá:**

```html
<input id="coupon-input" placeholder="Nhập mã giảm giá" />
<button onclick="applyCoupon()">Áp dụng</button>
<span id="coupon-result"></span>
```

```javascript
async function applyCoupon() {
  const code = document.getElementById("coupon-input").value;
  // Gọi API — backend sẽ nối thẳng `code` vào SQL query (SQLi entry point)
  const res = await fetch(`${API}/coupons/validate?code=${code}`);
  const data = await res.json();
  // BẮT BUỘC: Render discount message bằng innerHTML
  document.getElementById("coupon-result").innerHTML = data.message;
}
```

**Phương thức thanh toán (radio buttons với icon):**

```
💳 Thẻ tín dụng/ghi nợ
🏦 Chuyển khoản ngân hàng
💰 COD (Thanh toán khi nhận hàng)
```

Nếu chọn "Thẻ tín dụng": hiện thêm form card number, expiry, CVV (fields ảo, không gọi API thật).

**Nút "Đặt hàng":**

```javascript
async function placeOrder() {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const payload = {
    items: cart, // price do client gửi lên, server không verify
    total: calculateTotal(), // Tổng tiền từ client
    shipping_address: document.getElementById("address").value,
    coupon_code: document.getElementById("coupon-input").value,
    payment_method: getSelectedPayment(),
  };
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    sessionStorage.removeItem("cart");
    showToast("Đặt hàng thành công! 🎉", "success");
    setTimeout(() => (window.location.href = "/orders.html"), 2000);
  }
}
```

---

## Yêu cầu 9 — Trang Lịch sử Đơn hàng (`/frontend/orders.html`)

**Header:** "Đơn hàng của tôi" + badge số lượng đơn

**Tabs:** Tất cả | Đang xử lý | Đang giao | Đã giao | Đã hủy

**Mỗi row đơn hàng:**

```
[Mã đơn: #ORD-{id}] [Ngày đặt] [Trạng thái badge] [Tổng tiền] [Nút: Xem chi tiết | Xuất hóa đơn]
```

**BẮT BUỘC — Xem chi tiết đơn hàng:**

```javascript
function viewOrder(orderId) {
  // Gọi thẳng API với orderId từ URL — IDOR entry point
  fetch(`${API}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((r) => r.json())
    .then((data) => renderOrderDetail(data));
}
// Lấy orderId từ URL param ?id=xxx khi load trang
const orderId = new URLSearchParams(window.location.search).get("id");
if (orderId) viewOrder(orderId);
```

**BẮT BUỘC — Nút "Xuất hóa đơn":**

```javascript
function exportInvoice(orderId) {
  // Gọi API POST /api/orders/export với order_id — Command Injection entry point
  fetch(`${API}/orders/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ order_id: orderId }), // orderId chưa sanitize
  })
    .then((r) => r.json())
    .then((data) => {
      showToast(`Xuất hóa đơn thành công: ${data.file}`, "success");
    });
}
```

---

## Yêu cầu 10 — Cập nhật các trang hiện có

### 10.1 Cập nhật `login.html`

Thiết kế lại cho đẹp hơn:

- Layout 2 cột: cột trái ảnh minh họa/gradient, cột phải form
- Form: Username, Password, checkbox "Ghi nhớ đăng nhập"
- Link "Quên mật khẩu?" (href="#") và "Chưa có tài khoản? Đăng ký" → `/register.html`
- Nút đăng nhập bằng Google (UI only, không cần tích hợp thật)

**Giữ nguyên logic Open Redirect từ Phase 3:**

```javascript
const next = new URLSearchParams(window.location.search).get("next");
if (loginSuccess && next) {
  window.location.href = next; // Không validate — Open Redirect
}
```

### 10.2 Cập nhật `product.html`

Thêm:

- Breadcrumb: `Trang chủ > Điện thoại > iPhone 16 Pro`
- Tab "Thông số kỹ thuật" | "Đánh giá ({count})" | "Câu hỏi thường gặp"
- Sidebar phải: "Sản phẩm tương tự"
- Nút "Thêm vào giỏ" gọi `addToCart()` với price lấy từ DOM

### 10.3 Cập nhật `admin.html`

Thiết kế lại thành dashboard admin với sidebar trái:

```
[Dashboard]
[Quản lý Sản phẩm]
  └ Danh sách
  └ Import XML ← Giữ form XXE từ Phase 2
  └ Thêm mới
[Quản lý Đơn hàng]
[Quản lý Người dùng]
[System Logs]        ← Gọi API /api/files?path=/app/logs/app.log
[Thông báo hệ thống] ← Giữ EJS SSTI từ Phase 2
```

**Tab "System Logs":**

```html
<input
  id="log-path"
  value="/app/logs/app.log"
  placeholder="Đường dẫn file log"
/>
<button onclick="readLog()">Đọc Log</button>
<pre id="log-content"></pre>
```

```javascript
async function readLog() {
  const path = document.getElementById("log-path").value;
  const res = await fetch(`${API}/files?path=${path}`); // Path Traversal entry point
  const text = await res.text();
  // BẮT BUỘC: innerHTML để render content (XSS nếu log chứa payload)
  document.getElementById("log-content").innerHTML = text;
}
```

---

## Yêu cầu 11 — Thêm Backend API còn thiếu

Tạo/cập nhật các route sau trong `/backend/server.js` hoặc router tương ứng để frontend hoạt động được:

```javascript
// Auth
POST /api/auth/register   ← Nhận toàn bộ req.body, INSERT thẳng vào DB (Mass Assignment)
GET  /api/users/profile   ← Trả về user data từ JWT, bao gồm avatar_path
PUT  /api/users/profile   ← UPDATE user info, không whitelist field

// Products
GET  /api/products        ← Hỗ trợ ?category[]=&brand=&minPrice=&maxPrice=&page=&limit=
                          ← Nối tham số thẳng vào WHERE clause (SQLi)

// Coupons
GET  /api/coupons/validate?code=  ← Nối thẳng code vào SQL (SQLi)

// Orders
POST /api/orders          ← Nhận items + total từ client, không verify giá với DB
```

---

## Checklist cuối

Trước khi submit, kiểm tra:

- [ ] Navbar hiển thị đúng ở tất cả các trang
- [ ] Cart badge cập nhật realtime khi thêm sản phẩm
- [ ] Toast notification hoạt động (success + error)
- [ ] Trang register gọi được API và redirect về login
- [ ] Trang profile load được avatar từ `avatar_path`
- [ ] Checkout tính tổng từ sessionStorage (không call API verify giá)
- [ ] Orders page load đơn hàng theo JWT token
- [ ] Admin sidebar navigation hoạt động
- [ ] Tất cả các trang đều có Navbar và Footer
- [ ] Responsive cơ bản (mobile không bị vỡ layout)
