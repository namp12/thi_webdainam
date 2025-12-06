(function () {
  const { API } = window.APP_CONFIG;
  const { http, formatPrice, formatDuration, showToast } = window.APP_UTILS;
  const { getCurrentUser } = window.APP_AUTH || {};
  const { add: addFavorite } = window.APP_FAVORITES || {};

  function getTourId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  async function loadTour() {
    const id = getTourId();
    if (!id) {
      showToast("Không tìm thấy tour", "danger");
      window.location.href = "tours.html";
      return;
    }

    try {
      const tour = await http.get(`${API.tours}/${id}`);
      renderTour(tour);
    } catch (err) {
      showToast("Không tải được tour", "danger");
      setTimeout(() => (window.location.href = "tours.html"), 2000);
    }
  }

  function renderTour(tour) {
    $("#tour-title").text(tour.title || "Tour");
    $("#tour-destination").html(`📍 ${tour.destination || ""}`);
    $("#tour-price").text(formatPrice(tour.price || 0));
    $("#tour-duration").text(formatDuration(tour.duration || 0));
    $("#tour-description").text(tour.description || "Chưa có mô tả.");
    $("#tour-start").text(tour.startDate || "Liên hệ");

    // Gallery
    const galleryHtml = `
      <div class="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
        <img src="${tour.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}" 
             class="w-100 h-100 object-fit-cover" alt="${tour.title}">
      </div>
    `;
    $("#tour-gallery").html(galleryHtml);

    // Itinerary
    if (tour.itinerary && Array.isArray(tour.itinerary)) {
      const itineraryHtml = `
        <div class="mt-4">
          <h5 class="mb-3">Lịch trình</h5>
          ${tour.itinerary
            .map(
              (item, idx) => `
            <div class="d-flex gap-3 mb-3">
              <div class="flex-shrink-0">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                     style="width: 40px; height: 40px; font-weight: 600;">${idx + 1}</div>
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-1">${item.title || `Ngày ${idx + 1}`}</h6>
                <p class="text-muted small mb-0">${item.description || ""}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      $("#tour-itinerary").html(itineraryHtml);
    } else {
      $("#tour-itinerary").html('<p class="text-muted">Lịch trình sẽ được cập nhật sớm.</p>');
    }

    // Reviews section
    loadReviews(tour.id);

    // Add to cart button
    if (window.APP_CART) {
      $("#btn-book").text("Thêm vào giỏ hàng").html('<i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng');
      $("#btn-book").on("click", () => {
        window.APP_CART.addToCart(tour.id, 1, tour);
        $("#btn-book").html('<i class="bi bi-check"></i> Đã thêm').prop("disabled", true);
        setTimeout(() => {
          $("#btn-book").html('<i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng').prop("disabled", false);
        }, 2000);
      });
    } else {
      // Fallback to booking
      $("#btn-book").on("click", () => {
        const user = getCurrentUser?.();
        if (!user) {
          showToast("Vui lòng đăng nhập để đặt tour", "warning");
          window.location.href = "login.html";
          return;
        }
        window.location.href = `booking.html?id=${tour.id}`;
      });
    }

    // Quick booking button (direct)
    if (!$("#btn-quick-book").length) {
      $("#btn-fav").after('<button class="btn btn-outline-success w-100 mb-2" id="btn-quick-book">Đặt ngay</button>');
      $("#btn-quick-book").on("click", () => {
        const user = getCurrentUser?.();
        if (!user) {
          showToast("Vui lòng đăng nhập để đặt tour", "warning");
          window.location.href = "login.html";
          return;
        }
        window.location.href = `booking.html?id=${tour.id}`;
      });
    }

    // Favorite button
    $("#btn-fav").on("click", () => {
      if (addFavorite) {
        addFavorite(tour.id);
        $("#btn-fav").html('<i class="bi bi-heart-fill"></i> Đã thêm vào yêu thích')
          .prop("disabled", true)
          .removeClass("btn-outline-danger")
          .addClass("btn-danger");
        showToast("Đã thêm vào yêu thích", "success");
      }
    });
  }

  async function loadReviews(tourId) {
    try {
      const reviews = window.APP_REVIEWS?.getAll?.() || [];
      const tourReviews = reviews.filter((r) => String(r.tourId) === String(tourId));
      if (!tourReviews.length) {
        $("#tour-reviews").html('<p class="text-muted">Chưa có đánh giá nào.</p>');
        return;
      }
      const html = `
        <h5 class="mb-3">Đánh giá (${tourReviews.length})</h5>
        ${tourReviews
          .map(
            (r) => `
          <div class="card mb-2">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong>${r.userName || "Khách"}</strong>
                  <div class="text-warning">${"★".repeat(r.rating || 0)}</div>
                </div>
                <small class="text-muted">${new Date(r.createdAt).toLocaleDateString("vi-VN")}</small>
              </div>
              <p class="mb-0">${r.comment || ""}</p>
            </div>
          </div>
        `
          )
          .join("")}
      `;
      $("#tour-reviews").html(html);
    } catch (err) {
      console.warn("Load reviews fail", err);
    }
  }

  $(function () {
    loadTour();
  });
})();


