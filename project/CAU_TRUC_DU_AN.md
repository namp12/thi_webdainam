# 📁 Cấu Trúc Dự Án - Travel Booking Website

## 🎯 Tổng Quan

Dự án là một website đặt tour du lịch với đầy đủ chức năng: đăng ký/đăng nhập, tìm kiếm tour, giỏ hàng, thanh toán, quản lý booking, và dashboard admin.

---

## 📂 Cấu Trúc Thư Mục

```
project/
├── assets/              # Tài nguyên (CSS, JS, hình ảnh, ngôn ngữ)
├── components/           # Components HTML tái sử dụng
├── data/                # Dữ liệu mẫu (JSON)
├── *.html               # Các trang HTML
└── *.md                 # Tài liệu
```

---

## 📄 Các Trang HTML

### 🏠 Trang Chủ & Điều Hướng

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `index.html` | Trang chủ | Hero search, danh sách tour, điểm đến, khuyến mãi, testimonials |
| `tours.html` | Danh sách tour | Hiển thị tất cả tour, filter, sort, search |
| `tour-detail.html` | Chi tiết tour | Thông tin chi tiết, gallery, itinerary, reviews, booking |
| `category.html` | Tour theo danh mục | Lọc tour theo category (biển, núi, văn hóa...) |
| `search.html` | Tìm kiếm | Kết quả tìm kiếm tour theo từ khóa |

### 🛒 E-Commerce

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `cart.html` | Giỏ hàng | Xem, chỉnh sửa, xóa sản phẩm trong giỏ |
| `checkout.html` | Thanh toán | Nhập thông tin, áp dụng mã giảm giá, chọn phương thức thanh toán |
| `payment.html` | Xử lý thanh toán | Xử lý thanh toán, xác nhận booking |
| `favorites.html` | Yêu thích | Danh sách tour đã thêm vào yêu thích |

### 📋 Booking & Quản Lý

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `booking.html` | Đặt tour trực tiếp | Form đặt tour không qua giỏ hàng |
| `booking-success.html` | Thành công | Xác nhận đặt tour thành công |
| `booking-history.html` | Lịch sử đặt tour | Xem tất cả booking đã đặt |
| `promotions.html` | Khuyến mãi | Danh sách các chương trình khuyến mãi, mã giảm giá |

### 👤 Tài Khoản & Người Dùng

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `login.html` | Đăng nhập | Form đăng nhập với animation |
| `register.html` | Đăng ký | Form đăng ký với validation password |
| `profile.html` | Hồ sơ | Thông tin cá nhân, chỉnh sửa profile |
| `settings.html` | Cài đặt | Cài đặt ngôn ngữ, dark mode |

### 📝 Nội Dung & Thông Tin

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `blog.html` | Blog | Danh sách bài viết blog |
| `blog-detail.html` | Chi tiết blog | Nội dung bài viết chi tiết |
| `about.html` | Giới thiệu | Thông tin về công ty, mission, values |
| `contact.html` | Liên hệ | Form liên hệ, thông tin, map, FAQ |
| `partners.html` | Đối tác | Danh sách đối tác, tìm kiếm, filter |
| `reviews.html` | Đánh giá | Danh sách đánh giá tour |
| `add-review.html` | Thêm đánh giá | Form thêm đánh giá cho tour |

### 🛡️ Hỗ Trợ & Pháp Lý

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `faq.html` | Câu hỏi thường gặp | Danh sách FAQ |
| `terms.html` | Điều khoản | Điều khoản dịch vụ |
| `privacy.html` | Bảo mật | Chính sách bảo mật |
| `404.html` | Lỗi 404 | Trang lỗi không tìm thấy |

### 👨‍💼 Admin Dashboard

