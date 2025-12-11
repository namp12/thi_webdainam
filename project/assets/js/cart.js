/**
 * Shopping Cart Management
 * Quản lý giỏ hàng tour du lịch
 */
(function () {
  const { API } = window.APP_CONFIG;
  const { http, storage, formatPrice, showToast } = window.APP_UTILS;
  const CART_KEY = "travel_cart";
  const SESSION_KEY = "travel_user";

  function getCart() {
    return storage.get(CART_KEY, []);
  }

  function saveCart(cart) {
    storage.set(CART_KEY, cart);
    updateCartBadge();
    $(document).trigger('cartUpdated');
  }

  // Helper: Check login using APP_AUTH
  function checkLogin() {
    const { getCurrentUser } = window.APP_AUTH || {};
    if (!getCurrentUser) return false;
    return !!getCurrentUser();  // Return boolean
  }

  // Helper: i18n
  function getI18nText(key, fallback) {
    return (window.APP_LANG && window.APP_LANG[key]) || fallback;
  }

  async function addToCart(tourId, quantity = 1, tourData = null) {
    if (!checkLogin()) {
      const message = getI18nText("cart_login_required", "Vui lòng đăng nhập để thêm vào giỏ hàng");
      showToast(message, "warning");
      setTimeout(() => {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${currentUrl}`;
      }, 2000);
      return false;
    }

    if (quantity <= 0) {
      showToast("Số lượng phải lớn hơn 0", "warning");
      return false;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => String(item.tourId) === String(tourId));

    let tour = tourData;
    if (!tour) {
      try {
        tour = await http.get(`${API.tours}/${tourId}`);
      } catch (err) {
        showToast("Không thể tải thông tin tour", "danger");
        return false;
      }
    }

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        tourId,
        quantity,
        tour,
        addedAt: new Date().toISOString()
      });
    }

    saveCart(cart);

    if (window.TRACKING) {
      window.TRACKING.trackAddToCart(tourId, tour, quantity);
    }

    showToast(getI18nText("cart_added_success", "Đã thêm vào giỏ hàng"), "success");
    return true;
  }

  function removeFromCart(tourId) {
    if (!checkLogin()) {
      showToast(getI18nText("cart_login_required_op", "Vui lòng đăng nhập để thao tác giỏ hàng"), "warning");
      return;
    }
    const cart = getCart();
    const filtered = cart.filter(item => String(item.tourId) !== String(tourId));
    saveCart(filtered);
    showToast(getI18nText("cart_removed_success", "Đã xóa khỏi giỏ hàng"), "success");
  }

  function updateQuantity(tourId, quantity) {
    if (!checkLogin()) {
      showToast(getI18nText("cart_login_required_update", "Vui lòng đăng nhập để cập nhật giỏ hàng"), "warning");
      return;
    }

    if (quantity <= 0) {
      removeFromCart(tourId);
      return;
    }

    const cart = getCart();
    const item = cart.find(item => String(item.tourId) === String(tourId));
    if (item) {
      item.quantity = quantity;
      saveCart(cart);
    } else {
      console.warn("Không tìm thấy tour để cập nhật:", tourId);
    }
  }

  function clearCart() {
    storage.remove(CART_KEY);
    try {
      sessionStorage.removeItem("checkout_cart");
      sessionStorage.removeItem("checkout_cart_backup");
    } catch (e) {
      console.warn("Session clear error:", e);
    }
    updateCartBadge();
    $(document).trigger('cartUpdated');
    console.log("✅ Đã xóa giỏ hàng");
  }

  function getCartTotal() {
    return getCart().reduce((total, item) => {
      const price = formatPrice(item.tour?.price) || 0;  // Use formatPrice directly
      return total + (price * item.quantity);
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    $(".cart-badge").text(count).toggleClass("d-none", count === 0);
  }

  $(function () {
    updateCartBadge();
  });

  window.APP_CART = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    updateCartBadge,
  };
})();