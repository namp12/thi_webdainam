# 📸 Hướng Dẫn Thêm Ảnh Cho Trang Index (Homepage)

## 🎯 Các Phần Được Call Từ API

Trang `index.html` có **3 phần chính** được render từ API qua file `tours.js`:

### 1. **Tour Bán Chạy** (`#hot-tour-list`)
- **Function:** `renderHot()` trong `tours.js` (dòng 157-267)
- **Data:** Lấy từ API tours, sort theo price, lấy 6 tour đầu
- **Render:** Tour cards với ảnh, giá, rating, badges

### 2. **Tour Theo Chủ Đề** (`#category-tour-list`)
- **Function:** `renderCategory()` trong `tours.js` (dòng 269-386)
- **Data:** Filter tours theo category (biển, núi, văn hóa...)
- **Render:** Tour cards tương tự hot tours

### 3. **Điểm Đến Nổi Bật** (`#destinations-grid`) ⭐ MỚI
- **Function:** `renderDestinations()` trong `tours.js` (mới thêm)
- **Data:** Lấy unique destinations từ tours API
- **Render:** Destination cards với ảnh và theme

---

## 📁 Cách Thêm Ảnh

### **Cách 1: Thêm Ảnh Vào JSON/API (Khuyến Nghị)**

#### Bước 1: Đặt ảnh vào thư mục

```
project/assets/img/
├── tours/
│   ├── 1.jpg    (Ảnh tour ID 1)
│   ├── 2.jpg    (Ảnh tour ID 2)
│   ├── 3.jpg    (Ảnh tour ID 3)
│   └── ...
└── banners/
    ├── da-nang.jpg      (Ảnh destination Đà Nẵng)
    ├── da-lat.jpg       (Ảnh destination Đà Lạt)
    ├── phu-quoc.jpg     (Ảnh destination Phú Quốc)
    ├── nha-trang.jpg
    ├── sapa.jpg
    ├── ha-long.jpg
    └── placeholder.jpg  (Ảnh mặc định)
```

#### Bước 2: Cập nhật `data/sample-tours.json`

Mở file `project/data/sample-tours.json` và cập nhật trường `image`:

```json
{
  "id": 1,
  "title": "Tour Đà Nẵng - Hội An 3N2Đ",
  "destination": "Đà Nẵng",
  "price": 3500000,
  "duration": 3,
  "description": "...",
  "image": "assets/img/tours/1.jpg",  // ← Thay URL Unsplash bằng ảnh local
  "theme": "Biển & Ẩm thực",  // ← Thêm theme cho destination card
  "category": "biển",  // ← Thêm category
  ...
}
```

**Lưu ý:**
- `image`: Ảnh cho tour card
- `theme`: Hiển thị trên destination card (ví dụ: "Biển & Ẩm thực")
- `category`: Dùng để filter (ví dụ: "biển", "núi", "văn hóa")

---

### **Cách 2: Đặt Ảnh Theo Quy Tắc Tự Động**

Code đã được cập nhật để **tự động tìm ảnh** theo quy tắc:

#### Cho Tour Cards:
1. Nếu có `t.image` trong JSON → dùng ảnh đó
2. Nếu không → tự động tìm `assets/img/tours/[id].jpg`
3. Nếu không có → dùng placeholder

**Ví dụ:**
- Tour ID 1 → tự động tìm `assets/img/tours/1.jpg`
- Tour ID 2 → tự động tìm `assets/img/tours/2.jpg`

#### Cho Destination Cards:
1. Nếu có `t.image` trong tour → dùng ảnh đó
2. Nếu không → tự động tìm `assets/img/tours/[id].jpg`
3. Nếu không có → tự động tìm `assets/img/banners/[destination-name].jpg`
4. Nếu không có → dùng placeholder

**Ví dụ:**
- Destination "Đà Nẵng" → tự động tìm `assets/img/banners/da-nang.jpg`
- Destination "Phú Quốc" → tự động tìm `assets/img/banners/phu-quoc.jpg`

---

## 🖼️ Các Vị Trí Ảnh Trên Index

### 1. **Hero Banner** (dòng 77)
```html
<img src="assets/img/banners/placeholder.jpg" class="img-fluid rounded-4" alt="Travel">
```

**Cách thêm:**
- Đặt ảnh: `assets/img/banners/hero-banner.jpg`
- Sửa: `src="assets/img/banners/hero-banner.jpg"`

### 2. **Tour Bán Chạy** (`#hot-tour-list`)
- **File JS:** `assets/js/tours.js` - function `renderHot()` (dòng 191)
- **Code hiện tại:**
```javascript
<img src="${t.image || `assets/img/tours/${t.id}.jpg` || "assets/img/banners/placeholder.jpg"}" 
     class="card-img-top" 
     alt="${t.title}"
     loading="lazy"
     onerror="this.onerror=null; this.src='assets/img/banners/placeholder.jpg';">
```

**Cách thêm:**
- Đặt ảnh: `assets/img/tours/1.jpg`, `2.jpg`, `3.jpg`... (theo ID tour)
- Hoặc cập nhật `image` trong JSON

### 3. **Tour Theo Chủ Đề** (`#category-tour-list`)
- **File JS:** `assets/js/tours.js` - function `renderCategory()` (dòng 294)
- **Code tương tự tour bán chạy**

**Cách thêm:**
- Giống như Tour Bán Chạy

### 4. **Điểm Đến Nổi Bật** (`#destinations-grid`) ⭐
- **File JS:** `assets/js/tours.js` - function `renderDestinations()` (mới thêm)
- **Code:**
```javascript
image: tour.image || `assets/img/tours/${tour.id}.jpg` || `assets/img/banners/${tour.destination.toLowerCase().replace(/\s+/g, '-')}.jpg`
```

