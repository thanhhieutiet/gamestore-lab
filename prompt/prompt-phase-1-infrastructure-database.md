# Vai trò

Bạn là một Senior DevOps & Backend Architect. Nhiệm vụ của bạn là khởi tạo dự án E-commerce Web App bằng Node.js, MySQL và Nginx sử dụng Docker Compose. Đừng lo lắng về bảo mật lúc này, hãy tập trung vào tính năng, nghiệp vụ phức tạp và kiến trúc logging.

## Yêu cầu 1: Cấu trúc thư mục

Tạo cấu trúc dự án như sau:

```text
/ecommerce-lab
├── nginx
│   └── nginx.conf
├── backend
│   ├── Dockerfile
│   ├── package.json
│   └── server.js (File rỗng hoặc "Hello World" để giữ container chạy)
├── db
│   └── init.sql
└── docker-compose.yml
```

---

## Yêu cầu 2: Cấu hình docker-compose.yml

Tạo 3 services:

- **db:** Dùng image `mysql:8.0`. Mount thư mục `/db/init.sql` vào `/docker-entrypoint-initdb.d/`.
- **backend:** Build từ thư mục `/backend`. Map port nội bộ. Mount volume thư mục log ra ngoài: `/app/logs:/app/logs`.
- **nginx:** Dùng image `nginx:latest`. Expose port `80` ra máy host. Mount `nginx.conf` và mount volume thư mục log ra ngoài: `/var/log/nginx:/var/log/nginx`.

---

## Yêu cầu 3: Cấu hình Nginx (QUAN TRỌNG CHO LOGGING)

Trong `nginx.conf`, hãy cấu hình làm Reverse Proxy trỏ vào service `backend`.

Đặc biệt bắt buộc: Cấu hình `log_format` cho access log dưới dạng JSON để hệ thống SIEM sau này dễ parse. Phải bao gồm các field:

- `time`
- `remote_addr`
- `request_method`
- `request_uri`
- `status`
- `http_user_agent`
- `http_referer`

---

## Yêu cầu 4: Khởi tạo Database (init.sql)

Tạo các bảng cho E-commerce nghiệp vụ phức tạp. Cố ý thiết kế theo kiểu legacy/cũ:

- Bảng `roles`: `id`, `role_name` (admin, user).
- Bảng `users`: `id`, `username`, `password` (varchar 255 - dự định dùng MD5), `role_id`, `avatar_path`.
- Bảng `products`: `id`, `name`, `description` (text), `price`, `stock`, `metadata_xml` (cột TEXT để lưu thông tin cấu hình sản phẩm dạng XML - phục vụ nghiệp vụ import/export sau này).
- Bảng `orders`: `id`, `user_id`, `total_amount`, `status`.
- Bảng `reviews`: `id`, `product_id`, `user_id`, `content` (text).

Viết script `INSERT` sẵn một vài data mẫu, bao gồm 1 user admin và 2 user thường.
