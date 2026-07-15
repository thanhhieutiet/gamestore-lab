# UI/UX Skill — ShopLab E-Commerce Lab

> Đọc file này **trước khi viết bất kỳ dòng HTML/CSS nào**. Đây là source of truth duy nhất cho mọi quyết định giao diện trong dự án.

---

## 1. Tổng quan kiến trúc Frontend

### Cấu trúc thư mục bắt buộc

```
/frontend
├── assets/
│   ├── css/
│   │   └── shoplab.css        ← Design tokens & shared styles
│   └── js/
│       ├── api.js             ← Fetch wrappers (có lỗ hổng cố ý)
│       ├── auth.js            ← Token management từ localStorage
│       ├── cart.js            ← Cart logic dùng sessionStorage
│       └── toast.js           ← showToast() global function
├── components/
│   ├── navbar.html            ← Dùng fetch() + innerHTML để include
│   └── footer.html
├── index.html
├── login.html
├── register.html
├── product.html
├── cart.html
├── checkout.html
├── orders.html
├── profile.html
└── admin.html
```

### Cách include shared component

```javascript
// Ở đầu mỗi trang, trong DOMContentLoaded
async function includeComponent(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  const html = await fetch(path).then((r) => r.text());
  el.innerHTML = html; // innerHTML — cố ý không sanitize
}
await includeComponent("#navbar-placeholder", "/components/navbar.html");
await includeComponent("#footer-placeholder", "/components/footer.html");
```

Mỗi page cần có 2 div placeholder:

```html
<div id="navbar-placeholder"></div>
<!-- ... page content ... -->
<div id="footer-placeholder"></div>
```

---

## 2. Design Tokens (CSS Variables)

**Bắt buộc** đặt trong `/assets/css/shoplab.css` và link vào mọi trang:

```css
:root {
  /* Brand colors */
  --brand: #4f46e5; /* Indigo-600 — primary actions, links */
  --brand-dark: #4338ca; /* Hover state */
  --brand-lt: #eef2ff; /* Light tint — badges, backgrounds */
  --accent: #f97316; /* Orange — sale badges, highlights */
  --accent-lt: #fff7ed;

  /* Surfaces */
  --surface-0: #f8f9fc; /* Page background */
  --surface-1: #ffffff; /* Cards, panels */

  /* Borders */
  --border: #e5e7eb; /* Default hairline */
  --border-md: #d1d5db; /* Emphasized */

  /* Text hierarchy */
  --text-1: #111827; /* Headings, primary */
  --text-2: #374151; /* Body */
  --text-3: #6b7280; /* Secondary, captions */
  --text-4: #9ca3af; /* Muted, placeholders */

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Semantic */
  --success: #10b981;
  --success-lt: #d1fae5;
  --danger: #ef4444;
  --danger-lt: #fee2e2;
  --warning: #f59e0b;
  --warning-lt: #fef3c7;
}
```

**KHÔNG bao giờ** hardcode màu hex trong HTML inline style hay Tailwind class mà không có trong bảng trên.

---

## 3. Typography Rules

### Font

