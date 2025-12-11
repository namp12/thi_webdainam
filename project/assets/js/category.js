(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast, formatPrice, formatDuration } = window.APP_UTILS;

  const $list = $("#tour-list");
  const $empty = $("#tour-empty");
  const $title = $("#category-title");

  function getCategory() {
    const params = new URLSearchParams(window.location.search);
    return params.get("cat") || "";
  }

  function render(items) {
    if (!$list.length) return;
    if (!items.length) {
      $list.empty();
      $empty.removeClass("d-none");
      return;
    }
    const html = items
      .map(
        (t) => {
          // Parse price from API format (handles "21,664,750 VND" format)
          const parsedPrice = window.APP_UTILS?.parsePrice(t.price) || Number(t.price) || 0;
          
          // Calculate pricing with promotions
          let pricing = { 
            originalPrice: parsedPrice, 
            finalPrice: parsedPrice, 
            discount: 0, 
            discountPercent: 0, 
            promotion: null 
          };
          if (window.PRICING_MANAGER) {
            pricing = window.PRICING_MANAGER.calculateFinalPrice(t);
          }

          const hasPromotion = pricing.promotion !== null;
          const badgeText = hasPromotion ? window.PRICING_MANAGER?.getPromotionBadge(pricing.promotion) : null;

          // Lấy ảnh từ mapping hoặc auto-detect
          const imageSrc = window.IMAGE_MAPPING?.getTourImage(t) || `assets/img/tours/${t.id}.jpg`;
          const fallbackImage = window.IMAGE_MAPPING?.getTourFallbackImage(t) || 'assets/img/banners/placeholder.jpg';

          return `
        <div class="col-md-4 mb-3">
          <div class="card h-100 shadow-sm tour-card">
            <div class="position-relative">
              <img src="${imageSrc}" 
                   class="card-img-top" 
                   alt="${t.title}"
                   loading="lazy"
                   onerror="this.onerror=null; this.src='${fallbackImage}';">
              ${hasPromotion && badgeText ? `
              <span class="badge badge-promotion position-absolute top-0 end-0 m-2">
                <i class="bi bi-tag-fill"></i> ${badgeText}
              </span>
              ` : ''}
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${t.title}</h5>
              <p class="small text-muted mb-2">${t.destination}</p>
              <div class="tour-price ${hasPromotion ? 'has-promotion' : ''} mb-3">
                ${hasPromotion ? `
                  <div class="price-container">
                    <span class="price-label text-muted small">Giá gốc</span>
                    <div class="price-main">
                      <span class="price-original text-muted text-decoration-line-through small">${formatPrice(pricing.originalPrice)}</span>
                    </div>
                    <span class="price-label text-success small mt-2">Giá khuyến mãi</span>
                    <div class="price-main">
                      <span class="fw-bold text-danger">${formatPrice(pricing.finalPrice)}</span>
                      ${pricing.discountPercent > 0 ? `
                      <span class="price-save-badge">Tiết kiệm ${pricing.discountPercent}%</span>
                      ` : ''}
                    </div>
                  </div>
                ` : `
                  <div class="price-container">
                    <span class="price-label text-muted small">Từ</span>
                    <div class="price-main">
                      <span class="fw-bold text-primary">${formatPrice(pricing.finalPrice)}</span>
                    </div>
                  </div>
                `}
              </div>
              <p class="small text-muted mb-2">${formatDuration(t.duration)}</p>
              <a href="tour-detail.html?id=${t.id}" class="btn btn-outline-primary btn-sm mt-auto">Chi tiết</a>
            </div>
          </div>
        </div>`;
        }
      )
      .join("");
    $list.html(html);
  }

  function fillDestinations(tours) {
    const $dest = $("#tour-destination");
    if (!$dest.length) return;
    const unique = Array.from(new Set(tours.map((t) => t.destination))).filter(Boolean);
    const options = ['<option value="">Tất cả địa điểm</option>', ...unique.map((d) => `<option value="${d}">${d}</option>`)];
    $dest.html(options.join(""));
  }

  function applyFilter(tours, cat) {
    let filtered = [...tours];
    
    if (cat) {
      filtered = filtered.filter(
        (t) =>
          (t.category || t.destination || "")
            .toLowerCase()
            .includes(cat.toLowerCase())
      );
    }

    const dest = $("#tour-destination").val();
    if (dest) {
      filtered = filtered.filter((t) => t.destination === dest);
    }

    const priceRange = $("#tour-price").val();
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((t) => {
        const price = Number(t.price) || 0;
        return price >= min && price <= max;
      });
    }

    return filtered;
  }

  async function load(cat) {
    try {
      const tours = await http.get(API.tours);
      fillDestinations(tours);
      
      if (cat) {
        $title.text(`Danh mục: ${cat}`);
      } else {
        $title.text("Tất cả tour");
      }

      const filtered = applyFilter(tours, cat);
      render(filtered);
    } catch (err) {
      showToast("Không tải được danh mục", "danger");
      console.error(err);
    }
  }

  $(function () {
    if (!$list.length) return;
    const cat = getCategory();
    
    load(cat);

    $("#tour-destination, #tour-price").on("change", function () {
      const cat = getCategory();
      http.get(API.tours).then((tours) => {
        const filtered = applyFilter(tours, cat);
        render(filtered);
      });
    });
  });
})();

