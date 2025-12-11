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
    // Trigger custom event for dashboard updates
    $(document).trigger('cartUpdated');
  }

  function addToCart(tourId, quantity = 1, tourData = null) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.tourId === tourId);
    const user = storage.get(SESSION_KEY, null);
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm vào giỏ hàng", "warning");
      setTimeout(() => window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname), 2000);
      return;
    }

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      if (tourData) {
        cart.push({
          tourId,
          quantity,
          tour: tourData,
          addedAt: new Date().toISOString()
        });
      } else {
        // Load tour data if not provided
        http.get(`${API.tours}/${tourId}`).then(tour => {
          cart.push({
            tourId,
            quantity,
            tour,
            addedAt: new Date().toISOString()
          });
          saveCart(cart);
        }).catch(() => {
          showToast("Không thể thêm tour vào giỏ hàng", "danger");
        });
        return;
      }
    }

    saveCart(cart);
    showToast("Đã thêm vào giỏ hàng", "success");
  }

  function removeFromCart(tourId) {
    const cart = getCart();
    const filtered = cart.filter(item => item.tourId !== tourId);
    const user = storage.get(SESSION_KEY, null);
    if (!user) {
      showToast("Vui lòng đăng nhập để thao tác giỏ hàng", "warning");
      return;
    }
    saveCart(filtered);
    showToast("Đã xóa khỏi giỏ hàng", "success");
  }

  function updateQuantity(tourId, quantity) {
    const user = storage.get(SESSION_KEY, null);
    if (!user) {
      showToast("Vui lòng đăng nhập để cập nhật giỏ hàng", "warning");
      return;
    }
    if (quantity <= 0) {
      removeFromCart(tourId);
      return;
    }
    const cart = getCart();
    const item = cart.find(item => item.tourId === tourId);
    if (item) {
      item.quantity = quantity;
      saveCart(cart);
    }
  }

  function clearCart() {
    storage.remove(CART_KEY);
    updateCartBadge();
  }

  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
      const price = Number(item.tour?.price || 0);
      return total + (price * item.quantity);
    }, 0);
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    $(".cart-badge").text(count);
    if (count > 0) {
      $(".cart-badge").removeClass("d-none");
    } else {
      $(".cart-badge").addClass("d-none");
    }
  }

  // Initialize cart badge on load
  $(function () {
    updateCartBadge();
  });

  // Expose API
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


