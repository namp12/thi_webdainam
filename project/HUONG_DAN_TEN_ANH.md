# 📸 Hướng Dẫn Đặt Tên Ảnh Để Tự Động Tìm

## ✅ Quy Tắc Đặt Tên Ảnh

### **Quy Tắc Chính:**
Ảnh phải được đặt tên theo **ID của tour** với format: `[id].jpg`

### **Ví Dụ:**
- Tour ID **1** → Ảnh: `1.jpg`
- Tour ID **2** → Ảnh: `2.jpg`
- Tour ID **10** → Ảnh: `10.jpg`
- Tour ID **25** → Ảnh: `25.jpg`

---

## 📁 Vị Trí Đặt Ảnh

### **Thư Mục:**
```
project/assets/img/tours/
├── 1.jpg    ✅ Đúng
├── 2.jpg    ✅ Đúng
├── 3.jpg    ✅ Đúng
├── 10.jpg   ✅ Đúng
└── ...
```

### **Sai:**
```
❌ tour-1.jpg
❌ 1.png
❌ tour_1.jpg
❌ Tour-1.jpg
❌ 01.jpg (có số 0 đằng trước)
```

---

## 🔍 Cách Code Tự Động Tìm Ảnh

Code đã được cập nhật để **LUÔN ưu tiên ảnh local** trước:

```javascript
// Code tự động tìm ảnh theo ID
const localImage = `assets/img/tours/${t.id}.jpg`;
const imageSrc = localImage; // Luôn ưu tiên ảnh local

// Nếu ảnh local không tìm thấy (lỗi 404), sẽ fallback sang ảnh từ JSON
onerror="this.onerror=null; this.src='${t.image || `assets/img/banners/placeholder.jpg`}';"
```

### **Thứ Tự Ưu Tiên:**
1. ✅ **Ảnh local:** `assets/img/tours/[id].jpg` (ƯU TIÊN NHẤT)
2. ⚠️ **Ảnh từ JSON:** `t.image` (nếu ảnh local lỗi)
3. 🔄 **Placeholder:** `assets/img/banners/placeholder.jpg` (nếu cả 2 đều lỗi)

---

## 📝 Ví Dụ Thực Tế

### **Tour ID 1:**
1. Đặt ảnh: `project/assets/img/tours/1.jpg`
2. Code tự động tìm: `assets/img/tours/1.jpg`
3. ✅ Hiển thị ngay!

### **Tour ID 2:**
1. Đặt ảnh: `project/assets/img/tours/2.jpg`
2. Code tự động tìm: `assets/img/tours/2.jpg`
3. ✅ Hiển thị ngay!

### **Tour ID 10:**
1. Đặt ảnh: `project/assets/img/tours/10.jpg`
2. Code tự động tìm: `assets/img/tours/10.jpg`
3. ✅ Hiển thị ngay!

---

## ⚠️ Lưu Ý Quan Trọng

### 1. **Tên File Phải Chính Xác:**
- ✅ `1.jpg` (đúng)
- ❌ `01.jpg` (sai - có số 0 đằng trước)
- ❌ `tour-1.jpg` (sai - có prefix)
- ❌ `1.png` (sai - phải là .jpg)

### 2. **Đường Dẫn Phải Đúng:**
- ✅ `project/assets/img/tours/1.jpg`
- ❌ `project/assets/img/tours/tour-1.jpg`
- ❌ `project/assets/img/1.jpg` (sai thư mục)

### 3. **Format Ảnh:**
- ✅ `.jpg` hoặc `.jpeg`
- ✅ `.png` (có thể dùng nhưng khuyến nghị .jpg)
- ✅ `.webp` (có thể dùng)

### 4. **Không Cần Sửa JSON:**
- ❌ Không cần thêm trường `image` vào JSON
- ❌ Không cần xóa trường `image` trong JSON
- ✅ Code tự động tìm ảnh local trước!

---

## 🔧 Kiểm Tra Ảnh Có Hoạt Động Không

### **Bước 1: Kiểm Tra Tên File**
```
project/assets/img/tours/
├── 1.jpg  ✅ Đúng format
```

### **Bước 2: Kiểm Tra Đường Dẫn**
- Mở browser console (F12)
- Xem Network tab
- Tìm request: `assets/img/tours/1.jpg`
- Nếu thấy **200 OK** → Ảnh load thành công
- Nếu thấy **404 Not Found** → Kiểm tra lại tên file và đường dẫn

### **Bước 3: Kiểm Tra HTML**
- Inspect element trên ảnh
- Xem `src` attribute
- Phải là: `assets/img/tours/1.jpg`

---

## 🚀 Tóm Tắt

**Để ảnh tự động tìm được:**

1. ✅ Đặt ảnh vào: `project/assets/img/tours/[id].jpg`
2. ✅ Tên file phải đúng format: `1.jpg`, `2.jpg`, `10.jpg`...
3. ✅ Refresh trang → Ảnh tự động hiển thị!

**Không cần:**
- ❌ Sửa JSON
- ❌ Sửa code JavaScript
- ❌ Thêm prefix vào tên file

**Code đã tự động:**
- ✅ Tìm ảnh theo ID
- ✅ Ưu tiên ảnh local trước
- ✅ Fallback sang ảnh từ JSON nếu lỗi
- ✅ Fallback sang placeholder nếu cả 2 đều lỗi

---

## 💡 Ví Dụ Cụ Thể

### **Trường Hợp 1: Có ảnh local**
```
File: project/assets/img/tours/1.jpg
→ Code tìm: assets/img/tours/1.jpg
→ ✅ Hiển thị ảnh local
```

### **Trường Hợp 2: Không có ảnh local, có ảnh trong JSON**
```
File: Không có
JSON: "image": "https://images.unsplash.com/..."
→ Code tìm: assets/img/tours/1.jpg (lỗi 404)
→ Fallback: Dùng ảnh từ JSON
→ ✅ Hiển thị ảnh từ JSON
```

### **Trường Hợp 3: Không có cả 2**
```
File: Không có
JSON: Không có "image"
→ Code tìm: assets/img/tours/1.jpg (lỗi 404)
→ Fallback: assets/img/banners/placeholder.jpg
→ ✅ Hiển thị placeholder
```

---

**Cập nhật:** Code đã được sửa để **LUÔN ưu tiên ảnh local** trước, không cần quan tâm đến trường `image` trong JSON nữa!



