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

      // Calculate revenue statistics - CORRECTED
      // Gross Revenue: Tổng giá trị tất cả giao dịch đã hoàn tất (Completed)
      const completedBookings = bookings.filter(b => 
        b.status === "confirmed" || 
        b.status === "paid" || 
        b.status === "completed"
      );
      const grossRevenue = completedBookings.reduce((sum, b) => {
        const parsedPrice = window.APP_UTILS?.parsePrice(b.total) || Number(b.total || 0);
        return sum + parsedPrice;
      }, 0);
      
      // Calculate total discount given from all bookings
      const totalDiscountGiven = completedBookings.reduce((sum, b) => {
        const discount = Number(b.discount || 0);
        return sum + discount;
      }, 0);
      
      // Net Revenue: Gross Revenue - Discounts + Service Fee (5%)
      // Service fee is already included in total, so we calculate it
      const netRevenue = grossRevenue - totalDiscountGiven;
      
      // Paid Revenue (same as gross for completed bookings)
      const paidRevenue = grossRevenue;
      
      // Pending Revenue
      const pendingBookings = bookings.filter(b => b.status === "pending");
      const pendingRevenue = pendingBookings.reduce((sum, b) => {
        const parsedPrice = window.APP_UTILS?.parsePrice(b.total) || Number(b.total || 0);
        return sum + parsedPrice;
      }, 0);
      
      // Conversion Rate: (Số đơn hàng đã thanh toán / Số lượt Thêm giỏ hàng)
      const totalAddToCart = window.TRACKING ? window.TRACKING.getStats('all').addToCart.count : cart.length;
      const conversionRate = totalAddToCart > 0 
        ? Math.round((completedBookings.length / totalAddToCart) * 100 * 100) / 100
        : 0;

      // Update stats
      $("#stat-users").text(users.length || 0);
      $("#stat-tours").text(tours.length || 0);
      $("#stat-bookings").text(bookings.length || 0);
      $("#stat-revenue").text(formatPrice(grossRevenue));
      
      // Update booking description
      const confirmedCount = completedBookings.length;
      const pendingCount = pendingBookings.length;
      $("#stat-bookings-desc").text(`${confirmedCount} đã xác nhận, ${pendingCount} chờ duyệt`);
      
      // Update revenue description
      $("#stat-revenue-desc").text(`${formatPrice(paidRevenue)} đã thanh toán`);

      // Update payment statistics with correct calculations
      $("#total-revenue").text(formatPrice(grossRevenue));
      $("#paid-revenue").text(formatPrice(paidRevenue));
      $("#pending-revenue").text(formatPrice(pendingRevenue));
      $("#conversion-rate").text(`${conversionRate}%`);
      
      // Update discount and net revenue if elements exist
      if ($("#stat-total-discount-given").length) {
        $("#stat-total-discount-given").text(formatPrice(totalDiscountGiven));
      }
      if ($("#stat-net-revenue").length) {
        $("#stat-net-revenue").text(formatPrice(netRevenue));
      }

      // Update cart statistics
      const cartTotal = cart.reduce((sum, item) => {
        const parsedPrice = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
        return sum + (parsedPrice * item.quantity);
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

      // Update tracking and analytics
      if (window.TRACKING) {
        updateTrackingStats();
        updatePromotionPerformance();
        updateDiscountCodeAnalytics();
      }
    } catch (err) {
      showToast("Không tải được thống kê", "danger");
    }
  }

  // Update tracking statistics
  function updateTrackingStats() {
    if (!window.TRACKING) return;

    const stats = window.TRACKING.getStats('all');
    
    // Update funnel tracking if elements exist
    if ($("#stat-add-to-cart").length) {
      $("#stat-add-to-cart").text(stats.addToCart.count);
    }
    if ($("#stat-add-to-favorites").length) {
      $("#stat-add-to-favorites").text(stats.addToFavorites.count);
    }
    if ($("#stat-checkout-started").length) {
      $("#stat-checkout-started").text(stats.checkoutStarted.count);
    }
    if ($("#stat-checkout-completed").length) {
      $("#stat-checkout-completed").text(stats.checkoutCompleted.count);
    }
    if ($("#stat-conversion-rate-funnel").length) {
      $("#stat-conversion-rate-funnel").text(`${stats.conversionRate}%`);
      // Update progress bar
      const $progressBar = $("#conversion-progress-bar");
      if ($progressBar.length) {
        $progressBar.css("width", `${stats.conversionRate}%`).attr("aria-valuenow", stats.conversionRate);
      }
    }
  }

  // Update promotion performance
  function updatePromotionPerformance() {
    if (!window.TRACKING) return;

    const stats = window.TRACKING.getStats('all');
    
    // Update promotion stats if elements exist
    if ($("#stat-discount-codes-used").length) {
      $("#stat-discount-codes-used").text(stats.discountCodesUsed.count);
    }
    if ($("#stat-discount-usage-rate").length) {
      $("#stat-discount-usage-rate").text(`${stats.discountUsageRate}%`);
    }
    if ($("#stat-total-discount-given").length) {
      $("#stat-total-discount-given").text(formatPrice(stats.totalDiscountGiven));
    }
    if ($("#stat-net-revenue").length) {
      $("#stat-net-revenue").text(formatPrice(stats.netRevenue));
    }
  }

  // Update discount code analytics
  function updateDiscountCodeAnalytics() {
    if (!window.TRACKING) return;

    const discounts = JSON.parse(localStorage.getItem("travel_discounts") || "[]");
    const $container = $("#discount-codes-analytics");
    
    if (!$container.length) return;

    if (discounts.length === 0) {
      $container.html('<p class="text-muted text-center py-3">Chưa có mã giảm giá nào</p>');
      return;
    }

    const html = discounts.map(discount => {
      const analysis = window.TRACKING.getDiscountCodeAnalysis(discount.code);
      
      return `
        <div class="card mb-3 border-0 shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-0 fw-bold">${discount.code}</h6>
                <small class="text-muted">${discount.title || 'Mã giảm giá'}</small>
              </div>
              <span class="badge ${discount.active ? 'bg-success' : 'bg-secondary'}">
                ${discount.active ? 'Đang hoạt động' : 'Đã tắt'}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <div class="text-center p-2 bg-light rounded">
                  <div class="text-muted small mb-1">Tỷ lệ chuyển đổi</div>
                  <div class="fw-bold text-primary fs-5">${analysis.conversionRate}%</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center p-2 bg-light rounded">
                  <div class="text-muted small mb-1">Số lần sử dụng</div>
                  <div class="fw-bold text-success fs-5">${analysis.usageCount}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center p-2 bg-light rounded">
                  <div class="text-muted small mb-1">Doanh thu</div>
                  <div class="fw-bold text-info fs-6">${formatPrice(analysis.totalRevenue)}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center p-2 bg-light rounded">
                  <div class="text-muted small mb-1">Giảm giá TB</div>
                  <div class="fw-bold text-warning fs-6">${formatPrice(analysis.averageDiscount)}</div>
                </div>
              </div>
            </div>
            ${analysis.customers.length > 0 ? `
              <div class="mt-3">
                <h6 class="small fw-bold mb-2">Khách hàng đã sử dụng (${analysis.customers.length})</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Tên</th>
                        <th>Mã đặt</th>
                        <th>Tổng tiền</th>
                        <th>Giảm giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${analysis.customers.slice(0, 5).map(c => `
                        <tr>
                          <td>${c.email || 'N/A'}</td>
                          <td>${c.name || 'N/A'}</td>
                          <td><code>${c.bookingCode}</code></td>
                          <td>${formatPrice(c.total)}</td>
                          <td class="text-success">-${formatPrice(c.discount)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    $container.html(html);
  }

  function updateRecentActivity(bookings, tours, reviews, cart, favorites) {
    const activities = [];
    
    // Get tracking data for real-time activities
    const trackingData = window.TRACKING ? window.TRACKING.getTrackingData() : null;
    
    // Recent cart additions from tracking
    if (trackingData && trackingData.addToCart && trackingData.addToCart.length > 0) {
      const recentCartItems = trackingData.addToCart
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
      
      recentCartItems.forEach(item => {
        const addedDate = new Date(item.timestamp);
        const timeAgo = getTimeAgo(addedDate);
        const parsedPrice = window.APP_UTILS?.parsePrice(item.price) || Number(item.price || 0);
        activities.push({
          type: "cart",
          text: `Thêm vào giỏ hàng`,
          subtext: `${item.tourTitle || 'Tour'} • ${item.quantity} người`,
          amount: formatPrice(parsedPrice * item.quantity),
          time: timeAgo,
          color: "blue",
          link: "cart.html"
        });
      });
    }
    
    // Recent favorites from tracking
    if (trackingData && trackingData.addToFavorites && trackingData.addToFavorites.length > 0) {
      const recentFavorites = trackingData.addToFavorites
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 2);
      
      recentFavorites.forEach(item => {
        const addedDate = new Date(item.timestamp);
        const timeAgo = getTimeAgo(addedDate);
        activities.push({
          type: "favorite",
          text: `Thêm vào yêu thích`,
          subtext: `${item.tourTitle || 'Tour'}`,
          amount: "",
          time: timeAgo,
          color: "purple",
          link: "favorites.html"
        });
      });
    }
    
    // Discount code usage from tracking
    if (trackingData && trackingData.discountCodesUsed && trackingData.discountCodesUsed.length > 0) {
      const recentDiscounts = trackingData.discountCodesUsed
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 2);
      
      recentDiscounts.forEach(item => {
        const addedDate = new Date(item.timestamp);
        const timeAgo = getTimeAgo(addedDate);
        activities.push({
          type: "discount",
          text: `Sử dụng mã giảm giá`,
          subtext: `Mã: ${item.code} • Giảm ${formatPrice(item.discountAmount)}`,
          amount: formatPrice(item.orderTotal),
          time: timeAgo,
          color: "green",
          link: "promotions.html"
        });
      });
    }

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
        : act.type === "discount"
        ? '<i class="bi bi-tag-fill text-success"></i>'
        : act.type === "cancelled"
        ? '<i class="bi bi-x-circle-fill text-danger"></i>'
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
    
    // Auto-refresh stats every 5 seconds for real-time updates
    setInterval(() => {
      if (window.TRACKING) {
        updateTrackingStats();
        updatePromotionPerformance();
        updateDiscountCodeAnalytics();
      }
    }, 5000);
    
    // Listen for tracking events
    $(document).on('trackingUpdated', function() {
      updateTrackingStats();
      updatePromotionPerformance();
    });
    
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