| File | Mô Tả | Chức Năng Chính |
|------|-------|-----------------|
| `admin-dashboard.html` | Dashboard admin | Tổng quan thống kê, biểu đồ, xuất CSV |
| `admin-users.html` | Quản lý users | CRUD users, phân quyền |
| `admin-tours.html` | Quản lý tours | CRUD tours, upload ảnh |
| `admin-booking.html` | Quản lý booking | Xem, duyệt, hủy booking |
| `admin-reviews.html` | Quản lý reviews | Duyệt, xóa đánh giá |
| `create-admin.html` | Tạo admin | Tạo tài khoản admin mới |

---

## 📁 Thư Mục Assets

### 🎨 CSS (`assets/css/`)

| File | Mô Tả | Sử Dụng Cho |
|------|-------|-------------|
| `base.css` | Styles cơ bản | Reset, typography, variables |
| `style.css` | Styles chính | Layout, components chung |
| `responsive.css` | Responsive design | Media queries cho mobile/tablet |
| `animation.css` | Animations | Keyframes, transitions, effects |
| `dark-mode.css` | Dark mode | Styles cho chế độ tối |
| `admin.css` | Admin panel | Styles riêng cho admin |
| `login.css` | Login/Register | Styles cho trang đăng nhập/đăng ký |
| `homepage.css` | Trang chủ | Styles cho hero, category, testimonials |
| `category-section.css` | Section category | Grid layout cho tour cards |
| `tours-list.css` | Danh sách tour | Styles cho tour cards, badges, pricing |
| `favorites.css` | Trang yêu thích | Styles cho favorites page |
| `pricing.css` | Hiển thị giá | Styles cho giá, khuyến mãi, badges |
| `booking-forms.css` | Form booking | Styles cho checkout, payment, booking forms |
| `promotions.css` | Trang khuyến mãi | Styles cho promotions page |
| `contact.css` | Trang liên hệ | Styles cho contact form, map, FAQ |
| `partners.css` | Trang đối tác | Styles cho partners page |
| `footer.css` | Footer | Styles cho footer component |
| `icons.css` | Icons | Styles cho Iconify icons |
| `dashboard-charts.css` | Biểu đồ dashboard | Styles cho charts và export CSV |

### ⚙️ JavaScript (`assets/js/`)

#### 🔧 Core & Config

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `config.js` | Cấu hình API | Định nghĩa BASE_URL, API endpoints |
| `utils.js` | Utilities | Helper functions: http, storage, formatPrice, parsePrice, showToast, debounce |
| `settings.js` | Cài đặt | Quản lý theme (dark/light), ngôn ngữ (vi/en), load language files |
| `auth.js` | Xác thực | Login, register, logout, getCurrentUser, checkAuth |

#### 🏠 Frontend Pages

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `main.js` | Main script | Khởi tạo chung, load header/footer |
| `homepage.js` | Trang chủ | Hero search, category tabs, newsletter, carousel |
| `tours.js` | Danh sách tour | Load tours từ API, filter, sort, render tour cards, pricing |
| `tour-detail.js` | Chi tiết tour | Load tour detail, gallery, itinerary, reviews, add to cart |
| `category.js` | Tour theo danh mục | Filter tours theo category, render cards |
| `search.js` | Tìm kiếm | Search tours, render results |
| `cart.js` | Giỏ hàng | Add, remove, update cart, check login |
| `cart-page.js` | Trang giỏ hàng | Render cart items, tính tổng, checkout |
| `favorites.js` | Yêu thích | Add/remove favorites, check login, render favorites page |
| `checkout.js` | Thanh toán | Validate form, apply discount code, process checkout |
| `payment.js` | Xử lý thanh toán | Process payment, confirm booking, reduce stock |
| `booking.js` | Đặt tour | Direct booking form, validation |
| `booking-history.js` | Lịch sử booking | Load và hiển thị booking history |
| `booking-success.js` | Thành công | Hiển thị thông tin booking đã thành công |

#### 📝 Content & Reviews

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `blog.js` | Blog | Load và render blog posts, filter, search |
| `blog-detail.js` | Chi tiết blog | Load blog detail, related posts |
| `reviews.js` | Đánh giá | Load và hiển thị reviews |
| `add-review.js` | Thêm đánh giá | Form submit review, validation |

