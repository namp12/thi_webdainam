# Hướng dẫn sử dụng Icons

## Bootstrap Icons

Dự án này sử dụng **Bootstrap Icons** - một bộ icon miễn phí, mã nguồn mở với hơn 1,800+ icons.

### Link tải và sử dụng

#### 1. CDN (Khuyến nghị - Đã được tích hợp)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
```

#### 2. Tải về trực tiếp
- **Website chính thức**: https://icons.getbootstrap.com/
- **GitHub**: https://github.com/twbs/icons
- **NPM**: `npm install bootstrap-icons`
- **Download ZIP**: https://github.com/twbs/icons/releases

#### 3. Sử dụng trong code
```html
<!-- Icon trái tim (yêu thích) -->
<i class="bi bi-heart-fill"></i>        <!-- Trái tim đầy -->
<i class="bi bi-heart"></i>              <!-- Trái tim rỗng -->

<!-- Icon giỏ hàng -->
<i class="bi bi-cart-plus"></i>          <!-- Thêm vào giỏ -->
<i class="bi bi-cart-fill"></i>          <!-- Giỏ hàng đầy -->

<!-- Icon mắt (xem chi tiết) -->
<i class="bi bi-eye"></i>               <!-- Xem -->
<i class="bi bi-eye-fill"></i>       <!-- Xem (đầy) -->
```

### Icon trái tim (Yêu thích)

#### Các biến thể:
- `bi-heart` - Trái tim rỗng (outline)
- `bi-heart-fill` - Trái tim đầy (filled) ⭐ **Đang sử dụng**
- `bi-heart-half` - Trái tim nửa

#### Ví dụ sử dụng:
```html
<!-- Nút yêu thích chưa active -->
<button class="btn btn-favorite">
  <i class="bi bi-heart-fill"></i>
</button>

<!-- Nút yêu thích đã active -->
<button class="btn btn-favorite btn-favorite-active">
  <i class="bi bi-heart-fill"></i>
</button>
```

### Các icon khác đang sử dụng trong dự án

#### Navigation & Actions
- `bi-cart-plus` - Thêm vào giỏ hàng
- `bi-eye` - Xem chi tiết
- `bi-heart-fill` - Yêu thích
- `bi-star-fill` - Đánh giá sao
- `bi-geo-alt-fill` - Địa điểm
- `bi-clock-fill` - Thời gian

#### UI Elements
- `bi-check-circle` - Xác nhận
- `bi-x-circle` - Hủy
- `bi-info-circle` - Thông tin
- `bi-calendar-event` - Lịch
- `bi-box-seam` - Số lượng

### Tùy chỉnh màu sắc

```html
<!-- Màu đỏ cho trái tim -->
<i class="bi bi-heart-fill text-danger"></i>

<!-- Màu xanh -->
<i class="bi bi-heart-fill text-primary"></i>

<!-- Màu tùy chỉnh qua CSS -->
<style>
  .custom-heart {
    color: #ff6b9d;
  }
</style>
<i class="bi bi-heart-fill custom-heart"></i>
```

### Animation cho icon trái tim

```css
/* Heart beat animation */
@keyframes heartBeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

.heart-beat-animation {
  animation: heartBeat 0.6s ease;
}
```

### Tài nguyên bổ sung

- **Bootstrap Icons Gallery**: https://icons.getbootstrap.com/#icons
- **Search Icons**: https://icons.getbootstrap.com/#search
- **Documentation**: https://icons.getbootstrap.com/#usage

### Lưu ý

1. Bootstrap Icons là font-based, nên có thể scale và style dễ dàng
2. Tất cả icons đều miễn phí và mã nguồn mở
3. Không cần attribution nhưng được khuyến khích
4. Tương thích với tất cả trình duyệt hiện đại





