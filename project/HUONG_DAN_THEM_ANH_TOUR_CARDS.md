# 📸 Hướng Dẫn Thêm Ảnh Cho Tour Cards

## 🎯 Vị Trí Ảnh Trong Tour Cards

Ảnh tour được hiển thị ở **phần trên cùng** của mỗi card, trong `.card-image-wrapper` với chiều cao cố định **240px**.

---

## 📁 Cách 1: Thêm Ảnh Vào JSON/API (Khuyến Nghị)

### Bước 1: Đặt ảnh vào thư mục

Tạo thư mục và đặt ảnh theo ID tour:

```
project/assets/img/tours/
├── 1.jpg    (Ảnh cho tour ID 1)
├── 2.jpg    (Ảnh cho tour ID 2)
├── 3.jpg    (Ảnh cho tour ID 3)
├── 4.jpg
├── 5.jpg
└── ...
```

### Bước 2: Cập nhật `data/sample-tours.json`

Mở file `project/data/sample-tours.json` và cập nhật trường `image`:

**Trước (đang dùng Unsplash):**
```json
{
  "id": 1,
  "title": "Tour Đà Nẵng - Hội An 3N2Đ",
  "image": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
  ...
}
```

**Sau (dùng ảnh local):**
```json
{
  "id": 1,
  "title": "Tour Đà Nẵng - Hội An 3N2Đ",
  "image": "assets/img/tours/1.jpg",
  ...
}
```

**Hoặc bỏ qua trường `image`** - code sẽ tự động tìm `assets/img/tours/1.jpg`:
```json
{
  "id": 1,
  "title": "Tour Đà Nẵng - Hội An 3N2Đ",
  // Không cần "image" - code tự tìm assets/img/tours/1.jpg
  ...
}
```

### Bước 3: Refresh trang → Ảnh tự động hiển thị!

---

## 📁 Cách 2: Đặt Ảnh Theo Quy Tắc Tự Động (Không Cần Sửa JSON)

Code đã được cấu hình để **tự động tìm ảnh** theo ID tour:

### Quy Tắc Tự Động:

1. **Nếu có `t.image` trong JSON** → Dùng ảnh đó
2. **Nếu không** → Tự động tìm `assets/img/tours/[id].jpg`
3. **Nếu không có** → Dùng placeholder `assets/img/banners/placeholder.jpg`

### Ví Dụ:

- **Tour ID 1** → Tự động tìm `assets/img/tours/1.jpg`
- **Tour ID 2** → Tự động tìm `assets/img/tours/2.jpg`
- **Tour ID 10** → Tự động tìm `assets/img/tours/10.jpg`

**Bạn chỉ cần:**
1. Đặt ảnh vào `assets/img/tours/[id].jpg` (theo ID tour)
2. Refresh trang → Xong!

---

## 🖼️ Kích Thước Ảnh Khuyến Nghị

### Kích Thước:
- **Chiều rộng:** 800px - 1200px
- **Chiều cao:** 600px - 900px
- **Tỷ lệ:** 4:3 hoặc 16:9 (khuyến nghị 4:3)
- **Format:** JPG hoặc WebP
- **Dung lượng:** < 500KB (tối ưu < 300KB)

### Lý Do:
- Card image wrapper có chiều cao cố định **240px**
- Ảnh sẽ được `object-fit: cover` để fill đầy không gian
- Tỷ lệ 4:3 sẽ không bị crop nhiều

---

## 📝 Ví Dụ Thực Tế

### Thêm ảnh cho Tour ID 1:

**Bước 1:** Đặt ảnh
```
assets/img/tours/1.jpg
```

**Bước 2:** (Tùy chọn) Cập nhật JSON
```json
{
  "id": 1,
  "title": "Tour Đà Nẵng - Hội An 3N2Đ",
  "image": "assets/img/tours/1.jpg"  // Có thể bỏ qua
}
```

**Bước 3:** Refresh trang → Ảnh hiển thị!

---

