# Kết quả nâng cấp - Luồng đặt hàng chuẩn Game Store & Tối ưu bảo mật Lab

Tôi đã nâng cấp thành công luồng đặt hàng trên Game Store từ giao hàng vật lý sang phân phối số hóa (Digital Steam/Epic Games Store Flow) cùng với các cải tiến UI/UX đặc sắc, đồng thời điều chỉnh hiển thị các gợi ý lỗ hổng theo mô hình Blackbox đối với User thường, tối ưu luồng điều hướng trang cá nhân và cố định thanh điều hướng khi cuộn trang.

---

## Các thay đổi đã thực hiện

### 1. Nâng cấp Database Schema (`seed.js` & `init.sql`)
- Bổ sung trường `items_json` (TEXT) để lưu trữ trực tiếp cấu trúc danh sách game đã mua trong một đơn hàng.
- Cập nhật dữ liệu mẫu đơn hàng có sẵn ở định dạng JSON để đồng bộ tương thích.

### 2. Nâng cấp API Backend (`backend/server.js`)
- **`POST /api/orders`**: Nhận danh sách game và chuỗi hóa JSON lưu trữ vào `items_json`. Đơn hàng sau khi đặt thành công sẽ chuyển trạng thái `status = 'completed'` để kích hoạt game tức thì. Đồng thời ghi nhận thêm thông tin `isGift` và `giftEmail` nếu người dùng chọn mua tặng bạn.
- **`GET /api/orders` & `GET /api/orders/:id`**: Tự động giải mã chuỗi `items_json` ngược lại thành mảng đối tượng `items` để phục vụ hiển thị ở frontend. Trả về chính xác thông tin quà tặng.

### 3. Nâng cấp Giao diện Thanh toán (`frontend/checkout.html`)
- Loại bỏ hoàn toàn chi phí vận chuyển vật lý ($30.00) và các trường thông tin giao nhận vật lý (địa chỉ, tỉnh thành).
- Bổ sung các tùy chọn giao dịch số: **Mua cho bản thân** (kích hoạt trực tiếp vào tài khoản đang đăng nhập và điều hướng về thư viện game độc lập `library.html`) và **Mua làm quà tặng** (nhập email nhận quà).
- Cập nhật phương thức thanh toán số: Ví MoMo / ZaloPay, Ví GameLab Wallet, Thẻ tín dụng Quốc tế.

### 4. Trang Thư viện Game chuyên biệt (`frontend/library.html`)
- Tạo mới một trang thư viện game độc lập thay vì tích hợp tab nhỏ trong Hồ sơ.
- Thiết kế giao diện chia cột (Split UI) chuẩn Steam/Epic:
  - Cột trái: Danh sách các game đã sở hữu, tích hợp thanh tìm kiếm game nội bộ.
  - Cột phải: Hình ảnh Banner game, thông tin nhà phát triển, thống kê số giờ chơi, thành tựu hoàn thành và nút **"CHƠI NGAY"** kích hoạt ứng dụng có hiệu ứng phát sáng đặc sắc.
- Bổ sung liên kết điều hướng trực tiếp **"Thư viện"** trên thanh Menu Navbar chính bên cạnh Trang chủ và Deals.

### 5. Xử lý logic giỏ hàng & thanh toán thực tế
- **Số lượng (Quantity = 1)**: Loại bỏ các phím chọn tăng/giảm số lượng trong trang chi tiết và giỏ hàng. Một tài khoản chỉ sở hữu 1 bản quyền game.
- **Mua lại trùng lặp**: Nếu game đã có trong giỏ hàng, thông báo cảnh báo và không cộng dồn. Nếu tài khoản đã sở hữu game (đã thanh toán thành công trước đó), nút mua ở trang chi tiết sẽ tự động chuyển màu xanh lá và ghi **"Đã sở hữu (Vào thư viện)"**.
- **Chọn game cần mua (Checkboxes)**: Tích hợp các ô Checkbox cho từng game trong giỏ hàng. Người dùng có thể chọn mua một vài game trong giỏ, tổng tiền thanh toán sẽ tự động cập nhật và giữ nguyên các game chưa mua trong giỏ.

### 6. Khuyến mãi & Giảm giá (Deals)
- Xây dựng trang `deals.html` hiển thị danh sách game giảm giá từ 10% đến 50%.
- Tích hợp thẻ giảm giá màu đỏ `-X%` và giá gốc gạch ngang (strikethrough) song song với giá bán hiện tại trên toàn bộ hệ thống (Trang chủ, Deals, Chi tiết sản phẩm).

