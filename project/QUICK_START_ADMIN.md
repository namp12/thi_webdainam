# 🚀 HƯỚNG DẪN NHANH: Vào Admin Panel

## Cách 1: Tự động tạo Admin (Đơn giản nhất) ⭐

1. **Mở trình duyệt và vào:** `create-admin.html`
2. **Điền thông tin:**
   - Tên: Admin User (hoặc tên bạn muốn)
   - Email: admin@travel.com (hoặc email khác chứa "admin")
   - Mật khẩu: 123456 (hoặc mật khẩu bạn muốn)
   - Xác nhận mật khẩu: Nhập lại mật khẩu
3. **Click "Tạo Tài Khoản Admin"**
4. **Sau khi tạo thành công, bạn sẽ được chuyển đến trang đăng nhập**
5. **Đăng nhập với email và mật khẩu vừa tạo**
6. **Tự động vào Admin Dashboard!** 🎉

---

## Cách 2: Đăng ký thông thường

1. Vào `register.html`
2. Đăng ký với email có chứa từ "admin" (ví dụ: `admin@travel.com`)
3. Sau khi đăng ký, đăng nhập lại
4. Tự động vào Admin Dashboard

---

## Cách 3: Tạo trực tiếp trên MockAPI

1. Truy cập: https://692aefda7615a15ff24e2a04.mockapi.io/travel-booking/user
2. Click nút **"New"** hoặc **"+"**
3. Điền thông tin:
   ```json
   {
     "name": "Admin User",
     "email": "admin@travel.com",
     "password": "123456",
     "role": "admin"
   }
   ```
4. Click **"Save"**
5. Quay lại `login.html` và đăng nhập

---

## Thông tin đăng nhập mẫu

Sau khi tạo admin bằng cách 1 hoặc 3, bạn có thể đăng nhập với:

- **Email:** `admin@travel.com`
- **Password:** `123456` (hoặc mật khẩu bạn đã đặt)

---

## ⚠️ Lưu ý quan trọng

- Chỉ tài khoản có `role: "admin"` hoặc email chứa từ "admin" mới vào được Admin Panel
- Nếu đăng nhập với tài khoản thường, bạn sẽ vào trang chủ
- Nếu cố truy cập admin mà chưa đăng nhập, sẽ bị chuyển về trang đăng nhập

---

## 📋 Các trang Admin có sẵn

Sau khi vào Admin Dashboard, bạn có thể quản lý:

- **Dashboard:** Thống kê tổng quan
- **Users:** Quản lý người dùng (có thể tạo admin mới)
- **Tours:** Quản lý tour du lịch
- **Reviews:** Quản lý đánh giá
- **Bookings:** Quản lý đặt tour

---

## 🆘 Gặp vấn đề?

1. Kiểm tra kết nối internet (cần kết nối MockAPI)
2. Kiểm tra email đã tồn tại chưa
3. Xem chi tiết tại: `admin-setup.html`






