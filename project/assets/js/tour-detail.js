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
      // Try to fetch individual tour first
      const tour = await http.get(`${API.tours}/${id}`);
      renderTour(tour);
    } catch (err) {
      console.warn("Không thể load tour trực tiếp, thử fallback...", err);
      
      // Fallback: Load all tours and filter by ID
      try {
        const allTours = await http.get(API.tours);
        const tour = allTours.find(t => String(t.id) === String(id));
        
        if (tour) {
          console.log("✅ Đã tìm thấy tour từ danh sách:", tour.title);
          renderTour(tour);
        } else {
          // Try loading from local sample data as last resort
          const fallbackRes = await fetch("data/sample-tours.json");
          const fallbackData = await fallbackRes.json();
          const localTour = fallbackData.find(t => String(t.id) === String(id));
          
          if (localTour) {
            console.log("✅ Đã tìm thấy tour từ dữ liệu mẫu:", localTour.title);
            showToast("Đang dùng dữ liệu mẫu", "warning");
            renderTour(localTour);
          } else {
            showToast("Không tìm thấy tour", "danger");
            setTimeout(() => (window.location.href = "tours.html"), 2000);
          }
        }
      } catch (fallbackErr) {
        console.error("❌ Tất cả phương thức load đều thất bại:", fallbackErr);
        showToast("Không tải được tour", "danger");
        setTimeout(() => (window.location.href = "tours.html"), 2000);
      }
    }
  }

  function renderTour(tour) {
    $("#tour-title").text(tour.title || "Tour");
    $("#tour-destination").html(`<i class="bi bi-geo-alt-fill text-primary me-2"></i>${tour.destination || ""}`);
    $("#tour-price").html(`<span class="badge bg-success fs-5">${formatPrice(tour.price || 0)}</span>`);
    $("#tour-duration").html(`<i class="bi bi-calendar-event me-2"></i>${formatDuration(tour.duration || 0)}`);
    $("#tour-description").text(tour.description || "Chưa có mô tả.");
    $("#tour-start").html(`<i class="bi bi-calendar-check me-2"></i>${tour.startDate || "Liên hệ"}`);

    // Gallery - Cải thiện với carousel nếu có nhiều ảnh, nhưng giữ đơn giản
    const imageSrc = window.IMAGE_MAPPING?.getTourImage(tour) || tour.image || "https://quynhonland.com.vn/wp-content/uploads/2019/08/dulichquynhon-4.jpg";
    const fallbackImage = window.IMAGE_MAPPING?.getTourFallbackImage(tour) || 'assets/img/banners/placeholder.jpg';
    const galleryHtml = `
      <div class="ratio ratio-16x9 rounded overflow-hidden shadow-lg animate-fade-in">
        <img src="${imageSrc}" 
             class="w-100 h-100 object-fit-cover" 
             alt="${tour.title}" 
             loading="lazy"
             onerror="this.src='${fallbackImage}'">
      </div>
    `;
    $("#tour-gallery").html(galleryHtml);

    // Itinerary - Sử dụng accordion cho đẹp và responsive
    if (tour.itinerary && Array.isArray(tour.itinerary)) {
      const itineraryHtml = `
        <div class="mt-4 animate-fade-in-up">
          <h5 class="mb-3 fw-bold text-primary"><i class="bi bi-map me-2"></i>Lịch trình</h5>
          <div class="accordion accordion-flush" id="itineraryAccordion">
            ${tour.itinerary
              .map(
                (item, idx) => `
              <div class="accordion-item">
                <h2 class="accordion-header" id="itineraryHeading${idx}">
                  <button class="accordion-button ${idx !== 0 ? 'collapsed' : ''}" type="button" 
                          data-bs-toggle="collapse" data-bs-target="#itineraryCollapse${idx}" 
                          aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="itineraryCollapse${idx}">
                    <span class="badge bg-primary me-3">${idx + 1}</span> ${item.title || `Ngày ${idx + 1}`}
                  </button>
                </h2>
                <div id="itineraryCollapse${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" 
                     aria-labelledby="itineraryHeading${idx}">
                  <div class="accordion-body text-muted">
                    ${item.description || "Chi tiết lịch trình sẽ được cập nhật."}
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      $("#tour-itinerary").html(itineraryHtml);
    } else {
      $("#tour-itinerary").html('<div class="alert alert-info mt-3"><i class="bi bi-info-circle me-2"></i>Lịch trình sẽ được cập nhật sớm.</div>');
    }

    // Reviews section - Cải thiện với pagination nếu nhiều, nhưng giữ đơn giản
    loadReviews(tour.id);

    // Add to cart button
    if (window.APP_CART) {
      $("#btn-book").html('<i class="bi bi-cart-plus me-2"></i>Thêm vào giỏ hàng').addClass("btn btn-outline-primary w-100 mb-2");
      $("#btn-book").on("click", () => {
        window.APP_CART.addToCart(tour.id, 1, tour);
        $("#btn-book").html('<i class="bi bi-check-circle me-2"></i>Đã thêm').prop("disabled", true).addClass("btn-success").removeClass("btn-outline-primary");
        setTimeout(() => {
          $("#btn-book").html('<i class="bi bi-cart-plus me-2"></i>Thêm vào giỏ hàng').prop("disabled", false).addClass("btn-outline-primary").removeClass("btn-success");
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
      $("#btn-fav").after('<button class="btn btn-success w-100 mb-2" id="btn-quick-book"><i class="bi bi-lightning-charge me-2"></i>Đặt ngay</button>');
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
    $("#btn-fav").html('<i class="bi bi-heart me-2"></i>Thêm yêu thích').addClass("btn btn-outline-danger w-100");
    $("#btn-fav").on("click", () => {
      if (addFavorite) {
        addFavorite(tour.id);
        $("#btn-fav").html('<i class="bi bi-heart-fill me-2"></i>Đã thêm yêu thích')
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
        $("#tour-reviews").html('<div class="alert alert-info mt-3"><i class="bi bi-chat-dots me-2"></i>Chưa có đánh giá nào. Hãy là người đầu tiên!</div>');
        return;
      }
      const html = `
        <h5 class="mb-3 fw-bold text-primary"><i class="bi bi-chat-square-text me-2"></i>Đánh giá (${tourReviews.length})</h5>
        ${tourReviews
          .map(
            (r) => `
          <div class="card mb-3 shadow-sm animate-fade-in">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong class="me-2">${r.userName || "Khách"}</strong>
                  <div class="text-warning d-inline">${Array.from({length: r.rating || 0}, () => '<i class="bi bi-star-fill"></i>').join('')}${Array.from({length: 5 - (r.rating || 0)}, () => '<i class="bi bi-star"></i>').join('')}</div>
                </div>
                <small class="text-muted">${new Date(r.createdAt).toLocaleDateString("vi-VN")}</small>
              </div>
              <p class="mb-0 text-muted">${r.comment || ""}</p>
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