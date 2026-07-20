# Hướng dẫn Thu Thập và Cấu Trúc Log — GameLab Range

Tài liệu này hướng dẫn cách cấu hình, vị trí tệp tin log trên máy chủ vật lý (Host OS) và cấu trúc định dạng log của các thành phần trong dự án GameLab để hỗ trợ bạn thiết lập các Log Collection Agent (ví dụ: Filebeat, Vector, Fluentd, Promtail, v.v.).

---

## 1. Bản Đồ Mount Thư Mục Log (Volume Mappings)

Trong tệp `docker-compose.yml`, các thư mục log của các container đã được mount trực tiếp ra thư mục cục bộ của máy chủ vật lý để các Agent ngoài Docker có thể đọc được trực tiếp:

| Dịch vụ | Thư mục trong Container | Đường dẫn trên máy vật lý (Host) | Tên tệp tin log |
| :--- | :--- | :--- | :--- |
| **Nginx Web Server** | `/var/log/nginx` | `./nginx/logs/` | `access.log`, `error.log` |
| **Node.js Backend** | `/app/logs` | `./backend/logs/` | `app.log` |

---

## 2. Định Dạng và Cấu Trúc Log Chi Tiết

### A. Nginx Access Log (Định dạng JSON)
Nginx được cấu hình ghi log dưới định dạng **JSON** thuần để các Agent dễ dàng parse mà không cần viết các bộ lọc Grok phức tạp. Cấu hình định dạng này nằm ở tệp [nginx.conf](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/nginx/nginx.conf):

*   **Vị trí**: `./nginx/logs/access.log`
*   **Cấu trúc một dòng log mẫu**:
    ```json
    {
      "time": "17/Jul/2026:11:05:32 +0700",
      "remote_addr": "192.168.1.5",
      "request_method": "GET",
      "request_uri": "/api/products/search?q=MacBook",
      "status": "200",
      "http_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "http_referer": "http://localhost/index.html"
    }
    ```
*   **Các trường dữ liệu (Fields)**:
    *   `time`: Thời gian ghi nhận yêu cầu (định dạng Nginx local).
    *   `remote_addr`: Địa chỉ IP của client gửi yêu cầu.
    *   `request_method`: HTTP Method (GET, POST, PUT, DELETE, OPTIONS).
    *   `request_uri`: Đường dẫn URI đầy đủ kèm theo query parameter.
    *   `status`: Mã trạng thái phản hồi HTTP (200, 301, 404, 500, v.v.).
    *   `http_user_agent`: Thông tin trình duyệt/thiết bị của client.
    *   `http_referer`: Trang nguồn dẫn tới yêu cầu hiện tại.

### B. Node.js Backend Log (Định dạng JSON)
Backend sử dụng thư viện **Winston** kết hợp với **Morgan** để ghi log HTTP Request và Application Log dưới dạng **JSON** trong tệp [logger.js](file:///C:/STUDY/ThucTap/CMC_Training/ecommerce-lab/backend/logger.js):

*   **Vị trí**: `./backend/logs/app.log`
*   **Cấu trúc dòng log HTTP Request mẫu**:
    ```json
    {
      "level": "info",
      "message": "HTTP Request",
      "method": "POST",
      "url": "/api/orders",
      "status": "200",
      "ip": "::ffff:172.21.0.4",
      "timestamp": "2026-07-17T04:05:02.124Z"
    }
    ```
*   **Cấu trúc dòng log lỗi hệ thống mẫu**:
    ```json
    {
      "level": "error",
      "message": "Order creation error",
      "error": "Connection lost to database",
      "timestamp": "2026-07-17T04:08:15.532Z"
    }
    ```
*   **Các trường dữ liệu (Fields)**:
    *   `level`: Cấp độ log (`info`, `warn`, `error`).
    *   `message`: Tiêu đề log hoặc thông tin mô tả sự kiện.
    *   `timestamp`: Thời gian ghi nhận chuẩn ISO 8601.
    *   `method` (chỉ có ở log HTTP): Phương thức HTTP.
    *   `url` (chỉ có ở log HTTP): URI endpoint được gọi.
    *   `status` (chỉ có ở log HTTP): HTTP Status Code.
    *   `ip` (chỉ có ở log HTTP): IP Client (bao gồm hỗ trợ phân tích IP gốc qua header X-Forwarded-For).

---

## 3. Gợi ý cấu hình Log Agent (Ví dụ: Filebeat)

Nếu bạn thiết lập Filebeat để thu thập logs đẩy về Elasticsearch / Logstash, bạn có thể tham khảo mẫu cấu hình `filebeat.yml` sau:

```yaml
filebeat.inputs:
  # Thu thập Nginx Access Logs
  - type: log
    enabled: true
    paths:
      - /path/to/ecommerce-lab/nginx/logs/access.log
    fields:
      service: nginx-access
    json.keys_under_root: true
    json.overwrite_keys: true

  # Thu thập Backend Application Logs
  - type: log
    enabled: true
    paths:
      - /path/to/ecommerce-lab/backend/logs/app.log
    fields:
      service: backend-app
    json.keys_under_root: true
    json.overwrite_keys: true

output.elasticsearch:
  hosts: ["localhost:9200"]
```

*Lưu ý: Thiết lập `json.keys_under_root: true` giúp Filebeat tự động giải nén các trường JSON trực tiếp thành các trường cha trên Elasticsearch để bạn vẽ biểu đồ Kibana cực kỳ nhanh chóng mà không cần parse lại.*