```html
<!-- Thêm vào <head> của mọi trang -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

```css
body {
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### Type Scale

| Element            | Size    | Weight  | Color      |
| ------------------ | ------- | ------- | ---------- |
| Page title (h1)    | 28–40px | 800     | `--text-1` |
| Section title (h2) | 22px    | 700     | `--text-1` |
| Card title         | 15px    | 600     | `--text-1` |
| Body text          | 14px    | 400     | `--text-2` |
| Caption / meta     | 12–13px | 400–500 | `--text-3` |
| Label (uppercase)  | 11px    | 700     | `--text-4` |

### Quy tắc letter-spacing

- Heading lớn (>20px): `letter-spacing: -0.3px` đến `-0.5px`
- Uppercase label: `letter-spacing: .07em`
- Body text: không cần set (default)

---

## 4. Component Patterns

### 4.1 Navbar

**Chiều cao:** 60px cố định. Sticky top, `z-index: 50`.

**Layout (trái → phải):**

```
[Logo 28px icon + "ShopLab"] [Nav links] [Search bar flex-1 max-w-440] [Cart icon] [Avatar]
```

**Logo markup:**

```html
<a href="index.html" class="logo">
  <div
    style="width:28px;height:28px;border-radius:8px;background:var(--brand);display:flex;align-items:center;justify-content:center;"
  >
    <!-- lightning bolt SVG, color: white -->
  </div>
  <span style="font-size:18px;font-weight:700;color:var(--text-1);"
    >Shop<span style="color:var(--accent);">Lab</span></span
  >
</a>
```

**Search bar pattern:**

```html
<div
  class="nav-search"
  style="flex:1;max-width:440px;display:flex;align-items:center;background:var(--surface-0);border:1px solid var(--border);border-radius:10px;padding:0 14px;height:38px;gap:10px;"
>
  <!-- search icon SVG, color: var(--text-4) -->
  <input
    type="text"
    name="q"
    placeholder="Tìm kiếm sản phẩm..."
    style="border:none;background:transparent;outline:none;font-size:14px;width:100%;font-family:inherit;"
  />
</div>
```

**Cart badge:**

```html
<button
  style="position:relative;width:36px;height:36px;border-radius:8px;border:none;background:transparent;cursor:pointer;"
>
  <!-- cart icon SVG -->
  <span
    id="cart-count"
    style="position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:var(--accent);color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid white;"
    >3</span
  >
</button>
```

**User avatar (logged in):**

```html
<!-- Avatar chữ cái đầu, KHÔNG validate avatar_path khi render -->
<div
  style="width:32px;height:32px;border-radius:50%;background:var(--brand-lt);color:var(--brand);font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;cursor:pointer;"
>
  H
</div>
```

**Auth state check trong navbar.js:**

```javascript
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
if (token && username) {
  // Render username bằng innerHTML — XSS entry point cố ý
  document.getElementById("user-greeting").innerHTML = `Xin chào, ${username}`;
}
```

---

### 4.2 Hero Banner

```html
<div
  style="background:linear-gradient(135deg,#312e81 0%,#4338ca 50%,#6d28d9 100%);padding:56px 40px;border-radius:var(--radius-lg);position:relative;overflow:hidden;"
>
  <!-- Optional: decorative circle overlay với rgba(255,255,255,.05) -->
  <div
    style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);color:white;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:16px;"
  >
    🔥 Siêu Sale 15/7
  </div>
  <h1
    style="font-size:40px;font-weight:800;color:white;line-height:1.15;letter-spacing:-0.5px;margin-bottom:12px;max-width:480px;"
  >
    Deals sốc mỗi ngày.<br />Giảm đến 70%.
  </h1>
  <p style="font-size:16px;color:rgba(255,255,255,.7);margin-bottom:28px;">
    iPhone, Laptop, Tablet và hơn 500 sản phẩm công nghệ khác.
  </p>
  <a
    href="#"
    style="display:inline-flex;align-items:center;gap:8px;background:white;color:#312e81;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;"
  >
    Khám phá ngay →
  </a>
</div>
```

**Variants cho 3 slides:**

- Slide 1: `gradient(135deg, #312e81, #4338ca, #6d28d9)` — Siêu Sale
- Slide 2: `gradient(135deg, #0f172a, #1e293b)` — Sản phẩm mới
- Slide 3: `gradient(135deg, #7c2d12, #c2410c, #ea580c)` — Gaming Week

---

### 4.3 Product Card

```html
<div
  class="product-card"
  style="background:var(--surface-1);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s;"
>
  <!-- Image area -->
  <div
    style="background:var(--surface-0);aspect-ratio:4/3;overflow:hidden;position:relative;"
  >
    <img
      src="..."
      alt="..."
      style="width:100%;height:100%;object-fit:cover;transition:transform .3s;"
    />
    <!-- Sale badge — chỉ render khi có sale -->
    <span
      style="position:absolute;top:10px;left:10px;background:var(--accent);color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;"
      >-15%</span
    >
  </div>
  <!-- Body -->
  <div style="padding:16px;flex:1;display:flex;flex-direction:column;">
    <div
      style="font-size:11px;font-weight:600;color:var(--brand);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;"
    >
      Apple
    </div>
    <h3
      style="font-size:15px;font-weight:600;color:var(--text-1);line-height:1.4;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
    >
      iPhone 16 Pro Max 256GB
    </h3>
    <p
      style="font-size:13px;color:var(--text-3);line-height:1.5;flex:1;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
    >
      Chip A18 Pro, màn hình Super Retina XDR 6.9"
    </p>
    <!-- Footer -->
    <div
      style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);"
    >
      <div>
        <span style="font-size:18px;font-weight:700;color:var(--text-1);"
          >$999</span
        >
        <span
          style="font-size:13px;color:var(--text-4);text-decoration:line-through;margin-left:6px;"
          >$1,199</span
        >
      </div>
      <button
        onclick="addToCart(...)"
        style="width:34px;height:34px;border-radius:8px;background:var(--brand-lt);color:var(--brand);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;"
      >
        <!-- plus icon -->
      </button>
    </div>
  </div>
</div>
```

**Hover effect (CSS):**

```css
.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.09);
  transform: translateY(-2px);
}
.product-card:hover img {
  transform: scale(1.04);
}
```

**Grid layout:**

```html
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
  <!-- cards -->
</div>
```

---

### 4.4 Filter Sidebar

**Width:** 220px cố định, `flex-shrink: 0`.

```html
<aside style="width:220px;flex-shrink:0;">
  <div style="margin-bottom:24px;">
    <div
      style="font-size:12px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;"
    >
      Danh mục
    </div>
    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;">
      <input
        type="checkbox"
        id="cat-phone"
        style="accent-color:var(--brand);width:15px;height:15px;cursor:pointer;"
        checked
      />
      <label
        for="cat-phone"
        style="font-size:14px;color:var(--text-2);cursor:pointer;display:flex;justify-content:space-between;width:100%;"
      >
        Điện thoại <span style="font-size:12px;color:var(--text-4);">24</span>
      </label>
    </div>
    <!-- Repeat for each filter item -->
  </div>
  <hr style="border:none;border-top:1px solid var(--border);margin:20px 0;" />
  <!-- More filter groups -->
</aside>
```

---

### 4.5 Status Badges

```html
<!-- Trong stock / trạng thái đơn hàng -->
<span
  style="display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:3px 8px;border-radius:6px;background:#d1fae5;color:#065f46;"
  >Hoàn thành</span
>

<span style="...;background:#fef3c7;color:#92400e;">Đang xử lý</span>
<span style="...;background:#dbeafe;color:#1e40af;">Đang giao</span>
<span style="...;background:#fee2e2;color:#991b1b;">Đã hủy</span>
<span style="...;background:#ede9fe;color:#5b21b6;">Chờ xác nhận</span>
```

---

### 4.6 Toast Notifications

**File:** `/assets/js/toast.js`

```javascript
function showToast(message, subtitle = "", type = "success") {
  const existing = document.querySelector(".sl-toast");
  if (existing) existing.remove();

  const icons = {
    success: { bg: "#d1fae5", color: "#065f46", svg: "..." /* checkmark */ },
    error: { bg: "#fee2e2", color: "#991b1b", svg: "..." /* x mark */ },
    warning: { bg: "#fef3c7", color: "#92400e", svg: "..." /* warning */ },
  };
  const icon = icons[type] || icons.success;

  const toast = document.createElement("div");
  toast.className = "sl-toast";
  toast.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:9999;
        background:#fff;border:1px solid #e5e7eb;border-radius:12px;
        padding:14px 18px;display:flex;align-items:center;gap:12px;
        box-shadow:0 8px 24px rgba(0,0,0,.1);
        font-size:14px;font-family:Inter,sans-serif;
        min-width:280px;max-width:360px;
        animation:toastIn .25s ease;
    `;
  toast.innerHTML = `
        <style>@keyframes toastIn{from{transform:translateY(20px);opacity:0}}</style>
        <div style="width:32px;height:32px;border-radius:8px;background:${icon.bg};color:${icon.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon.svg}</div>
        <div>
            <div style="font-weight:600;color:#111827;">${message}</div>
            ${subtitle ? `<div style="font-size:13px;color:#6b7280;margin-top:2px;">${subtitle}</div>` : ""}
        </div>
    `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

**Usage:**

```javascript
showToast("Thêm vào giỏ thành công", "iPhone 16 Pro Max × 1", "success");
showToast("Sai mật khẩu", "Kiểm tra lại thông tin đăng nhập.", "error");
showToast("Mã giảm giá không hợp lệ", "", "warning");
```

---

### 4.7 Data Table (Admin)

```html
<div
  style="background:var(--surface-1);border:1px solid var(--border);border-radius:10px;overflow:hidden;"
>
  <div
    style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;"
  >
    <div style="font-size:14px;font-weight:700;color:var(--text-1);">
      Đơn hàng gần đây
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr>
        <th
          style="text-align:left;padding:10px 16px;font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;background:var(--surface-0);border-bottom:1px solid var(--border);"
        >
          Mã đơn
        </th>
        <!-- more th -->
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:13px 16px;color:var(--text-2);">
          <span
            style="font-family:monospace;color:var(--brand);font-weight:600;"
            >#ORD-001</span
          >
        </td>
        <!-- more td -->
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4.8 Form Inputs

**Pattern chuẩn:**

```html
<div style="margin-bottom:16px;">
  <label
    style="display:block;font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:6px;"
    >Tên đăng nhập</label
  >
  <input
    type="text"
    placeholder="e.g. admin"
    style="width:100%;height:40px;padding:0 14px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:inherit;background:var(--surface-0);color:var(--text-1);outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s;"
    onfocus="this.style.borderColor='var(--brand)';this.style.boxShadow='0 0 0 3px rgba(79,70,229,.12)'"
    onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'"
  />
</div>
```

**Textarea:**

```html
<textarea
  rows="4"
  placeholder="Nhập nội dung..."
  style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:inherit;background:var(--surface-0);color:var(--text-1);outline:none;resize:vertical;box-sizing:border-box;"
  onfocus="this.style.borderColor='var(--brand)';this.style.boxShadow='0 0 0 3px rgba(79,70,229,.12)'"
  onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'"
></textarea>
```

---

### 4.9 Buttons

```html
<!-- Primary -->
<button
  style="display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:500;border-radius:8px;cursor:pointer;padding:0 16px;height:36px;border:none;background:var(--brand);color:white;font-family:inherit;transition:background .15s;"
  onmouseover="this.style.background='var(--brand-dark)'"
  onmouseout="this.style.background='var(--brand)'"
>
  Đăng nhập
</button>

<!-- Outline -->
<button
  style="...;background:var(--surface-1);color:var(--text-1);border:1px solid var(--border-md);"
  onmouseover="this.style.background='var(--surface-0)'"
  onmouseout="this.style.background='var(--surface-1)'"
>
  Xem chi tiết
</button>

<!-- Ghost -->
<button
  style="...;background:transparent;color:var(--text-2);border:none;"
  onmouseover="this.style.background='var(--surface-0)'"
  onmouseout="this.style.background='transparent'"
>
  Hủy
</button>
```

---

### 4.10 Admin Sidebar

Sidebar rộng 240px. Label section in hoa, font 11px. Nav item có hover và active state.

```html
<aside
  style="width:240px;background:var(--surface-1);border-right:1px solid var(--border);flex-shrink:0;padding:16px 0;"
>
  <!-- Section header -->
  <div
    style="font-size:11px;font-weight:700;color:var(--text-4);text-transform:uppercase;letter-spacing:.07em;padding:16px 24px 6px;"
  >
    Quản lý
  </div>

  <!-- Nav item (active) -->
  <a
    href="#"
    style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-radius:8px;margin:2px 8px;font-size:14px;font-weight:500;color:var(--brand);background:var(--brand-lt);text-decoration:none;"
  >
    <!-- icon SVG 16px -->
    Dashboard
  </a>

  <!-- Nav item (default) -->
  <a
    href="#"
    style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-radius:8px;margin:2px 8px;font-size:14px;font-weight:500;color:var(--text-2);text-decoration:none;transition:background .12s,color .12s;"
    onmouseover="this.style.background='var(--surface-0)';this.style.color='var(--text-1)'"
    onmouseout="this.style.background='transparent';this.style.color='var(--text-2)'"
  >
    <!-- icon SVG 16px -->
    Sản phẩm
  </a>
</aside>
```

**Tên các mục Admin sidebar (realistic, không để lộ vuln):**

| Nhóm      | Tên hiển thị              | Thực tế là                 |
| --------- | ------------------------- | -------------------------- |
| Tổng quan | Dashboard                 | Database viewer            |
| Quản lý   | Sản phẩm                  | —                          |
| Quản lý   | Đơn hàng                  | —                          |
| Quản lý   | Người dùng                | —                          |
| Công cụ   | **Upload ảnh đại diện**   | File upload (unrestricted) |
| Công cụ   | **Đọc file hệ thống**     | LFI endpoint               |
| Công cụ   | **Xuất hóa đơn**          | Command injection          |
| Công cụ   | **Import sản phẩm (XML)** | XXE                        |
| Công cụ   | **Thông báo hệ thống**    | SSTI                       |

---

### 4.11 Login Page Layout

```html
<div
  style="background:var(--surface-1);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;display:flex;max-width:840px;width:100%;"
>
  <!-- Left: dark branding panel (340px) -->
  <div
    style="width:340px;flex-shrink:0;background:linear-gradient(160deg,#1e1b4b 0%,#312e81 100%);padding:40px;display:flex;flex-direction:column;justify-content:space-between;"
  >
    <!-- Logo, headline, testimonial -->
  </div>
  <!-- Right: form (flex:1) -->
  <div style="flex:1;padding:40px;">
    <!-- Form fields -->
  </div>
</div>
```

---

### 4.12 Section Labels Pattern

Mọi section có nội dung cần có section header nhất quán:

```html
<div style="margin-bottom:20px;">
  <div
    style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-4);margin-bottom:8px;"
  >
    Danh mục
  </div>
  <h2
    style="font-size:22px;font-weight:700;color:var(--text-1);letter-spacing:-0.3px;"
  >
    Điện thoại nổi bật
  </h2>