#### 🎁 Promotions & Pricing

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `promotions.js` | Khuyến mãi | Load promotions, search, render deal modal |
| `pricing-manager.js` | Quản lý giá | Tính giá cuối, discount, promotion badges |
| `deal-details.js` | Chi tiết deal | Hiển thị modal chi tiết khuyến mãi |

#### 🔐 Booking System

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `booking-validation.js` | Validation booking | Validate dates, quantity, stock, price, discount code, customer info |
| `booking-manager.js` | Quản lý booking | Lock inventory, confirm booking, reduce stock, send notifications |
| `booking-cancellation.js` | Hủy booking | Check cancellation policy, calculate fees, process refund, replenish stock |

#### 👨‍💼 Admin

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `admin-guard.js` | Bảo vệ admin | Kiểm tra quyền admin, redirect nếu không có quyền |
| `admin-dashboard.js` | Dashboard | Load stats, render charts, recent activities, tour performance |
| `admin-users.js` | Quản lý users | CRUD users, search, filter |
| `admin-tours.js` | Quản lý tours | CRUD tours, upload images |
| `admin-booking.js` | Quản lý booking | View, approve, cancel bookings |
| `admin-reviews.js` | Quản lý reviews | Approve, delete reviews |

#### 📊 Analytics & Tracking

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `tracking.js` | Tracking | Track user interactions (add to cart, favorites, checkout, discount usage) |
| `dashboard-links.js` | Liên kết dashboard | Real-time update stats từ cart/favorites/bookings |
| `dashboard-charts.js` | Biểu đồ | Render charts (revenue, bookings, top tours, funnel), export CSV |

#### 🎨 UI & Components

| File | Mô Tả | Chức Năng |
|------|-------|-----------|
| `header-client.js` | Header client | Update cart badge, user info, navigation |
| `footer.js` | Footer | Load footer component |
| `login-animations.js` | Animation login | Animations cho trang login |
| `register-animations.js` | Animation register | Animations, password validation cho trang register |
| `index-animations.js` | Animation homepage | Animations cho trang chủ |
| `background-theme.js` | Background theme | Dynamic background themes |
| `icons-loader.js` | Load icons | Load Iconify, helper functions cho icons |
| `contact.js` | Contact form | Validate và submit contact form |
| `partners.js` | Đối tác | Load, search, filter partners |
| `settings-page.js` | Trang cài đặt | UI cho settings page |
| `profile.js` | Profile | Load và update profile |

### 🌐 Ngôn Ngữ (`assets/lang/`)

| File | Mô Tả | Nội Dung |
|------|-------|----------|
| `vi.json` | Tiếng Việt | Tất cả text tiếng Việt cho website |
| `en.json` | Tiếng Anh | Tất cả text tiếng Anh cho website |

**Cách sử dụng:**
- Thêm key mới vào cả 2 file
- Sử dụng `data-i18n="key_name"` trong HTML
- JavaScript: `window.APP_LANG.key_name`

### 🖼️ Hình Ảnh (`assets/img/`)

| Thư Mục | Mô Tả | Ví Dụ |
|---------|-------|-------|
| `banners/` | Banner, hero images | `hero-banner.jpg`, `placeholder.jpg` |
| `tours/` | Ảnh tour | `1.jpg`, `2.jpg` (theo ID tour) |
| `icons/` | Icons, logos | `logo.png`, `favicon.ico` |
| `users/` | Avatar users | `user-1.jpg`, `avatar-default.jpg` |

### 📚 Libraries (`assets/libs/`)

| File | Mô Tả |
|------|-------|
| `bootstrap.min.css` | Bootstrap CSS framework |
| `bootstrap.bundle.min.js` | Bootstrap JS (includes Popper) |
| `jquery.min.js` | jQuery library |

---

## 🧩 Components (`components/`)

