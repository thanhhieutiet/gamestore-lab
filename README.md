# GameLab Security Range & Store Lab

Hệ thống giả lập cửa hàng Game bản quyền (Game Store) tích hợp 12 lỗ hổng bảo mật chuẩn OWASP phục vụ cho mục đích học tập, thực nghiệm tấn công và giám sát an toàn thông tin (Security Monitoring / Log Agent setup).

Dự án đã được container hóa hoàn toàn bằng Docker, giúp việc triển khai trên Ubuntu hoặc bất kỳ hệ điều hành nào khác trở nên vô cùng đơn giản.

---

## Hướng dẫn Triển khai trên Ubuntu (Dành cho bạn bè)

Để chạy dự án này trên Ubuntu, bạn bè của bạn chỉ cần thực hiện theo các bước sau:

### Bước 1: Cài đặt Docker & Docker Compose trên Ubuntu
Mở Terminal trên Ubuntu và chạy các lệnh sau để cài đặt Docker:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt các thư viện cần thiết
sudo apt install -y curl apt-transport-https ca-certificates software-properties-common

# Thêm GPG key của Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm kho lưu trữ Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker Engine & Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Khởi động và kích hoạt Docker chạy cùng hệ thống
sudo systemctl start docker
sudo systemctl enable docker

# Thêm quyền chạy docker không cần sudo (tùy chọn - cần log out và log in lại để áp dụng)
sudo usermod -aG docker $USER
```

*Kiểm tra cài đặt thành công:*
```bash
docker --version
docker compose version
```

---

### Bước 2: Clone dự án và khởi chạy
1. Clone dự án từ Github:
   ```bash
   git clone <LINK_REPO_GITHUB_CỦA_BẠN>
   cd ecommerce-lab
   ```
2. Khởi chạy toàn bộ hệ thống bằng Docker Compose:
   ```bash
   sudo docker compose up --build -d
   ```
Lệnh này sẽ tự động tải các Image cần thiết, khởi tạo Database MySQL, chạy API Backend Node.js, và cấu hình Nginx làm Reverse Proxy phục vụ Static Frontend.

---

### Bước 3: Truy cập hệ thống
Sau khi các container báo trạng thái `Started` thành công, bạn có thể truy cập hệ thống qua trình duyệt:

*   **Địa chỉ truy cập**: `http://localhost` (hoặc `http://<IP_MÁY_UBUNTU_CỦA_BẠN>`)
*   **Cổng API Backend (nếu cần test trực tiếp)**: `http://localhost:3000`
*   **Cơ sở dữ liệu MySQL**: Cổng `3306`

#### Tài khoản kiểm thử có sẵn (Seed Data):
*   **Tài khoản Quản trị viên (Admin)**:
    *   Username: `admin`
    *   Password: `adminSecurePasswordHash123!`
    *   *Quyền lợi*: Xem được bảng điều khiển Admin Dashboard, các công cụ khai thác và gợi ý lỗ hổng bảo mật.
*   **Tài khoản Người dùng thường (User)**:
    *   Username: `user1` (hoặc `user2`)
    *   Password: `user1PasswordHash` (hoặc `user2PasswordHash`)
    *   *Quyền lợi*: Trải nghiệm giao diện game store sạch sẽ ở chế độ ẩn lỗ hổng (Blackbox).

---

## Các lệnh quản trị hữu ích

*   **Xem trạng thái các container**:
    ```bash
    sudo docker compose ps
    ```
*   **Xem log thời gian thực của các container**:
    ```bash
    sudo docker compose logs -f
    ```
*   **Dừng hệ thống**:
    ```bash
    sudo docker compose down
    ```
*   **Xóa toàn bộ dữ liệu cũ và khởi động lại từ đầu**:
    ```bash
    sudo docker compose down -v
    sudo docker compose up --build -d
    ```

---

## Tài liệu đính kèm trong dự án
*   [README-OWASP.md](README-OWASP.md): Hướng dẫn chi tiết vị trí và các bước khai thác 12 lỗ hổng bảo mật có trong bài Lab.
*   [README-LOGS.md](README-LOGS.md): Cấu trúc log của Nginx & Node.js Backend phục vụ việc cấu hình log collection agent (Filebeat/Vector).
