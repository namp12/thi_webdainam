# Hướng dẫn sử dụng Free Icons từ Iconify

## Tổng quan

Dự án đã được tích hợp **Iconify** - một dịch vụ icon miễn phí với hơn 200,000+ icons từ nhiều icon packs khác nhau.

### Website chính thức
- **Iconify**: https://iconify.design/
- **Icon Sets**: https://icon-sets.iconify.design/

## Cách sử dụng

### 1. Sử dụng trực tiếp trong HTML

```html
<!-- Cú pháp cơ bản -->
<iconify-icon icon="mdi:heart"></iconify-icon>

<!-- Với kích thước -->
<iconify-icon icon="mdi:heart" width="24" height="24"></iconify-icon>

<!-- Với màu sắc -->
<iconify-icon icon="mdi:heart" style="color: #dc3545;"></iconify-icon>

<!-- Với class -->
<iconify-icon icon="mdi:heart" class="icon-lg icon-danger"></iconify-icon>
```

### 2. Sử dụng qua JavaScript Helper

```javascript
// Sử dụng helper function
const iconHTML = window.APP_ICONS.render('mdi:heart', {
  width: '24px',
  height: '24px',
  color: '#dc3545',
  class: 'icon-pulse'
});

// Hoặc sử dụng shortcuts
const heartIcon = window.APP_ICONS.render(window.APP_ICONS.icons.heart, {
  size: '2rem',
  color: '#dc3545'
});
```

### 3. Icon Packs miễn phí phổ biến

#### Material Design Icons (mdi)
- **Tổng số**: 7,000+ icons
- **Website**: https://materialdesignicons.com/
- **Ví dụ**: `mdi:heart`, `mdi:airplane`, `mdi:hotel`

```html
<iconify-icon icon="mdi:heart"></iconify-icon>
<iconify-icon icon="mdi:airplane"></iconify-icon>
<iconify-icon icon="mdi:hotel"></iconify-icon>
```

#### Heroicons (heroicons)
- **Tổng số**: 400+ icons
- **Website**: https://heroicons.com/
- **Ví dụ**: `heroicons:heart`, `heroicons:airplane`

```html
<iconify-icon icon="heroicons:heart"></iconify-icon>
<iconify-icon icon="heroicons:airplane"></iconify-icon>
```

#### Tabler Icons (tabler)
- **Tổng số**: 2,000+ icons
- **Website**: https://tabler-icons.io/
- **Ví dụ**: `tabler:heart`, `tabler:plane`

```html
<iconify-icon icon="tabler:heart"></iconify-icon>
<iconify-icon icon="tabler:plane"></iconify-icon>
```

#### Feather Icons (feather)
- **Tổng số**: 280+ icons
- **Website**: https://feathericons.com/
- **Ví dụ**: `feather:heart`, `feather:airplane`

```html
<iconify-icon icon="feather:heart"></iconify-icon>
<iconify-icon icon="feather:airplane"></iconify-icon>
```

#### Font Awesome (fa)
- **Tổng số**: 1,600+ free icons
- **Website**: https://fontawesome.com/
- **Ví dụ**: `fa:heart`, `fa:plane`

```html
<iconify-icon icon="fa:heart"></iconify-icon>
<iconify-icon icon="fa:plane"></iconify-icon>
```

#### Boxicons (bx)
- **Tổng số**: 1,500+ icons
- **Website**: https://boxicons.com/
- **Ví dụ**: `bx:heart`, `bx:plane`

```html
<iconify-icon icon="bx:heart"></iconify-icon>
<iconify-icon icon="bx:plane"></iconify-icon>
```

#### Remix Icon (remix)
- **Tổng số**: 2,000+ icons
- **Website**: https://remixicon.com/
- **Ví dụ**: `remix:heart`, `remix:plane`

```html
<iconify-icon icon="remix:heart"></iconify-icon>
<iconify-icon icon="remix:plane"></iconify-icon>
```

## Icons có sẵn trong Helper

Dự án đã có sẵn một số icon shortcuts trong `window.APP_ICONS.icons`:

