/**
 * Client Header Handler
 * Hiển thị thông tin user và nút logout khi đã đăng nhập
 */
(function () {
  const { storage } = window.APP_UTILS;
  const SESSION_KEY = "travel_user";

  function updateHeader() {
    const user = storage.get(SESSION_KEY, null);
    const $authButtons = $("#header-auth-buttons");
    
    if (!$authButtons.length) return;

    if (user) {
      // User đã đăng nhập
      const userName = user.name || user.email || "User";
      const isAdmin = user.role === "admin";
      
      $authButtons.html(`
        <a class="btn btn-outline-primary btn-sm position-relative" href="cart.html">
          <i class="bi bi-cart"></i> Giỏ hàng
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge d-none" style="font-size: 0.65rem;">0</span>
        </a>
        <a class="btn btn-outline-primary btn-sm" href="favorites.html"><i class="bi bi-heart-fill text-danger"></i> Yêu thích</a>
        <div class="dropdown">
          <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
            <i class="bi bi-person-circle"></i> ${userName}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person"></i> Trang cá nhân</a></li>
            <li><a class="dropdown-item" href="booking-history.html"><i class="bi bi-calendar-check"></i> Lịch sử đặt tour</a></li>
            <li><a class="dropdown-item" href="favorites.html"><i class="bi bi-heart-fill text-danger"></i> Yêu thích</a></li>
            <li><a class="dropdown-item" href="settings.html"><i class="bi bi-gear"></i> Cài đặt</a></li>
            ${isAdmin ? '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="admin-dashboard.html"><i class="bi bi-shield-lock"></i> Admin Panel</a></li>' : ''}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="btn-logout"><i class="bi bi-box-arrow-right"></i> Đăng xuất</a></li>
          </ul>
        </div>
      `);
      
      // Update cart badge after rendering
      if (window.APP_CART) {
        window.APP_CART.updateCartBadge();
      }

      // Logout handler
      $("#btn-logout").on("click", function (e) {
        e.preventDefault();
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
          if (window.APP_AUTH && window.APP_AUTH.logout) {
            window.APP_AUTH.logout();
          } else {
            storage.remove(SESSION_KEY);
          }
          window.location.href = "index.html";
        }
      });
    } else {
      // Chưa đăng nhập - giữ nguyên
      $authButtons.html(`
        <a class="btn btn-outline-primary btn-sm position-relative" href="cart.html">
          <i class="bi bi-cart"></i> Giỏ hàng
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge d-none" style="font-size: 0.65rem;">0</span>
        </a>
        <a class="btn btn-outline-primary btn-sm" href="favorites.html" data-i18n="nav_fav">♥ Yêu thích</a>
        <a class="btn btn-primary btn-sm" href="login.html" data-i18n="nav_login" id="btn-login">Đăng nhập</a>
      `);
      
      // Update cart badge
      if (window.APP_CART) {
        window.APP_CART.updateCartBadge();
      }
    }
  }

  // Update header khi DOM ready
  $(function () {
    updateHeader();
    
    // Update lại khi có thay đổi storage (từ tab khác)
    window.addEventListener("storage", function (e) {
      if (e.key === SESSION_KEY) {
        updateHeader();
      }
    });
  });

  // Expose function để update từ bên ngoài
  window.updateClientHeader = updateHeader;
})();

