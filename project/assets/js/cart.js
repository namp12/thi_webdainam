/**
 * Shopping Cart Management
 * Quản lý giỏ hàng tour du lịch
 */
(function () {
  const { API } = window.APP_CONFIG;
  const { http, storage, formatPrice, showToast } = window.APP_UTILS;
  const CART_KEY = "travel_cart";

  function getCart() {
    return storage.get(CART_KEY, []);
  }

  function saveCart(cart) {
    storage.set(CART_KEY, cart);
    updateCartBadge();
    // Trigger custom event for dashboard updates
    $(document).trigger('cartUpdated');
  }

  // Helper function to check if user is logged in
  function checkLogin() {
    const { getCurrentUser } = window.APP_AUTH || {};
    if (!getCurrentUser) return false;
    const user = getCurrentUser();
    return user !== null && user !== undefined;
  }

  // Helper function to get i18n text
  function getI18nText(key, fallback) {
    if (window.APP_LANG && window.APP_LANG[key]) {
      return window.APP_LANG[key];
    }
    return fallback;
  }

  function addToCart(tourId, quantity = 1, tourData = null) {
    // Check if user is logged in
    if (!checkLogin()) {
      const message = getI18nText("cart_login_required", "Vui lòng đăng nhập để thêm vào giỏ hàng");
      showToast(message, "warning");
      // Redirect to login page after a short delay
      setTimeout(() => {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${currentUrl}`;
      }, 2000);
      return false;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.tourId === tourId);

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
          
          // Track add to cart
          if (window.TRACKING) {
            window.TRACKING.trackAddToCart(tourId, tour, quantity);
          }
        }).catch(() => {
          showToast("Không thể thêm tour vào giỏ hàng", "danger");
        });
        return false;
      }
    }

    saveCart(cart);
    
    // Track add to cart
    if (window.TRACKING && tourData) {
      window.TRACKING.trackAddToCart(tourId, tourData, quantity);
    }
    
    showToast("Đã thêm vào giỏ hàng", "success");
    return true;
  }

  function removeFromCart(tourId) {
    const cart = getCart();
    const filtered = cart.filter(item => item.tourId !== tourId);
    saveCart(filtered);
    showToast("Đã xóa khỏi giỏ hàng", "success");
  }

  function updateQuantity(tourId, quantity) {
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
      const price = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
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