```javascript
// Travel & Tourism
window.APP_ICONS.icons.airplane    // 'mdi:airplane'
window.APP_ICONS.icons.hotel      // 'mdi:hotel'
window.APP_ICONS.icons.map        // 'mdi:map'
window.APP_ICONS.icons.compass    // 'mdi:compass'
window.APP_ICONS.icons.suitcase   // 'mdi:suitcase'
window.APP_ICONS.icons.camera     // 'mdi:camera'
window.APP_ICONS.icons.beach      // 'mdi:beach'
window.APP_ICONS.icons.mountain   // 'mdi:terrain'

// Actions
window.APP_ICONS.icons.heart      // 'mdi:heart'
window.APP_ICONS.icons.cart       // 'mdi:cart'
window.APP_ICONS.icons.eye        // 'mdi:eye'
window.APP_ICONS.icons.search     // 'mdi:magnify'
window.APP_ICONS.icons.star       // 'mdi:star'

// Communication
window.APP_ICONS.icons.phone       // 'mdi:phone'
window.APP_ICONS.icons.email       // 'mdi:email'
window.APP_ICONS.icons.message     // 'mdi:message'
window.APP_ICONS.icons.chat        // 'mdi:chat'

// Social Media
window.APP_ICONS.icons.facebook   // 'mdi:facebook'
window.APP_ICONS.icons.twitter    // 'mdi:twitter'
window.APP_ICONS.icons.instagram  // 'mdi:instagram'
window.APP_ICONS.icons.youtube    // 'mdi:youtube'
window.APP_ICONS.icons.linkedin   // 'mdi:linkedin'
```

## Ví dụ sử dụng trong code

### Trong HTML
```html
<!-- Thay thế Bootstrap Icons -->
<i class="bi bi-heart-fill"></i>
<!-- Thành -->
<iconify-icon icon="mdi:heart"></iconify-icon>

<!-- Với wrapper và styling -->
<span class="icon-wrapper icon-wrapper-primary">
  <iconify-icon icon="mdi:heart" width="24" height="24"></iconify-icon>
</span>
```

### Trong JavaScript
```javascript
// Render icon trong tour card
const heartIcon = window.APP_ICONS.render(window.APP_ICONS.icons.heart, {
  width: '20px',
  height: '20px',
  color: '#dc3545',
  class: 'icon-pulse'
});

// Sử dụng trong jQuery
$('#favorite-btn').html(heartIcon);
```

### Trong CSS
```css
/* Icon wrapper styles đã có sẵn */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0.5rem;
}

.icon-wrapper-primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}
```

## Tìm kiếm Icons

1. Truy cập: https://icon-sets.iconify.design/
2. Tìm kiếm icon bạn muốn
3. Click vào icon để xem code
4. Copy icon name (format: `pack:icon-name`)
5. Sử dụng trong code

## So sánh với Bootstrap Icons

| Tính năng | Bootstrap Icons | Iconify |
|-----------|----------------|---------|
| Số lượng icons | 1,800+ | 200,000+ |
| Icon packs | 1 | 100+ |
| Cách sử dụng | Font-based | SVG-based |
| Kích thước file | Lớn hơn | Nhỏ hơn (chỉ load icon cần) |
| Customization | Hạn chế | Linh hoạt hơn |

## Lưu ý

1. **Iconify tự động load**: Icons được load tự động khi sử dụng, không cần import toàn bộ
2. **Performance**: Iconify chỉ load icons được sử dụng, giúp tối ưu performance
3. **Browser support**: Hỗ trợ tất cả trình duyệt hiện đại
4. **Miễn phí**: Tất cả icons đều miễn phí sử dụng
5. **Có thể kết hợp**: Có thể sử dụng cùng lúc với Bootstrap Icons

## Tài nguyên

- **Iconify Website**: https://iconify.design/
- **Icon Sets**: https://icon-sets.iconify.design/
- **Documentation**: https://iconify.design/docs/
- **GitHub**: https://github.com/iconify/iconify