### 7. Chế độ Blackbox - Ẩn cảnh báo lỗ hổng đối với User thường
- Các khối thông tin chuẩn đoán lỗ hổng (`Security Lab Info`) và các công cụ thực nghiệm chèn payload nhà phát triển (`Developer Payload Tools`) trên trang Lịch sử mua hàng (`orders.html`) và Hồ sơ cá nhân (`profile.html`) hiện tại đã được **ẩn hoàn toàn theo mặc định**.
- Chỉ khi tài khoản đăng nhập có quyền Quản trị viên (`role_id === 1`), các gợi ý và công cụ này mới tự động hiển thị ra để phục vụ việc giảng dạy/đánh giá bảo mật.
- Logic lỗ hổng bên dưới vẫn giữ nguyên và hoạt động 100% bình thường, đảm bảo tính chất thử nghiệm của bài Lab.

### 8. Tạo cẩm nang bảo mật `README-OWASP.md`
- Viết tệp tài liệu hướng dẫn bảo mật toàn diện [README-OWASP.md](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/README-OWASP.md) nằm ở thư mục gốc của dự án.
- Tài liệu bao gồm tên lỗ hổng, vị trí xuất hiện trên frontend/backend API, cách thức khai thác (payload mẫu) và kết quả mong muốn thu được khi thực hiện bài Lab.

### 9. Cải tiến trải nghiệm người dùng & Điều hướng luồng (Sticky & Breadcrumbs)
- **Sticky Navbar toàn cục**: Định cấu hình thuộc tính `#navbar-placeholder` thành `position: sticky; top: 0; z-index: 50;` trong tệp [shoplab.css](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/assets/css/shoplab.css). Giúp giữ cố định thanh điều hướng (bao gồm Tìm kiếm, Giỏ hàng, Thư viện, Hồ sơ...) ở phía trên cùng của viewport khi cuộn trang, giúp người dùng thao tác mọi lúc mọi nơi trên toàn bộ hệ thống.
- **Thanh Breadcrumbs**: Tích hợp thanh Breadcrumbs điều hướng chuẩn chỉ dạng `Trang chủ > Hồ sơ cá nhân` và `Trang chủ > Lịch sử mua game` ở đầu trang [profile.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/profile.html) và [orders.html](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/frontend/orders.html) giúp kết nối các trang tốt hơn và cung cấp nút Quay lại nhanh cực kỳ trực quan.

### 10. Tạo tài liệu hướng dẫn thu thập log `README-LOGS.md`
- Viết tệp tài liệu hướng dẫn log toàn diện [README-LOGS.md](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/README-LOGS.md) mô tả chi tiết vị trí mount tệp log, định dạng JSON của Nginx access logs và Backend Morgan/Winston logs kèm mẫu cấu hình Filebeat để bạn dễ dàng cài đặt log agent.

### 11. Sửa lỗi Modal X, thay đổi Emoji sang SVG và ẩn tên lỗ hổng OS Command Injection [CẢI TIẾN MỚI]
- **Sửa nút đóng "X" modal**: Sửa lỗi nút đóng modal chi tiết đơn hàng không hoạt động bằng cách gọi lập trình trực tiếp phương thức `closeDetailModal()` gọi tới `.hide()` trên đối tượng Flowbite Modal instanced.
- **Chuẩn hóa Icon SVG**: Thay thế hoàn toàn các ký tự emoji thô (`🎁`, `💻`) bằng các icon SVG chất lượng cao (Gift icon cho Quà tặng và User icon cho Cá nhân) trên bảng đơn hàng và modal chi tiết đơn hàng.
- **Ẩn thông tin lộ lỗ hổng OS Command**: Điều chỉnh tiêu đề bảng kết quả xuất hóa đơn dựa trên vai trò người dùng. Nếu là Admin, tiêu đề hiển thị `KẾT QUẢ XUẤT HÓA ĐƠN (OS Command Output)` để tiện debug; nếu là User thường, tiêu đề chuyển thành `THÔNG BÁO XUẤT HÓA ĐƠN` và hiển thị thông tin chúc mừng dạng thông báo thông thường để tránh lộ thông tin lỗ hổng.

---

## Xác nhận kiểm thử (Verification)
Tôi đã chạy kịch bản kiểm thử tích hợp tự động tại [test_order_upgrade.js](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/scratch/test_order_upgrade.js) để kiểm tra luồng API đặt hàng, quà tặng, và kiểm tra quyền truy cập API.
Kết quả kiểm thử: **TẤT CẢ CÁC BƯỚC ĐỀU ĐẠT (PASS)**.
