(function () {
  const { storage, showToast } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;
  const { http } = window.APP_UTILS;
  const KEY = "travel_favorites";

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

  function getAll() {
    return storage.get(KEY, []);
  }

  function save(list) {
    storage.set(KEY, list);
    // Trigger custom event for dashboard updates
    $(document).trigger('favoritesUpdated');
  }

  function add(id, note = "", tourData = null) {
    // Check if user is logged in
    if (!checkLogin()) {
      const message = getI18nText("favorites_login_required", "Vui lòng đăng nhập để thêm vào yêu thích");
      showToast(message, "warning");
      // Redirect to login page after a short delay
      setTimeout(() => {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${currentUrl}`;
      }, 2000);
      return false;
    }

    const list = getAll();
    if (list.some((f) => f.id === String(id))) {
      showToast("Đã có trong yêu thích", "info");
      return false;
    }
    list.push({ id: String(id), note, addedAt: new Date().toISOString() });
    save(list);
    
    // Track add to favorites
    if (window.TRACKING && tourData) {
      window.TRACKING.trackAddToFavorites(id, tourData);
    }
    
    showToast("Đã thêm vào yêu thích", "success");
    return true;
  }

  function remove(id) {
    const list = getAll().filter((f) => f.id !== String(id));
    save(list);
    renderPage();
  }

  function updateNote(id, note) {
    const list = getAll();
    const target = list.find((f) => f.id === String(id));
    if (target) target.note = note;
    save(list);
    showToast("Đã lưu ghi chú", "success");
  }

  async function renderPage() {
    const $wrap = $("#fav-list");
    if (!$wrap.length) return;
    const favIds = getAll();
    
    // Update stats
    updateStats(favIds.length);
    
    if (!favIds.length) {
      const emptyText = window.APP_LANG?.favorites_empty || "Chưa có tour yêu thích";
      const emptyDesc = window.APP_LANG?.favorites_empty_desc || "Bạn chưa lưu tour nào vào danh sách yêu thích. Hãy khám phá các tour và thêm vào yêu thích để dễ dàng tìm lại sau!";
      $wrap.html(`
        <div class="favorites-empty">
          <i class="bi bi-heart favorites-empty-icon"></i>
          <h4>${emptyText}</h4>
          <p>${emptyDesc}</p>
          <div class="favorites-empty-actions">
            <a href="tours.html" class="btn btn-primary btn-lg">
              <i class="bi bi-compass me-2"></i>${window.APP_LANG?.favorites_view_tours || "Khám phá tour"}
            </a>
            <a href="promotions.html" class="btn btn-outline-primary btn-lg">
              <i class="bi bi-gift me-2"></i>Xem khuyến mãi
            </a>
          </div>
        </div>
      `);
      return;
    }
    try {
      const tours = await http.get(`${API.tours}`);
      const merged = favIds
        .map((f) => {
          const tour = tours.find((t) => String(t.id) === f.id);
          if (!tour) return null;
          
          // Parse price
          const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
          
          // Calculate pricing with promotions
          let pricing = { 
            originalPrice: parsedPrice, 
            finalPrice: parsedPrice, 
            discount: 0, 
            discountPercent: 0, 
            promotion: null 
          };
          if (window.PRICING_MANAGER) {
            pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
          }
          
          return {
            ...f,
            tour: { ...tour, price: parsedPrice },
            pricing
          };
        })
        .filter((x) => x !== null);
      
      const html = merged
        .map(
          (item) => {
            const hasPromotion = item.pricing.promotion !== null;
            // Lấy ảnh từ mapping hoặc auto-detect
            const imageSrc = window.IMAGE_MAPPING?.getTourImage(item.tour) || `assets/img/tours/${item.tour.id}.jpg`;
            const fallbackImage = window.IMAGE_MAPPING?.getTourFallbackImage(item.tour) || 'assets/img/banners/placeholder.jpg';
            
            return `
          <div class="favorite-card">
            <div class="favorite-card-body">
              <div class="favorite-card-image-wrapper">
                <img src="${imageSrc}" 
                     alt="${item.tour.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="favorite-heart-badge">
                  <i class="bi bi-heart-fill"></i>
                </div>
              </div>
              <div class="favorite-card-content">
                <div class="favorite-card-header">
                  <div class="flex-grow-1">
                    <h5 class="favorite-card-title">${item.tour.title}</h5>
                    <div class="favorite-card-destination">
                      <i class="bi bi-geo-alt-fill"></i>
                      <span>${item.tour.destination || "Điểm đến"}</span>
                    </div>
                  </div>
                </div>
                <div class="favorite-card-meta">
                  <div class="favorite-rating">
                    <i class="bi bi-star-fill"></i>
                    <span>${item.tour.rating || "4.6"}</span>
                    <span class="text-muted small ms-1">(${item.tour.reviews || "128"} đánh giá)</span>
                  </div>
                  <div class="favorite-duration">
                    <i class="bi bi-clock"></i>
                    <span>${item.tour.duration || 0} ngày</span>
                  </div>
                </div>
                <div class="favorite-price-section">
                  ${hasPromotion ? `
                    <div class="favorite-price-label">Giá gốc</div>
                    <div class="favorite-price-original">${window.APP_UTILS.formatPrice(item.pricing.originalPrice)}</div>
                    <div class="favorite-price-label text-success mt-2">Giá khuyến mãi</div>
                    <div class="favorite-price-value text-danger" style="font-size: 1.5rem;">${window.APP_UTILS.formatPrice(item.pricing.finalPrice)}</div>
                    ${item.pricing.discountPercent > 0 ? `
                    <div class="favorite-price-discount">
                      <i class="bi bi-check-circle"></i>
                      Tiết kiệm ${item.pricing.discountPercent}%
                    </div>
                    ` : ''}
                  ` : `
                    <div class="favorite-price-label">Giá tour</div>
                    <div class="favorite-price-value">${window.APP_UTILS.formatPrice(item.pricing.finalPrice)}</div>
                  `}
                </div>
                ${item.tour.description ? `
                <p class="small text-muted" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6;">
                  ${item.tour.description}
                </p>
                ` : ''}
                <div class="favorite-note-section">
                  <div class="favorite-note-label">
                    <i class="bi bi-sticky"></i>
                    <span>${window.APP_LANG?.favorites_note || "Ghi chú của bạn"}</span>
                  </div>
                  <textarea class="favorite-note-input note-input" data-id="${item.id}" rows="2" 
                    placeholder="${window.APP_LANG?.favorites_note_placeholder || "Thêm ghi chú cho tour này..."}">${item.note || ""}</textarea>
                </div>
                <div class="favorite-card-actions">
                  <a href="tour-detail.html?id=${item.tour.id}" class="btn btn-favorite-detail">
                    <i class="bi bi-eye"></i>
                    <span>Xem chi tiết</span>
                  </a>
                  <button class="btn btn-favorite-cart add-to-cart-from-fav" data-id="${item.tour.id}" data-tour='${JSON.stringify(item.tour).replace(/'/g, "&#39;")}'>
                    <i class="bi bi-cart-plus"></i>
                    <span>Thêm giỏ hàng</span>
                  </button>
                  <button class="btn btn-favorite-remove remove-fav" data-id="${item.id}">
                    <i class="bi bi-heart-break"></i>
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>`;
          }
        )
        .join("");
      $wrap.html(html);
    } catch (err) {
      showToast("Không tải được yêu thích", "danger");
    }
  }

  // Update stats
  function updateStats(total) {
    const $stats = $("#favorites-stats");
    if (!$stats.length) return;
    
    if (total === 0) {
      $stats.hide();
      return;
    }
    
    $stats.show();
    
    // Calculate today's additions
    const today = new Date().toISOString().split('T')[0];
    const todayCount = getAll().filter(f => {
      const addedDate = f.addedAt ? new Date(f.addedAt).toISOString().split('T')[0] : '';
      return addedDate === today;
    }).length;
    
    // Calculate conversion rate (favorites -> bookings)
    const bookings = JSON.parse(localStorage.getItem("travel_bookings") || "[]");
    const conversionRate = total > 0 
      ? Math.round((bookings.length / total) * 100)
      : 0;
    
    $("#fav-stat-total").text(total);
    $("#fav-stat-today").text(todayCount);
    $("#fav-stat-converted").text(`${conversionRate}%`);
  }

  $(function () {
    renderPage();
    
    // Remove favorite
    $("#fav-list").on("click", ".remove-fav", function () {
      const id = $(this).data("id");
      if (confirm("Bạn có chắc muốn xóa tour này khỏi yêu thích?")) {
        remove(id);
      }
    });
    
    // Update note
    $("#fav-list").on("change", ".note-input", function () {
      updateNote($(this).data("id"), $(this).val());
    });
    
    // Add to cart from favorites
    $("#fav-list").on("click", ".add-to-cart-from-fav", function () {
      const id = $(this).data("id");
      const tourData = $(this).data("tour");
      if (window.APP_CART) {
        window.APP_CART.addToCart(id, 1, tourData);
        showToast("Đã thêm vào giỏ hàng", "success");
        
        // Track add to cart
        if (window.TRACKING) {
          window.TRACKING.trackAddToCart(id, tourData, 1);
        }
      }
    });
    
    // Listen for favorites updates
    $(document).on('favoritesUpdated', function() {
      renderPage();
    });
  });

  window.APP_FAVORITES = { add, remove, getAll };
})();



