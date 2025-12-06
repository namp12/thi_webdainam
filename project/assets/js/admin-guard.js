/**
 * Admin Guard - Bảo vệ các trang admin
 * Chỉ cho phép admin truy cập các trang admin
 */
(function () {
  const { storage, showToast } = window.APP_UTILS;
  const SESSION_KEY = "travel_user";

  function checkAdminAccess() {
    const user = storage.get(SESSION_KEY, null);
    
    if (!user) {
      // Chưa đăng nhập
      showToast("Vui lòng đăng nhập để truy cập trang admin", "warning");
      setTimeout(() => {
        window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname);
      }, 1500);
      return false;
    }

    if (user.role !== "admin") {
      // Không phải admin
      showToast("Bạn không có quyền truy cập trang admin", "danger");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
      return false;
    }

    return true;
  }

  function getCurrentUser() {
    return storage.get(SESSION_KEY, null);
  }

  function logout() {
    storage.remove(SESSION_KEY);
    showToast("Đã đăng xuất", "success");
    window.location.href = "login.html";
  }

  // Kiểm tra ngay khi script được load
  if (window.location.pathname.includes("admin-")) {
    if (!checkAdminAccess()) {
      // Chặn không cho render trang
      document.body.innerHTML = `
        <div class="d-flex align-items-center justify-content-center min-vh-100">
          <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Đang kiểm tra...</span>
            </div>
            <p class="text-muted">Đang kiểm tra quyền truy cập...</p>
          </div>
        </div>
      `;
    }
  }

  // Expose functions
  window.ADMIN_GUARD = {
    checkAdminAccess,
    getCurrentUser,
    logout,
  };
})();