**Cách thêm:**

**Option A: Đặt ảnh theo tên destination**
```
assets/img/banners/
├── da-nang.jpg      (Đà Nẵng)
├── da-lat.jpg       (Đà Lạt)
├── phu-quoc.jpg     (Phú Quốc)
├── nha-trang.jpg    (Nha Trang)
├── sapa.jpg         (Sapa)
└── ha-long.jpg      (Hạ Long)
```

**Option B: Dùng ảnh từ tour đầu tiên của destination**
- Code sẽ tự động lấy ảnh từ tour đầu tiên có destination đó
- Ví dụ: Tour ID 1 có destination "Đà Nẵng" → dùng `assets/img/tours/1.jpg`

**Option C: Thêm trường `destinationImage` vào JSON**
```json
{
  "id": 1,
  "destination": "Đà Nẵng",
  "image": "assets/img/tours/1.jpg",
  "destinationImage": "assets/img/banners/da-nang.jpg",  // ← Ảnh riêng cho destination
  ...
}
```

---

## 📝 Ví Dụ Thực Tế

### Thêm ảnh cho Tour Bán Chạy:

**Bước 1:** Đặt ảnh vào `assets/img/tours/`
```
assets/img/tours/
├── 1.jpg
├── 2.jpg
├── 3.jpg
└── ...
```

**Bước 2:** (Tùy chọn) Cập nhật JSON
```json
{
  "id": 1,
  "title": "Tour Đà Nẵng",
  "image": "assets/img/tours/1.jpg",  // ← Có thể bỏ qua, code tự tìm
  ...
}
```

**Bước 3:** Refresh trang → Ảnh tự động hiển thị!

### Thêm ảnh cho Điểm Đến:

**Bước 1:** Đặt ảnh vào `assets/img/banners/`
```
assets/img/banners/
├── da-nang.jpg
├── da-lat.jpg
├── phu-quoc.jpg
└── ...
```

**Bước 2:** Đảm bảo tours có destination và theme
```json
{
  "id": 1,
  "destination": "Đà Nẵng",
  "theme": "Biển & Ẩm thực",  // ← Hiển thị trên destination card
  "category": "biển",
  ...
}
```

**Bước 3:** Refresh trang → Destination cards tự động render với ảnh!

---

## 🎨 Kích Thước Ảnh Khuyến Nghị

### Tour Images:
- **Kích thước:** 800x600px hoặc 1200x800px
- **Tỷ lệ:** 4:3 hoặc 16:9
- **Format:** JPG hoặc WebP
- **Dung lượng:** < 500KB

### Destination Images:
- **Kích thước:** 900x600px hoặc 1200x800px
- **Tỷ lệ:** 3:2 hoặc 16:9
- **Format:** JPG hoặc WebP
- **Dung lượng:** < 600KB

### Hero Banner:
- **Kích thước:** 1920x1080px (Full HD)
- **Tỷ lệ:** 16:9
- **Format:** JPG
- **Dung lượng:** < 1MB

---

## 🔧 Cải Tiến Đã Thêm

### 1. **Tự Động Tìm Ảnh**
- Code tự động tìm ảnh theo ID tour
- Code tự động tìm ảnh theo tên destination

### 2. **Error Handling**
- Nếu ảnh lỗi → tự động thay bằng placeholder
- `onerror` handler đã được thêm

### 3. **Lazy Loading**
- Tất cả ảnh có `loading="lazy"` để tối ưu tốc độ

### 4. **Destination Cards Clickable**
- Click vào destination card → tự động filter tours theo destination đó

---

## 📋 Checklist Thêm Ảnh

### Cho Tour Cards:
- [ ] Đặt ảnh vào `assets/img/tours/[id].jpg`
- [ ] (Tùy chọn) Cập nhật `image` trong JSON
- [ ] Refresh trang → Kiểm tra

### Cho Destination Cards:
- [ ] Đặt ảnh vào `assets/img/banners/[destination-name].jpg`
- [ ] Đảm bảo tours có `destination` và `theme` trong JSON
- [ ] Refresh trang → Kiểm tra

### Cho Hero Banner:
- [ ] Đặt ảnh vào `assets/img/banners/hero-banner.jpg`
- [ ] Sửa `index.html` dòng 77
- [ ] Refresh trang → Kiểm tra

---

## 🚀 Tóm Tắt Nhanh

**Cách nhanh nhất:**

1. **Tour ảnh:**
   - Đặt vào `assets/img/tours/1.jpg`, `2.jpg`, `3.jpg`... (theo ID)
   - Xong! Code tự động tìm

2. **Destination ảnh:**
   - Đặt vào `assets/img/banners/da-nang.jpg`, `da-lat.jpg`... (theo tên)
   - Xong! Code tự động tìm

3. **Hero banner:**
   - Đặt vào `assets/img/banners/hero-banner.jpg`
   - Sửa `index.html` dòng 77

**Không cần sửa code JS nữa!** Code đã tự động xử lý tất cả.

---

## 💡 Lưu Ý

1. **Tên file destination:**
   - "Đà Nẵng" → `da-nang.jpg` (chuyển thành lowercase, thay space bằng dấu gạch ngang)
   - "Phú Quốc" → `phu-quoc.jpg`
   - Code tự động xử lý: `tour.destination.toLowerCase().replace(/\s+/g, '-')`

2. **Fallback chain:**
   - Tour image → Tour ID image → Destination image → Placeholder
   - Luôn có ảnh hiển thị, không bao giờ bị lỗi

3. **Click destination:**
   - Click vào destination card → Tự động chuyển đến `tours.html?destination=Đà Nẵng`
   - Filter tours theo destination đó

---

**Cập nhật:** Code đã được cập nhật để tự động render destinations từ API!