</div>
```

---

### 4.13 Footer

```html
<footer style="background:#0f0f11;padding:56px 0 24px;">
  <div style="max-width:1280px;margin:0 auto;padding:0 24px;">
    <div
      style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;"
    >
      <!-- Col 1: Logo + tagline -->
      <!-- Col 2: Công ty -->
      <!-- Col 3: Hỗ trợ -->
      <!-- Col 4: Mạng xã hội -->
    </div>
    <div
      style="border-top:1px solid #1f2937;padding-top:24px;display:flex;align-items:center;justify-content:space-between;"
    >
      <p style="font-size:13px;color:#4b5563;">
        © 2025 ShopLab. All rights reserved.
      </p>
      <span
        style="font-size:12px;background:#1f2937;color:#6b7280;padding:4px 10px;border-radius:6px;"
        >Security Training Lab</span
      >
    </div>
  </div>
</footer>
```

**Footer link style:** `color:#6b7280`, hover `color:#d1d5db`, `text-decoration:none`

---

## 5. Page-level Layout Template

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ShopLab — [Page Name]</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link href="/assets/css/shoplab.css" rel="stylesheet" />
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: { sans: ["Inter", "sans-serif"] },
            /* Thêm color extends nếu cần dùng Tailwind class */
          },
        },
      };
    </script>
  </head>
  <body
    style="font-family:'Inter',sans-serif;background:#f8f9fc;color:#111827;-webkit-font-smoothing:antialiased;"
  >
    <!-- Navbar placeholder -->
    <div id="navbar-placeholder"></div>

    <!-- Page content wrapper -->
    <main
      style="max-width:1280px;margin:0 auto;padding:32px 24px;min-height:calc(100vh - 60px - 280px);"
    >
      <!-- Content here -->
    </main>

    <!-- Footer placeholder -->
    <div id="footer-placeholder"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
    <script src="/assets/js/toast.js"></script>
    <script src="/assets/js/auth.js"></script>
    <script src="/assets/js/cart.js"></script>
    <script>
      const API = "http://localhost:3000/api";

      document.addEventListener("DOMContentLoaded", async () => {
        await includeComponent(
          "#navbar-placeholder",
          "/components/navbar.html",
        );
        await includeComponent(
          "#footer-placeholder",
          "/components/footer.html",
        );
        // Page-specific init below
      });

      async function includeComponent(selector, path) {
        const el = document.querySelector(selector);
        if (!el) return;
        const html = await fetch(path).then((r) => r.text());
        el.innerHTML = html;
      }
    </script>
  </body>
