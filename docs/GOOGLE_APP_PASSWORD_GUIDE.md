# Hướng dẫn tạo Google App Password để gửi mail

Để ứng dụng có thể gửi email qua Gmail (SMTP), bạn cần tạo "Mật khẩu ứng dụng" (App Password) thay vì sử dụng mật khẩu đăng nhập thông thường.

## Bước 1: Bật xác thực 2 bước (2-Step Verification)

1.  Truy cập vào [Tài khoản Google của bạn](https://myaccount.google.com/).
2.  Chọn tab **Bảo mật** (Security) ở menu bên trái.
3.  Tìm mục "Cách bạn đăng nhập vào Google" (How you sign in to Google).
4.  Chọn **Xác minh 2 bước** (2-Step Verification).
5.  Làm theo hướng dẫn để bật tính năng này (nếu chưa bật).

## Bước 2: Tạo mật khẩu ứng dụng (App Password)

1.  Sau khi bật Xác minh 2 bước, quay lại trang **Bảo mật**.
2.  Trong mục "Cách bạn đăng nhập vào Google", tìm kiếm **Mật khẩu ứng dụng** (App passwords).
    - _Lưu ý: Nếu không thấy mục này, hãy dùng ô tìm kiếm ở đầu trang và gõ "App passwords"._
3.  Nhập tên cho ứng dụng (ví dụ: `SatVach Backend`).
4.  Nhấn nút **Tạo** (Create).

## Bước 3: Lấy mật khẩu và cấu hình

1.  Một mật khẩu gồm 16 ký tự sẽ hiện ra (ví dụ: `xxxx xxxx xxxx xxxx`).
2.  **Copy mật khẩu này**. (Lưu ý: Bạn chỉ xem được mật khẩu này một lần duy nhất).
3.  Mở file `.env` của dự án Backend (`src/backend/.env`).
4.  Cập nhật các biến môi trường sau:

```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

> **Lưu ý:** `MAIL_PASSWORD` là mật khẩu 16 ký tự bạn vừa tạo, **KHÔNG PHẢI** mật khẩu đăng nhập Gmail của bạn.
