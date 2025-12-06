(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast, formatPrice } = window.APP_UTILS;

  async function loadStats() {
    try {
      const [users, tours] = await Promise.all([
        http.get(API.users).catch(() => []),
        http.get(API.tours).catch(() => []),
      ]);

      const bookings = JSON.parse(localStorage.getItem("travel_bookings") || "[]");
      const reviews = JSON.parse(localStorage.getItem("travel_reviews") || "[]");
      const cart = JSON.parse(localStorage.getItem("travel_cart") || "[]");
      const favorites = JSON.parse(localStorage.getItem("travel_favorites") || "[]");

      // Calculate revenue statistics
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "paid");
      const paidRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      const pendingBookings = bookings.filter(b => b.status === "pending");
      const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
      
      // Calculate conversion rate (bookings / (bookings + cart items))
      const totalCartItems = cart.length;
      const totalInteractions = bookings.length + totalCartItems;
      const conversionRate = totalInteractions > 0 
        ? Math.round((bookings.length / totalInteractions) * 100) 
        : 0;

      // Update stats
      $("#stat-users").text(users.length || 0);
      $("#stat-tours").text(tours.length || 0);
      $("#stat-bookings").text(bookings.length || 0);
      $("#stat-revenue").text(formatPrice(totalRevenue));
      
      // Update booking description
      const confirmedCount = confirmedBookings.length;
      const pendingCount = pendingBookings.length;
      $("#stat-bookings-desc").text(`${confirmedCount} đã xác nhận, ${pendingCount} chờ duyệt`);
      
      // Update revenue description
      $("#stat-revenue-desc").text(`${formatPrice(paidRevenue)} đã thanh toán`);

      // Update payment statistics
      $("#total-revenue").text(formatPrice(totalRevenue));
      $("#paid-revenue").text(formatPrice(paidRevenue));
      $("#pending-revenue").text(formatPrice(pendingRevenue));
      $("#conversion-rate").text(`${conversionRate}%`);

      // Update cart statistics
      const cartTotal = cart.reduce((sum, item) => {
        return sum + (Number(item.tour?.price || 0) * item.quantity);
      }, 0);
      const cartAvg = cart.length > 0 ? cartTotal / cart.length : 0;
      $("#stat-cart-count").text(cart.length);
      $("#stat-cart-total").text(formatPrice(cartTotal));
      $("#stat-cart-avg").text(formatPrice(cartAvg));

      // Update favorites statistics
      const today = new Date().toISOString().split('T')[0];
      const favoritesToday = favorites.filter(f => {
        const addedDate = f.addedAt ? new Date(f.addedAt).toISOString().split('T')[0] : '';
        return addedDate === today;
      }).length;
      const favConversionRate = favorites.length > 0 && bookings.length > 0
        ? Math.round((bookings.length / favorites.length) * 100)
        : 0;
      $("#stat-favorites-count").text(favorites.length);
      $("#stat-favorites-today").text(favoritesToday);
      $("#stat-fav-conversion").text(`${favConversionRate}%`);

      // Update recent activity with actual bookings
      updateRecentActivity(bookings, tours, reviews, cart, favorites);
      
      // Update tour performance
      updateTourPerformance(tours, bookings);
      
      // Update top destinations
      updateTopDestinations(tours);
    } catch (err) {
      showToast("Không tải được thống kê", "danger");
    }
  }

  function updateRecentActivity(bookings, tours, reviews, cart, favorites) {
    const activities = [];
    
    // Recent cart additions
    const recentCartItems = cart
      .filter(item => item.addedAt)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 2);
    
    recentCartItems.forEach(item => {
      const addedDate = new Date(item.addedAt);
      const timeAgo = getTimeAgo(addedDate);
      activities.push({
        type: "cart",
        text: `Thêm vào giỏ hàng`,
        subtext: `${item.tour?.title || 'Tour'} • ${item.quantity} người`,
        amount: formatPrice((item.tour?.price || 0) * item.quantity),
        time: timeAgo,
        color: "blue",
        link: "cart.html"
      });
    });

    // Recent favorites
    const recentFavorites = favorites
      .filter(f => f.addedAt)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 2);
    
    recentFavorites.forEach(fav => {
      const addedDate = new Date(fav.addedAt);
      const timeAgo = getTimeAgo(addedDate);
      activities.push({
        type: "favorite",
        text: `Thêm vào yêu thích`,
        subtext: `Tour #${fav.id}${fav.note ? ' • ' + fav.note : ''}`,
        amount: "",
        time: timeAgo,
        color: "purple",
        link: "favorites.html"
      });
    });
    
    // Recent bookings - show actual booking details
    const recentBookings = bookings.slice(-5).reverse();
    recentBookings.forEach(b => {
      const bookingDate = b.createdAt ? new Date(b.createdAt) : new Date();
      const timeAgo = getTimeAgo(bookingDate);
      const statusBadge = b.status === "confirmed" 
        ? '<span class="badge bg-success ms-2">Đã xác nhận</span>'
        : b.status === "paid"
        ? '<span class="badge bg-primary ms-2">Đã thanh toán</span>'
        : '<span class="badge bg-warning ms-2">Chờ duyệt</span>';
      
      const tourTitles = (b.tours || []).map(t => t.title || `Tour #${t.tourId}`).join(", ");
      const customerName = b.customer?.name || b.customerName || "Khách hàng";
      
      activities.push({
        type: "booking",
        text: `Đơn hàng ${b.code || b.id}`,
        subtext: `${customerName} • ${tourTitles || "Tour"}`,
        amount: formatPrice(b.total || 0),
        time: timeAgo,
        status: statusBadge,
        color: b.status === "confirmed" || b.status === "paid" ? "green" : "orange",
        link: `admin-booking.html#booking-${b.id}`
      });
    });

    // If no bookings, show placeholder
    if (activities.length === 0) {
      activities.push({
        type: "info",
        text: "Chưa có đơn hàng nào",
        subtext: "Đơn hàng mới sẽ hiển thị ở đây",
        time: "",
        color: "gray"
      });
    }

    // Sort activities by time (most recent first)
    activities.sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return new Date(b.time) - new Date(a.time);
    });

    // Render activities with booking details
    const html = activities.slice(0, 6).map((act, idx) => {
      if (act.type === "info") {
        return `
          <div class="activity-item text-center py-3">
            <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
            <div class="text-muted mt-2">${act.text}</div>
            <div class="text-muted small">${act.subtext}</div>
          </div>
        `;
      }
      
      const icon = act.type === "cart" 
        ? '<i class="bi bi-cart-plus text-primary"></i>'
        : act.type === "favorite"
        ? '<i class="bi bi-heart-fill text-danger"></i>'
        : '<i class="bi bi-receipt text-success"></i>';
      
      return `
        <div class="activity-item d-flex align-items-start gap-3 p-3 border-bottom">
          <span class="dot dot-${act.color} mt-1"></span>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <div>
                ${icon}
                <a href="${act.link || 'admin-booking.html'}" class="fw-semibold text-decoration-none ms-2">
                  ${act.text}
                </a>
                ${act.status || ''}
              </div>
              <div class="text-end">
                ${act.amount ? `<div class="fw-bold text-success">${act.amount}</div>` : ''}
                <div class="text-muted small">${act.time}</div>
              </div>
            </div>
            <div class="text-muted small">${act.subtext}</div>
          </div>
        </div>
      `;
    }).join("");

    $("#recent-activities").html(html || '<div class="text-muted text-center py-3">Chưa có hoạt động nào</div>');
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  }

  function updateTourPerformance(tours, bookings) {
    // Calculate by destination/category
    const categories = {
      "Biển": { tours: 0, bookings: 0 },
      "Núi": { tours: 0, bookings: 0 },
      "Văn hóa": { tours: 0, bookings: 0 }
    };

    tours.forEach(tour => {
      const dest = (tour.destination || "").toLowerCase();
      if (dest.includes("biển") || dest.includes("nha trang") || dest.includes("đà nẵng") || dest.includes("phú quốc")) {
        categories["Biển"].tours++;
      } else if (dest.includes("núi") || dest.includes("sapa") || dest.includes("đà lạt")) {
        categories["Núi"].tours++;
      } else {
        categories["Văn hóa"].tours++;
      }
    });

    // Calculate percentages based on total tours
    const total = tours.length || 1;
    const seaPercent = Math.min(100, Math.round((categories["Biển"].tours / total) * 100));
    const mountainPercent = Math.min(100, Math.round((categories["Núi"].tours / total) * 100));
    const culturePercent = Math.min(100, Math.round((categories["Văn hóa"].tours / total) * 100));

    // Animate progress bars
    setTimeout(() => {
      $("#bar-sea").css("width", `${seaPercent}%`).attr("aria-valuenow", seaPercent);
      $("#perf-sea").text(`${seaPercent}%`);
    }, 100);
    
    setTimeout(() => {
      $("#bar-mountain").css("width", `${mountainPercent}%`).attr("aria-valuenow", mountainPercent);
      $("#perf-mountain").text(`${mountainPercent}%`);
    }, 200);
    
    setTimeout(() => {
      $("#bar-culture").css("width", `${culturePercent}%`).attr("aria-valuenow", culturePercent);
      $("#perf-culture").text(`${culturePercent}%`);
    }, 300);
  }

  function updateTopDestinations(tours) {
    const destinations = {};
    tours.forEach(tour => {
      const dest = tour.destination || "Khác";
      destinations[dest] = (destinations[dest] || 0) + 1;
    });

    const topDests = Object.entries(destinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const html = topDests.map(([dest, count], idx) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <a href="category.html?cat=${encodeURIComponent(dest)}" class="text-decoration-none">${dest}</a>
        ${idx === 0 ? '<span class="badge bg-primary rounded-pill">Hot</span>' : `<span class="text-muted small">${count} tour</span>`}
      </li>
    `).join("");

    $(".list-group").html(html || '<li class="list-group-item text-muted text-center">Chưa có dữ liệu</li>');
  }

  $(function () {
    loadStats();
    
    // Make todo items clickable
    $(".todo-item input[type='checkbox']").on("change", function() {
      if ($(this).is(":checked")) {
        $(this).closest(".todo-item").addClass("text-decoration-line-through text-muted");
      } else {
        $(this).closest(".todo-item").removeClass("text-decoration-line-through text-muted");
      }
    });
  });
})();


