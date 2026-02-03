# Hướng dẫn cấu hình Cloudflare Tunnel (Production Deployment)

> **Lưu ý:** Cloudflare Tunnel chỉ cần thiết khi deploy production để expose ứng dụng ra internet.
> Khi develop local, chỉ cần truy cập `http://localhost` là đủ.

## Khi nào cần Cloudflare Tunnel?

- ✅ Deploy production trên server riêng (VPS, on-premise)
- ✅ Cần expose local development ra internet để test/demo
- ✅ Không muốn mở port trực tiếp trên firewall
- ❌ Development local thông thường (dùng localhost)

---

## Bước 1: Đăng nhập Cloudflare

Mở PowerShell hoặc CMD và chạy:

```powershell
cloudflared tunnel login
```

Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào Cloudflare và chọn domain.

## Bước 2: Tạo Tunnel mới

```powershell
cloudflared tunnel create satvach
```

Lệnh này sẽ tạo tunnel và trả về:

- Tunnel ID
- Tunnel credentials file (JSON)

**Lưu ý:** Ghi nhớ Tunnel ID, bạn sẽ cần nó ở bước sau.

## Bước 3: Lấy Tunnel Token

Có 2 cách để lấy token:

### Cách 1: Qua Dashboard (Khuyến nghị)

1. Truy cập: https://one.dash.cloudflare.com/
2. Vào **Networks** → **Tunnels**
3. Tìm tunnel "satvach" vừa tạo
4. Click vào tunnel → Tab **Configure**
5. Copy **Tunnel Token** (dạng: `eyJh...`)

### Cách 2: Qua CLI

```powershell
cloudflared tunnel token satvach
```

## Bước 4: Cấu hình Domain

Tạo file `cloudflare-tunnel-config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<USERNAME>\.cloudflared\<TUNNEL_ID>.json

ingress:
  # Route cho frontend
  - hostname: satvach.yourdomain.com
    service: http://frontend:80

  # Route cho backend API
  - hostname: api.satvach.yourdomain.com
    service: http://backend:8000

  # Route cho MinIO Console
  - hostname: minio.satvach.yourdomain.com
    service: http://minio:9001

  # Catch-all rule (bắt buộc)
  - service: http_status:404
```

## Bước 5: Thêm DNS Records

Chạy lệnh để tự động thêm DNS records:

```powershell
# Frontend
cloudflared tunnel route dns satvach satvach.yourdomain.com

# Backend API
cloudflared tunnel route dns satvach api.satvach.yourdomain.com

# MinIO Console
cloudflared tunnel route dns satvach minio.satvach.yourdomain.com
```

## Bước 6: Cập nhật file .env

Mở file `.env` và thêm Tunnel Token:

```env
# Cloudflare Tunnel
TUNNEL_TOKEN=eyJhxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Bước 7: Khởi động Tunnel với Docker (Production)

Uncomment service `cloudflared` trong `docker-compose.yml`, sau đó:

```powershell
docker-compose up -d cloudflared
```

Kiểm tra logs:

```powershell
docker-compose logs -f cloudflared
```

## Bước 8: Test kết nối

Truy cập các URL sau để kiểm tra:

- Frontend: https://satvach.yourdomain.com
- Backend API: https://api.satvach.yourdomain.com/docs
- MinIO Console: https://minio.satvach.yourdomain.com

## Troubleshooting

### Lỗi: "tunnel credentials file not found"

Kiểm tra đường dẫn credentials file:

```powershell
dir $env:USERPROFILE\.cloudflared\
```

### Lỗi: "no such host"

Đảm bảo DNS records đã được tạo:

```powershell
cloudflared tunnel route dns list
```

### Lỗi: "connection refused"

Kiểm tra các service đang chạy:

```powershell
docker-compose ps
```

## Lệnh hữu ích

```powershell
# Liệt kê tất cả tunnels
cloudflared tunnel list

# Xem thông tin tunnel
cloudflared tunnel info satvach

# Xóa tunnel
cloudflared tunnel delete satvach

# Chạy tunnel local (test)
cloudflared tunnel run satvach

# Xem logs
cloudflared tunnel logs satvach
```

## Lưu ý bảo mật

- **KHÔNG** commit file credentials (`.cloudflared/*.json`) vào Git
- **KHÔNG** chia sẻ TUNNEL_TOKEN công khai
- Sử dụng `.gitignore` để loại trừ các file nhạy cảm
- Rotate token định kỳ nếu bị lộ

## Tài liệu tham khảo

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub](https://github.com/cloudflare/cloudflared)