| File | Mô Tả | Sử Dụng Ở |
|------|-------|-----------|
| `header.html` | Header chính | Tất cả trang (load động) |
| `header-admin.html` | Header admin | Trang admin (load động) |
| `footer.html` | Footer | Tất cả trang (load động) |
| `sidebar-admin.html` | Sidebar admin | Trang admin (load động) |
| `tour-card.html` | Tour card template | (Có thể dùng cho template) |
| `modal-confirm.html` | Modal xác nhận | (Có thể dùng cho confirm actions) |

**Cách load:**
```javascript
$("#header-placeholder").load("components/header.html");
```

---

## 📊 Data (`data/`)

| File | Mô Tả | Cấu Trúc |
|------|-------|----------|
| `sample-tours.json` | Dữ liệu tour mẫu | Array of tour objects (id, title, destination, price, image, itinerary...) |
| `sample-users.json` | Dữ liệu users mẫu | Array of user objects (id, name, email, role...) |
| `sample-blogs.json` | Dữ liệu blog mẫu | Array of blog objects (id, title, content, image, author...) |
| `partners.json` | Dữ liệu đối tác | Array of partner objects (id, name, logo, description...) |

**Lưu ý:** Dữ liệu thực tế được load từ API (MockAPI), các file JSON này là backup/fallback.

---

## 🔑 Các File Quan Trọng

### ⚙️ Core Files

1. **`config.js`**
   - Định nghĩa API endpoints
   - BASE_URL: `https://692aefda7615a15ff24e2a04.mockapi.io/travel-booking`
   - API.users, API.tours

2. **`utils.js`**
   - `http`: HTTP client (GET, POST, PUT, DELETE)
   - `storage`: LocalStorage/SessionStorage helpers
   - `formatPrice`: Format giá tiền (₫)
   - `parsePrice`: Parse giá từ string ("21,664,750 VND" → number)
   - `showToast`: Hiển thị thông báo
   - `debounce`: Debounce function

3. **`settings.js`**
   - Quản lý theme (dark/light mode)
   - Quản lý ngôn ngữ (vi/en)
   - Load language files
   - Dispatch events: `langChanged`

4. **`auth.js`**
   - `login()`: Đăng nhập
   - `register()`: Đăng ký
   - `logout()`: Đăng xuất
   - `getCurrentUser()`: Lấy user hiện tại

### 💰 Pricing & Promotions

5. **`pricing-manager.js`**
   - `calculateFinalPrice()`: Tính giá cuối sau discount
   - `getPromotionBadge()`: Tạo badge khuyến mãi
   - Xử lý các loại promotion: percent, fixed, combo, voucher

6. **`tracking.js`**
   - `trackEvent()`: Track user actions
   - `getStats()`: Lấy thống kê
   - Events: addToCart, addToFavorites, checkoutStarted, checkoutCompleted, discountCodeUsed

### 📊 Dashboard & Analytics

7. **`dashboard-charts.js`**
   - Render biểu đồ: Revenue, Bookings, Top Tours, Funnel
   - Export CSV: Revenue, Bookings, All Stats
   - Tự động cập nhật khi đổi dark mode/ngôn ngữ

8. **`admin-dashboard.js`**
   - Load và hiển thị stats
   - Recent activities
   - Tour performance
   - Integration với tracking và promotions

---

## 🔄 Luồng Dữ Liệu

### 1. **Load Tours**
```
API.tours → tours.js → render() → HTML tour cards
```

### 2. **Add to Cart**
```
User click → cart.js → checkLogin() → addToCart() → localStorage → tracking.trackEvent()
```

### 3. **Checkout**
```
cart.html → checkout.js → booking-validation.js → booking-manager.js → payment.js → booking-success.html
```

### 4. **Dashboard Stats**
```
localStorage (bookings, cart, favorites) → admin-dashboard.js → render stats
tracking.js → dashboard-charts.js → render charts
```

---

## 🎨 Theme & Language System

### Dark Mode
- **File:** `assets/css/dark-mode.css`
- **Toggle:** `settings.js` → `#toggle-dark`
- **Storage:** `localStorage.travel_theme`
- **Attribute:** `data-bs-theme="dark"`