</html>
```

---

## 6. Những điều KHÔNG làm

| ❌ Sai                                                       | ✅ Đúng                                                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Màu hex tùy tiện (`#1e293b`, `#0f766e`)                      | Dùng token CSS var                                                                        |
| Tailwind class lẫn lộn (`slate-*` và `gray-*`)               | Chọn một, dùng xuyên suốt                                                                 |
| `font-size: 10px` hay nhỏ hơn                                | Tối thiểu 11px                                                                            |
| Shadow quá nhiều (`shadow-xl` khắp nơi)                      | Shadow chỉ cho card (`0 1px 3px`) và hover (`0 8px 24px`)                                 |
| Border-radius không nhất quán (4px, 8px, 12px, 20px lẫn lộn) | Chỉ dùng 6px (badge), 8px (input/btn), 10px (table card), 12px (card), 16px (modal/login) |
| Label rõ vuln: "LFI", "RCE", "XXE"                           | Dùng tên chức năng business: "Đọc file hệ thống", "Xuất hóa đơn"                          |
| Title case "Log In", "Sign Up"                               | Sentence case "Đăng nhập", "Đăng ký"                                                      |
| Inline script lớn trong HTML                                 | Tách ra `/assets/js/*.js`                                                                 |
| `background-color: white` (hardcode)                         | `background: var(--surface-1)`                                                            |
| Emoji trong UI system text                                   | Icon SVG hoặc không có                                                                    |

---

## 7. Checklist trước khi submit mỗi page

- [ ] Import Inter font từ Google Fonts
- [ ] Link `/assets/css/shoplab.css`
- [ ] Có `#navbar-placeholder` và `#footer-placeholder`
- [ ] Logo đúng: icon + "Shop**Lab**" (Lab màu accent orange)
- [ ] Tên trang trong `<title>` format: "ShopLab — [Tên trang]"
- [ ] Không có text nhỏ hơn 11px
- [ ] Mọi màu dùng CSS variable hoặc hex có trong bảng token
- [ ] Không có label lộ tên lỗ hổng (LFI, RCE, XSS, SQLi...)
- [ ] Toast notification dùng `showToast()` từ toast.js
- [ ] Cart badge cập nhật từ `sessionStorage` qua `updateCartBadge()`
- [ ] Responsive tối thiểu: không vỡ layout ở 768px