## 🔍 Code Render Ảnh

Ảnh được render trong các function sau:

### 1. **Tour List (tours.html)**
- **Function:** `render()` trong `tours.js` (dòng 78-82)
- **Code:**
```javascript
<img src="${t.image || `assets/img/tours/${t.id}.jpg` || "/project/assets/img/tours/1.jpg"}" 
     class="card-img-top" 
     alt="${t.title}"
     loading="lazy"
     onerror="this.onerror=null; this.src='assets/img/banners/placeholder.jpg';">
```

### 2. **Tour Bán Chạy (index.html)**
- **Function:** `renderHot()` trong `tours.js` (dòng 191-195)
- **Code tương tự**

### 3. **Tour Theo Chủ Đề (index.html)**
- **Function:** `renderCategory()` trong `tours.js` (dòng 298+)
- **Code tương tự**

---

## 🎨 CSS Styling

Ảnh được style trong `assets/css/tours-list.css`:

```css
.tour-card .card-image-wrapper {
  position: relative;
  overflow: hidden;
  height: 240px;  /* Chiều cao cố định */
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.tour-card .card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* Fill đầy không gian */
  transition: transform 0.5s ease;
}

.tour-card:hover .card-img-top {
  transform: scale(1.08);  /* Zoom khi hover */
}
```

---

## ⚠️ Xử Lý Lỗi

Code đã có **error handling** tự động:

```javascript
onerror="this.onerror=null; this.src='assets/img/banners/placeholder.jpg';"
```

**Nếu ảnh lỗi:**
- Tự động thay bằng placeholder
- Không bao giờ bị broken image

**Đảm bảo có file placeholder:**
```
assets/img/banners/placeholder.jpg
```

---

## 📋 Checklist Thêm Ảnh

### Cách Nhanh Nhất:
- [ ] Đặt ảnh vào `assets/img/tours/[id].jpg` (theo ID tour)
- [ ] Refresh trang → Xong!

### Cách Chi Tiết:
- [ ] Đặt ảnh vào `assets/img/tours/[id].jpg`
- [ ] (Tùy chọn) Cập nhật `image` trong JSON
- [ ] Kiểm tra kích thước ảnh (< 500KB)
- [ ] Refresh trang → Kiểm tra hiển thị
- [ ] Test hover effect (ảnh zoom)

---

## 🚀 Tóm Tắt

**Cách đơn giản nhất:**

1. **Đặt ảnh:** `assets/img/tours/1.jpg`, `2.jpg`, `3.jpg`... (theo ID)
2. **Refresh trang** → Tất cả ảnh tự động hiển thị!

**Không cần:**
- ❌ Sửa code JavaScript
- ❌ Sửa code CSS
- ❌ Sửa JSON (nếu đặt đúng tên file)

**Code đã tự động:**
- ✅ Tìm ảnh theo ID
- ✅ Xử lý lỗi (fallback placeholder)
- ✅ Lazy loading (tối ưu tốc độ)
- ✅ Hover effect (zoom ảnh)

---

## 💡 Lưu Ý

1. **Tên file phải đúng format:**
   - ✅ `1.jpg`, `2.jpg`, `10.jpg`
   - ❌ `tour-1.jpg`, `1.png`, `tour_1.jpg`

2. **Đường dẫn trong JSON:**
   - ✅ `assets/img/tours/1.jpg` (relative path)
   - ❌ `/assets/img/tours/1.jpg` (absolute path - có thể lỗi)
   - ❌ `../assets/img/tours/1.jpg` (relative path - có thể lỗi)

3. **Nếu ảnh không hiển thị:**
   - Kiểm tra tên file có đúng `[id].jpg` không
   - Kiểm tra đường dẫn trong JSON (nếu có)
   - Kiểm tra console browser (F12) xem có lỗi 404 không
   - Đảm bảo có file placeholder

---

**Cập nhật:** Code đã tự động xử lý tất cả, bạn chỉ cần đặt ảnh vào đúng thư mục!