### Multi-language
- **Files:** `assets/lang/vi.json`, `assets/lang/en.json`
- **Manager:** `settings.js`
- **Storage:** `localStorage.travel_lang`
- **Usage:** `data-i18n="key_name"` trong HTML
- **JS Access:** `window.APP_LANG.key_name`

---

## 📦 Dependencies

### External CDN
- **Bootstrap 5:** CSS & JS
- **jQuery:** DOM manipulation
- **Bootstrap Icons:** Icon library
- **Iconify:** Free icon packs
- **Chart.js:** Biểu đồ thống kê
- **Google Fonts:** Inter font family

### Internal
- Tất cả code custom trong `assets/js/` và `assets/css/`

---

## 🚀 Cách Thêm Tính Năng Mới

### 1. Thêm Trang Mới
1. Tạo file HTML mới (ví dụ: `new-page.html`)
2. Thêm `data-i18n` cho text cần dịch
3. Include CSS/JS cần thiết
4. Thêm key dịch vào `vi.json` và `en.json`

### 2. Thêm Component
1. Tạo file trong `components/`
2. Load bằng: `$("#placeholder").load("components/component.html")`

### 3. Thêm API Endpoint
1. Cập nhật `config.js`: Thêm endpoint mới
2. Sử dụng: `http.get(API.newEndpoint)`

### 4. Thêm Tracking Event
1. Gọi: `TRACKING.trackEvent('eventName', { data })`
2. Xem stats: `TRACKING.getStats('eventName')`

---

## 📝 Quy Ước Đặt Tên

### Files
- **HTML:** `kebab-case.html` (ví dụ: `tour-detail.html`)
- **JS:** `kebab-case.js` (ví dụ: `tour-detail.js`)
- **CSS:** `kebab-case.css` (ví dụ: `tour-detail.css`)

### Variables
- **JavaScript:** `camelCase` (ví dụ: `tourList`, `isLoading`)
- **CSS Classes:** `kebab-case` (ví dụ: `tour-card`, `btn-primary`)

### IDs
- **HTML:** `kebab-case` (ví dụ: `tour-list`, `hero-search`)

---

## 🔍 Tìm File Nhanh

### Tôi muốn sửa...
- **Tour cards hiển thị** → `assets/js/tours.js` (dòng 50-150)
- **Giá và khuyến mãi** → `assets/js/pricing-manager.js`
- **Giỏ hàng** → `assets/js/cart.js` hoặc `assets/js/cart-page.js`
- **Thanh toán** → `assets/js/checkout.js` hoặc `assets/js/payment.js`
- **Dashboard** → `assets/js/admin-dashboard.js` hoặc `assets/js/dashboard-charts.js`
- **Dark mode** → `assets/css/dark-mode.css`
- **Ngôn ngữ** → `assets/lang/vi.json` và `assets/lang/en.json`
- **API endpoints** → `assets/js/config.js`
- **Header/Footer** → `components/header.html` hoặc `components/footer.html`

---

## 📚 Tài Liệu Tham Khảo

- **Bootstrap 5:** https://getbootstrap.com/
- **jQuery:** https://jquery.com/
- **Chart.js:** https://www.chartjs.org/
- **Iconify:** https://iconify.design/
- **Bootstrap Icons:** https://icons.getbootstrap.com/

---

## ✅ Checklist Khi Thêm Tính Năng Mới

- [ ] Tạo file HTML (nếu cần)
- [ ] Tạo file JS (nếu cần)
- [ ] Tạo file CSS (nếu cần)
- [ ] Thêm `data-i18n` cho text
- [ ] Thêm key dịch vào `vi.json` và `en.json`
- [ ] Thêm dark mode styles (nếu cần)
- [ ] Test responsive
- [ ] Test dark mode
- [ ] Test multi-language
- [ ] Update tracking (nếu cần)

---

**Cập nhật lần cuối:** 2025-01-XX



