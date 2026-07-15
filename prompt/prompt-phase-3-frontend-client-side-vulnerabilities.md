# Vai trò

Bạn là một Frontend Developer. Nhiệm vụ của bạn là xây dựng giao diện cho dự án E-commerce Lab. Đây là dự án Security Training, BẮT BUỘC phải code theo phong cách cũ ở phần logic, KHÔNG áp dụng các biện pháp bảo mật hiện đại hay sanitize dữ liệu phía client. Tuy nhiên, GIAO DIỆN PHẢI ĐẸP VÀ CHUYÊN NGHIỆP.

---

# Yêu cầu 1: Cấu trúc & Công nghệ & UI/UX

Tạo thư mục `/frontend` ngang hàng với `/backend` và `/nginx`.

Sử dụng HTML thuần và Vanilla Javascript.

**Bắt buộc về UI/UX:**

- Sử dụng Tailwind CSS qua CDN kết hợp với thư viện Flowbite (nhúng script và CSS qua CDN).
- Giao diện phải đẹp, trau chuốt, sao chép phong cách E-commerce hiện đại (như Shopify, Tiki).
- Sử dụng các component Card, Modal, Sidebar, Navbar chuẩn của Flowbite.

---

# Yêu cầu 2: Các trang (Pages) cần thiết

Hãy tạo các file HTML sau trong thư mục `/frontend`:

### `index.html`

Trang chủ.

Yêu cầu giao diện:

- Navbar hiện đại.
- Hero Section.
- Grid danh sách sản phẩm đẹp mắt.

---

### `login.html`

Trang đăng nhập.

Yêu cầu giao diện:

- Form layout hiện đại.
- Chia đôi màn hình:
  - Một bên ảnh minh họa.
  - Một bên form đăng nhập.

---

### `product.html`

Trang chi tiết sản phẩm.

Yêu cầu giao diện:

- Layout chia cột.
- Ảnh sản phẩm bên trái.
- Thông tin sản phẩm và form review bên phải.

---

### `admin.html`

Trang quản trị.

Yêu cầu giao diện:

- Sidebar bên trái.
- Table quản lý đơn hàng/sản phẩm chuyên nghiệp ở giữa.
- Phong cách Admin Dashboard hiện đại.

---

# Lưu ý quan trọng về CDN (Nhắc AI nếu nó quên)

Để các hiệu ứng động của Flowbite (như bấm vào Avatar hiện dropdown, bấm nút hiện Modal) hoạt động được bằng HTML thuần, file HTML của cậu bắt buộc phải có **2 đoạn CDN** sau.

---

## Trong thẻ `<head>`

```html
<script src="https://cdn.tailwindcss.com"></script>
<link
  href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css"
  rel="stylesheet"
/>
```

---

## Trước thẻ đóng `</body>`

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
```

## Yêu cầu 3: Tích hợp API và cài cắm lỗ hổng Client-side (TUÂN THỦ TUYỆT ĐỐI)

Viết các đoạn script JS trực tiếp vào cuối các file HTML (hoặc tạo file `app.js`) với các logic CỐ TÌNH LỖI sau:

### Đăng nhập & Open Redirect (`login.html`)

- Gọi API `POST /api/login`.
- Lấy JWT token và BẮT BUỘC lưu vào:

```javascript
localStorage.setItem("token", token);
```

(Tạo điều kiện cho XSS lấy cắp token).

- Lỗi Open Redirect:
  - Đọc tham số `?next=` từ URL.
  - Nếu đăng nhập thành công, BẮT BUỘC dùng:

```javascript
window.location.href = url_từ_tham_số_next;
```

mà không kiểm tra xem URL đó có hợp lệ hay không.

---

### DOM-based XSS & Reflected XSS (`index.html`)

- Đọc tham số `?q=` từ URL để gọi API:

```text
GET /api/products/search?q=....
```

- Bắt buộc:
  - Hiển thị lại từ khóa tìm kiếm lên màn hình bằng thuộc tính `innerHTML`.

Ví dụ:

```javascript
document.getElementById("search-result").innerHTML = "Kết quả cho: " + keyword;
```

- Tuyệt đối không dùng `innerText` hay `textContent`.

---

### Stored XSS (`product.html`)

- Gọi API lấy thông tin sản phẩm và các đánh giá (`reviews`).
- Bắt buộc:
  - Render danh sách các đánh giá (nội dung review) bằng `innerHTML` nối chuỗi trực tiếp.
  - Không sử dụng bất kỳ hàm `replace` hay escape HTML nào.

---

### Thiếu CSRF Token (`product.html` & `admin.html`)

Các form submit (Gửi review, Cập nhật thông tin, Import XML) BẮT BUỘC:

- Chỉ dùng thẻ `<form>` hoặc `fetch` đơn thuần.
- KHÔNG đính kèm bất kỳ header `X-CSRF-Token` hay cơ chế chống giả mạo request nào.

---

### Hiển thị File Lỗi (`admin.html`)

- Form upload avatar và form gọi API:

```text
/api/files?path=....
```

- Khi load ảnh avatar, gán trực tiếp URL lấy từ DB vào thẻ:

```html
<img src="..." />
```

---

## Chỉ dẫn thực thi

Gen đầy đủ code HTML/JS cho các trang này.

Giao tiếp với backend ở:

```text
http://localhost:3000/api
```

Đảm bảo code chạy được ngay khi dùng Live Server hoặc mount qua Nginx.o
