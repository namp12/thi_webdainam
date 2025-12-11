/**
 * Dashboard Links Integration
 * Tạo liên kết chặt chẽ giữa dashboard và các trang giỏ hàng, yêu thích, thanh toán
 */
(function () {
  const { storage } = window.APP_UTILS;

  // Check if user is admin
  function isAdmin() {
    const user = storage.get("travel_user", null);
    if (!user) return false;
    return user.role === "admin" || (user.email && user.email.toLowerCase().includes("admin"));
  }

  // Show admin links if user is admin
  function showAdminLinks() {
    if (isAdmin()) {
      $(".admin-link").removeClass("d-none");
    }
  }

  // Real-time updates for dashboard
  function updateDashboardStats() {
    if (!window.location.pathname.includes("admin-dashboard")) return;

    try {
      const cart = JSON.parse(localStorage.getItem("travel_cart") || "[]");
      const favorites = JSON.parse(localStorage.getItem("travel_favorites") || "[]");
      const bookings = JSON.parse(localStorage.getItem("travel_bookings") || "[]");

      // Update cart stats
      const cartTotal = cart.reduce((sum, item) => {
        const parsedPrice = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
        return sum + (parsedPrice * item.quantity);
      }, 0);
      const cartAvg = cart.length > 0 ? cartTotal / cart.length : 0;
      
      if ($("#stat-cart-count").length) {
        $("#stat-cart-count").text(cart.length);
      }
      if ($("#stat-cart-total").length) {
        $("#stat-cart-total").text(window.APP_UTILS?.formatPrice(cartTotal) || `${cartTotal.toLocaleString()}đ`);
      }
      if ($("#stat-cart-avg").length) {
        $("#stat-cart-avg").text(window.APP_UTILS?.formatPrice(cartAvg) || `${cartAvg.toLocaleString()}đ`);
      }

      // Update favorites stats
      const today = new Date().toISOString().split('T')[0];
      const favoritesToday = favorites.filter(f => {
        const addedDate = f.addedAt ? new Date(f.addedAt).toISOString().split('T')[0] : '';
        return addedDate === today;
      }).length;
      const favConversionRate = favorites.length > 0 && bookings.length > 0
        ? Math.round((bookings.length / favorites.length) * 100)
        : 0;
      
      if ($("#stat-favorites-count").length) {
        $("#stat-favorites-count").text(favorites.length);
      }
      if ($("#stat-favorites-today").length) {
        $("#stat-favorites-today").text(favoritesToday);
      }
      if ($("#stat-fav-conversion").length) {
        $("#stat-fav-conversion").text(`${favConversionRate}%`);
      }
    } catch (err) {
      console.warn("Error updating dashboard stats:", err);
    }
  }

  // Listen for storage changes (cart, favorites updates)
  function initStorageListener() {
    // Listen for same-tab updates (using custom events)
    $(document).on('cartUpdated', function() {
      updateDashboardStats();
    });

    $(document).on('favoritesUpdated', function() {
      updateDashboardStats();
    });

    $(document).on('bookingUpdated', function() {
      updateDashboardStats();
    });

    // Also listen for localStorage changes from other tabs
    window.addEventListener('storage', function(e) {
      if (e.key === 'travel_cart' || e.key === 'travel_favorites' || e.key === 'travel_bookings') {
        updateDashboardStats();
      }
    });
  }

  // Initialize
  $(function () {
    showAdminLinks();
    updateDashboardStats();
    initStorageListener();

    // Update stats every 5 seconds if on dashboard
    if (window.location.pathname.includes("admin-dashboard")) {
      setInterval(updateDashboardStats, 5000);
    }
  });
})();

