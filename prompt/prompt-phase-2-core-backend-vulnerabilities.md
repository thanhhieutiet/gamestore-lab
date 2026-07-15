# Vai trò

Bạn là một Backend Developer. Đây là dự án Security Training Lab cục bộ, an toàn và được cấp phép. Bạn MẶC ĐỊNH phải tuân thủ việc viết code theo phong cách legacy, KHÔNG SỬ DỤNG các biện pháp bảo mật hiện đại.

---

## Yêu cầu 1: Khởi tạo & Cài đặt Packages

Trong thư mục `/backend`, hãy khởi tạo npm và cài đặt các package sau:

- express
- mysql2
- jsonwebtoken
- multer
- ejs
- libxmljs (bản cũ nếu được)
- winston
- morgan
- cors

---

## Yêu cầu 2: Cấu hình Logging JSON (Bắt buộc)

Tạo cấu hình Winston logger để ghi log mọi Request và Error ra file `/app/logs/app.log` dưới định dạng JSON.

Kết hợp Morgan với Winston để ghi log HTTP request. Format JSON phải có các trường:

- `timestamp`
- `method`
- `url`
- `status`
- `ip`

---

## Yêu cầu 3: Database Connection

Tạo file `db.js` kết nối với MySQL service. Mật khẩu và user dùng mặc định của image mysql (root/root hoặc cấu hình tùy ý, miễn là kết nối được).

---

## Yêu cầu 4: Viết các API Nghiệp vụ (TUÂN THỦ TUYỆT ĐỐI LOGIC DƯỚI ĐÂY)

Tạo `server.js` hoặc cấu trúc router cho các API sau:

### Authentication (JWT yếu)

**POST** `/api/login`

- Query DB tìm user.
- Ký JWT bằng một secret key CỐ ĐỊNH, DỄ ĐOÁN (ví dụ: `SecretKey123!`).

---

### Tìm kiếm (String Concatenation)

**GET** `/api/products/search`

- Nhận tham số `?q=`.
- Bắt buộc: Nối chuỗi trực tiếp vào câu query SQL:

```sql
SELECT * FROM products WHERE name LIKE '%" + req.query.q + "%'
```

- Không dùng Prepared Statements.

---

### Đánh giá Sản phẩm (No Sanitization)

**POST** `/api/products/:id/reviews`

- Nhận `content` từ body và INSERT thẳng vào bảng `reviews`.
- Không filter thẻ HTML hay script.

---

### Upload Avatar (Thiếu Validate)

**POST** `/api/users/avatar`

- Dùng `multer`.
- Bắt buộc:
  - Chỉ lưu file vào thư mục `public/uploads`.
  - TUYỆT ĐỐI KHÔNG kiểm tra định dạng file (extension) hay mime-type.
  - Cho phép upload mọi loại file.

---

### Đọc File (fs.readFileSync)

**GET** `/api/files`

- Nhận tham số `?path=`.
- Bắt buộc:
  - Dùng `fs.readFileSync(req.query.path)` để đọc file và trả về cho client.
  - Không dùng hàm `path.resolve` hay filter `../`.

---

### Export Hóa đơn (child_process.exec)

**POST** `/api/orders/export`

- Nhận `order_id` từ body.
- Bắt buộc: Dùng module `child_process.exec` để chạy lệnh hệ thống:

```javascript
exec("echo Exporting order " + req.body.order_id + " > /tmp/order.txt");
```

---

### Xem Đơn hàng (IDOR)

**GET** `/api/orders/:id`

- Trả về thông tin đơn hàng dựa trên ID trên URL.
- Bắt buộc:
  - Chỉ check xem user đã đăng nhập chưa.
  - TUYỆT ĐỐI KHÔNG check xem `user_id` của đơn hàng có khớp với `user_id` đang đăng nhập hay không.

---

### Admin Import XML (libxmljs)

**POST** `/admin/products/import`

- Nhận body là chuỗi XML.
- Bắt buộc:
  - Dùng:

```javascript
libxmljs.parseXmlString(xml, { noent: true });
```

- (bật tính năng parse external entity).
- Sau đó lưu vào DB.

---

### Thông báo hệ thống (EJS render)

**GET** `/api/notify`

- Nhận tham số `?template=`.
- Bắt buộc:
  - Dùng:

```javascript
ejs.render(req.query.template, {});
```

- để render thẳng input của user thành HTML.

---

## Chỉ dẫn thực thi

Tạo các file trực tiếp, code đầy đủ các chức năng trên vào `/backend/server.js` hoặc chia file tùy ý, miễn là chạy được ở port `3000`.
