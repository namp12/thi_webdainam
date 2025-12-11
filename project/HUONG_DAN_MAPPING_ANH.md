# 📸 Hướng Dẫn Mapping Ảnh Cho Tours

## 🎯 Mục Đích

Thay vì tự động map ảnh theo ID tour (1.jpg cho tour ID 1), bạn có thể **chọn ảnh cụ thể** cho từng tour thông qua file mapping.

## 📁 File Mapping

**File:** `project/data/image-mapping.json`

```json
{
  "mapping": {
    "1": "da-nang.jpg",
    "2": "sapa.jpg",
    "3": "phu-quoc.jpg",
    ...
  }
}
```

## 🔧 Cách Sử Dụng

### **Bước 1: Đặt ảnh vào thư mục**

Đặt tất cả ảnh vào: `project/assets/img/tours/`

```
project/assets/img/tours/
├── da-nang.jpg
├── sapa.jpg
├── phu-quoc.jpg
├── ha-long.jpg
└── ...
```

### **Bước 2: Cập nhật mapping**

Mở file `project/data/image-mapping.json` và cập nhật:

```json
{
  "mapping": {
    "1": "da-nang.jpg",      ← Tour ID 1 sẽ dùng da-nang.jpg
    "2": "sapa.jpg",          ← Tour ID 2 sẽ dùng sapa.jpg
    "3": "phu-quoc.jpg",      ← Tour ID 3 sẽ dùng phu-quoc.jpg
    "4": "ha-long.jpg",       ← Tour ID 4 sẽ dùng ha-long.jpg
    ...
  }
}
```

### **Bước 3: Refresh trang**

Refresh trang → Ảnh sẽ tự động hiển thị theo mapping!

---

## 📝 Ví Dụ Thực Tế

### **Ví Dụ 1: Tour Đà Nẵng (ID 1)**

**Trước (tự động):**
- Tour ID 1 → Tự động tìm `1.jpg`

**Sau (mapping):**
- Tour ID 1 → Dùng `da-nang.jpg` (theo mapping)

**Cách làm:**
1. Đặt ảnh: `project/assets/img/tours/da-nang.jpg`
2. Cập nhật mapping:
   ```json
   {
     "mapping": {
       "1": "da-nang.jpg"
     }
   }
   ```
3. Refresh → Xong!

---

### **Ví Dụ 2: Sửa ảnh cho tour**

**Tình huống:** Tour ID 5 đang dùng `5.jpg`, nhưng bạn muốn đổi sang `my-custom-image.jpg`

**Cách làm:**
1. Đặt ảnh mới: `project/assets/img/tours/my-custom-image.jpg`
2. Cập nhật mapping:
   ```json
   {
     "mapping": {
       "5": "my-custom-image.jpg"
     }
   }
   ```
3. Refresh → Ảnh mới sẽ hiển thị!

---

## 🔍 Thứ Tự Ưu Tiên

Code sẽ tìm ảnh theo thứ tự:

1. ✅ **Mapping** (nếu có trong `image-mapping.json`)
   - Ví dụ: Tour ID 1 → `da-nang.jpg`

2. ⚠️ **Ảnh từ JSON** (nếu là local path)
   - Ví dụ: `tour.image = "assets/img/tours/custom.jpg"`

3. 🔄 **Auto-detect theo ID** (fallback)
   - Ví dụ: Tour ID 1 → `1.jpg`

4. 🎨 **Placeholder** (nếu tất cả đều lỗi)
   - `assets/img/banners/placeholder.jpg`

---

## 💡 Lợi Ích

### **1. Linh Hoạt**
- Có thể đặt tên ảnh theo ý muốn
- Không cần đặt tên theo ID

### **2. Dễ Quản Lý**
- Tất cả mapping ở một nơi
- Dễ tìm và sửa

### **3. Tránh Nhầm Lẫn**
- Ảnh Đà Nẵng không bị import vào ô Sapa
- Mỗi tour có ảnh riêng rõ ràng

---

## 🛠️ Cập Nhật Mapping

### **Thêm mapping mới:**

```json
{
  "mapping": {
    "1": "da-nang.jpg",
    "2": "sapa.jpg",
    "10": "new-tour-image.jpg"  ← Thêm mới
  }
}
```

### **Sửa mapping:**

```json
{
  "mapping": {
    "1": "da-nang-new.jpg"  ← Sửa từ "da-nang.jpg"
  }
}
```

### **Xóa mapping:**

Xóa dòng trong mapping → Code sẽ fallback sang auto-detect (1.jpg, 2.jpg...)

---

## ⚠️ Lưu Ý

1. **Tên file ảnh phải chính xác:**
   - ✅ `da-nang.jpg` (đúng)
   - ❌ `Da-Nang.jpg` (sai - case sensitive)
   - ❌ `da-nang.JPG` (sai - extension phải là .jpg)

2. **Đường dẫn ảnh:**
   - Tất cả ảnh phải ở: `project/assets/img/tours/`
   - Không cần thêm đường dẫn trong mapping

3. **Format file:**
   - ✅ `.jpg` hoặc `.jpeg`
   - ✅ `.png`
   - ✅ `.webp`

---

## 🔧 Troubleshooting

### **Vấn đề: Ảnh không hiển thị**

**Kiểm tra:**
1. File mapping có đúng format JSON không?
2. Tên file ảnh có khớp với mapping không?
3. Ảnh có tồn tại trong `assets/img/tours/` không?
4. Mở Console (F12) → Xem có lỗi 404 không?

### **Vấn đề: Vẫn dùng ảnh cũ**

**Giải pháp:**
- Clear cache: Ctrl+F5
- Hoặc hard refresh: Ctrl+Shift+R

---

## 📚 File Liên Quan

- **Mapping file:** `project/data/image-mapping.json`
- **Image folder:** `project/assets/img/tours/`
- **Code:** `project/assets/js/image-mapping.js`
- **Usage:** Tất cả file render tour cards (tours.js, search.js, category.js, favorites.js, etc.)

---

## 🎉 Tóm Tắt

1. ✅ Đặt ảnh vào `assets/img/tours/`
2. ✅ Cập nhật `data/image-mapping.json`
3. ✅ Refresh trang → Xong!

**Không cần:**
- ❌ Đặt tên ảnh theo ID
- ❌ Sửa code JavaScript
- ❌ Restart server

**Chỉ cần sửa file JSON mapping!**


