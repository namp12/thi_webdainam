(function () {
  const { API } = window.APP_CONFIG;
  const { http, debounce, formatPrice, formatDuration, showToast } = window.APP_UTILS;

  const $list = $("#tour-list");
  const $search = $("#tour-search");
  const $destination = $("#tour-destination");
  const $price = $("#tour-price");
  const $duration = $("#tour-duration");
  const $sort = $("#tour-sort");
  const $reset = $("#tour-reset");
  const $submit = $("#tour-submit");
  const $loading = $("#tour-loading");
  const $empty = $("#tour-empty");
  const $statTotal = $("#stat-total");
  const $statDest = $("#stat-dest");
  const $statPrice = $("#stat-price");
  const $hotList = $("#hot-tour-list");
  const $catList = $("#category-tour-list");
  const $catPills = $("#category-pills");

  // Sử dụng IMAGE_MAPPING từ image-mapping.js
  const getTourImage = (tour) => window.IMAGE_MAPPING?.getTourImage(tour) || `assets/img/tours/${tour.id}.jpg`;
  const getTourFallbackImage = (tour) => window.IMAGE_MAPPING?.getTourFallbackImage(tour) || 'assets/img/banners/placeholder.jpg';

  let tours = [];

  function showLoading(isLoading) {
    if (!$loading.length) return;
    $loading.toggleClass("d-none", !isLoading);
    $list.toggleClass("d-none", isLoading);
    $empty.addClass("d-none");
  }

  function renderStats(data) {
    if (!$statTotal.length) return;
    const total = data.length;
    const destCount = new Set(data.map((t) => t.destination)).size;
    
    // Use parsePrice to handle formatted price strings like "21,664,750 VND"
    const { parsePrice } = window.APP_UTILS || {};
    const avg = data.reduce((sum, t) => {
      const price = parsePrice ? parsePrice(t.price) : Number(t.price || 0);
      return sum + price;
    }, 0) / (total || 1);
    
    $statTotal.text(total);
    $statDest.text(destCount);
    $statPrice.text(formatPrice(Math.round(avg)) || "--");
  }

  function fillDestinations(data) {
    if (!$destination.length) return;
    const unique = Array.from(new Set(data.map((t) => t.destination))).filter(Boolean);
    const options = ['<option value="">Tất cả</option>', ...unique.map((d) => `<option value="${d}">${d}</option>`)];
    $destination.html(options.join(""));
  }

  function render(items) {
    if (!$list.length) return;
    $empty.addClass("d-none");
    
    if (!items.length) {
      $list.empty();
      $empty.removeClass("d-none");
      $empty.html(`
        <div class="text-center py-5">
          <div class="mb-3">
            <i class="bi bi-search" style="font-size: 4rem; color: #adb5bd;"></i>
          </div>
          <h5 class="text-muted mb-2">Không tìm thấy tour nào</h5>
          <p class="text-muted mb-3">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
          <button class="btn btn-outline-primary" onclick="$('#tour-reset').click();">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Xóa bộ lọc
          </button>
        </div>
      `);
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
          const imageSrc = getTourImage(t);
          const fallbackImage = getTourFallbackImage(t);
          
          return `
        <div class="col-md-6 mb-4">
          <div class="card h-100 tour-card tour-card-clickable" data-id="${t.id}">
            <div class="position-relative card-image-wrapper">
              <img src="${imageSrc}" 
                   class="card-img-top" 
                   alt="${t.title}"
                   loading="lazy"
                   onerror="this.onerror=null; this.src='${fallbackImage}';">
              <div class="card-overlay"></div>
              ${hasPromotion && badgeText ? `
              <span class="badge badge-promotion position-absolute top-0 end-0 m-2">
                <i class="bi bi-tag-fill"></i> ${badgeText}
              </span>
              ` : ''}
              <span class="badge badge-destination position-absolute top-0 start-0 m-2">
                <i class="bi bi-geo-alt-fill"></i> ${t.destination || "Điểm đến"}
              </span>
              <span class="badge badge-duration position-absolute top-0 end-0 m-2">
                <i class="bi bi-clock-fill"></i> ${formatDuration(t.duration)}
              </span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold mb-2" style="min-height: 3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.title}</h5>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="rating">
                  <i class="bi bi-star-fill"></i> ${t.rating || "4.6"}
                </span>
                <span class="small text-muted">(${t.reviews || "128"} đánh giá)</span>
              </div>
              <p class="small text-muted flex-grow-1 mb-3" style="min-height: 4.2em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6;">${t.description || ""}</p>
              <div class="tour-card-actions">
                <div class="tour-price ${hasPromotion ? 'has-promotion' : ''}">
                  ${hasPromotion ? `
                    <div class="price-container">
                      <span class="price-label text-muted small">Giá gốc</span>
                      <div class="price-main">
                        <span class="price-original text-muted text-decoration-line-through small">${formatPrice(pricing.originalPrice)}</span>
                      </div>
                      <span class="price-label text-success small mt-2">Giá khuyến mãi</span>
                      <div class="price-main">
                        <span class="fw-bold text-danger" style="font-size: 1.5rem; line-height: 1.2;">${formatPrice(pricing.finalPrice)}</span>
                        ${pricing.discountPercent > 0 ? `
                        <span class="price-save-badge">Tiết kiệm ${pricing.discountPercent}%</span>
                        ` : ''}
                      </div>
                    </div>
                  ` : `
                    <div class="price-container">
                      <span class="price-label text-muted small">Từ</span>
                      <div class="price-main">
                        <span class="fw-bold text-primary" style="font-size: 1.75rem; line-height: 1.2;">${formatPrice(pricing.finalPrice)}</span>
                      </div>
                    </div>
                  `}
                </div>
                <div class="tour-buttons d-flex gap-2">
                  <button class="btn btn-cart btn-sm add-cart flex-grow-1" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}'>
                    <i class="bi bi-cart-plus"></i>
                    <span>Giỏ hàng</span>
                  </button>
                  <button class="btn btn-favorite btn-sm add-fav" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}' title="Thêm vào yêu thích">
                    <i class="bi bi-heart-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        }
      )
      .join("");
    $list.html(html);
  }

  function renderHot(items) {
    if (!$hotList.length) return;
    const hot = [...items].sort((a, b) => {
      const priceA = window.APP_UTILS?.parsePrice(a.price) || Number(a.price) || 0;
      const priceB = window.APP_UTILS?.parsePrice(b.price) || Number(b.price) || 0;
      return priceB - priceA;
    }).slice(0, 6);
    
    // Use same enhanced render as category tours
    const html = hot
      .map(
        (t) => {
          // Parse price from API format
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

          // Ưu tiên ảnh local trước, nếu không có thì dùng ảnh từ JSON
          const localImage = `assets/img/tours/${t.id}.jpg`;
          const imageSrc = localImage; // Luôn ưu tiên ảnh local trước

          return `
        <div class="tour-card-wrapper">
          <div class="card h-100 tour-card tour-card-clickable" data-id="${t.id}">
            <div class="position-relative card-image-wrapper">
              <img src="${imageSrc}" 
                   class="card-img-top" 
                   alt="${t.title}"
                   loading="lazy"
                   onerror="this.onerror=null; this.src='${t.image || `assets/img/banners/placeholder.jpg`}';">
              <div class="card-overlay"></div>
              <span class="badge bg-danger position-absolute end-10 m-2" style="top: 40px;">
                <i class="bi bi-fire"></i> Hot
              </span>
              ${hasPromotion && badgeText ? `
              <span class="badge badge-promotion position-absolute top-0 end-0 m-2">
                <i class="bi bi-tag-fill"></i> ${badgeText}
              </span>
              ` : ''}
              <span class="badge badge-destination position-absolute top-0 start-0 m-2" style="top: 50px;">
                <i class="bi bi-geo-alt-fill"></i> ${t.destination || "Điểm đến"}
              </span>
              <span class="badge badge-duration position-absolute top-0 end-0 m-2" style="${hasPromotion ? 'top: 50px;' : ''}">
                <i class="bi bi-clock-fill"></i> ${formatDuration(t.duration)}
              </span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold mb-2" style="min-height: 3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.title}</h5>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="rating">
                  <i class="bi bi-star-fill"></i> ${t.rating || "4.6"}
                </span>
                <span class="small text-muted">(${t.reviews || "128"} đánh giá)</span>
              </div>
              <p class="small text-muted flex-grow-1 mb-3" style="min-height: 4.2em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6;">${t.description || ""}</p>
              <div class="tour-card-actions">
                <div class="tour-price ${hasPromotion ? 'has-promotion' : ''}">
                  ${hasPromotion ? `
                    <div class="price-container">
                      <span class="price-label text-muted small">Giá gốc</span>
                      <div class="price-main">
                        <span class="price-original text-muted text-decoration-line-through small">
                          ${formatPrice(pricing.originalPrice)}
                        </span>
                      </div>
                      <span class="price-label text-success small mt-2">Giá khuyến mãi</span>
                      <div class="price-main">
                        <span class="fw-bold text-danger" style="font-size: 1.25rem;">${formatPrice(pricing.finalPrice)}</span>
                        ${pricing.discountPercent > 0 ? `
                        <span class="price-save-badge">Tiết kiệm ${pricing.discountPercent}%</span>
                        ` : ''}
                      </div>
                    </div>
                  ` : `
                    <div class="price-container">
                      <span class="price-label text-muted small">Từ</span>
                      <div class="price-main">
                        <span class="fw-bold text-primary" style="font-size: 1.5rem;">${formatPrice(pricing.finalPrice)}</span>
                      </div>
                    </div>
                  `}
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-outline-success btn-sm add-cart flex-grow-1" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}'>
                    <i class="bi bi-cart-plus"></i> Thêm giỏ
                  </button>
                  <button class="btn btn-favorite btn-sm add-fav" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}' title="Thêm vào yêu thích">
                    <i class="bi bi-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        }
      )
      .join("");
    $hotList.html(html);
  }

  function renderCategory(items, category) {
    if (!$catList.length) return;
    let filtered = [...items];
    if (category) {
      filtered = filtered.filter((t) => (t.theme || t.destination || "").toLowerCase().includes(category.toLowerCase()));
    }
    
    // Use same enhanced render as main tour list
    const html = filtered.slice(0, 6)
      .map(
        (t) => {
          // Parse price from API format
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

          // Ưu tiên ảnh local trước, nếu không có thì dùng ảnh từ JSON
          const localImage = `assets/img/tours/${t.id}.jpg`;
          const imageSrc = localImage; // Luôn ưu tiên ảnh local trước

          return `
        <div class="tour-card-wrapper">
          <div class="card h-100 tour-card tour-card-clickable" data-id="${t.id}">
            <div class="position-relative card-image-wrapper">
              <img src="${imageSrc}" 
                   class="card-img-top" 
                   alt="${t.title}"
                   loading="lazy"
                   onerror="this.onerror=null; this.src='${t.image || `assets/img/banners/placeholder.jpg`}';">
              <div class="card-overlay"></div>
              ${hasPromotion && badgeText ? `
              <span class="badge badge-promotion position-absolute top-0 end-0 m-2">
                <i class="bi bi-tag-fill"></i> ${badgeText}
              </span>
              ` : ''}
              <span class="badge badge-destination position-absolute top-0 start-0 m-2">
                <i class="bi bi-geo-alt-fill"></i> ${t.destination || "Điểm đến"}
              </span>
              <span class="badge badge-duration position-absolute top-0 end-0 m-2" style="${hasPromotion ? 'top: 50px;' : ''}">
                <i class="bi bi-clock-fill"></i> ${formatDuration(t.duration)}
              </span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold mb-2" style="min-height: 3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.title}</h5>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="rating">
                  <i class="bi bi-star-fill"></i> ${t.rating || "4.6"}
                </span>
                <span class="small text-muted">(${t.reviews || "128"} đánh giá)</span>
              </div>
              <p class="small text-muted flex-grow-1 mb-3" style="min-height: 4.2em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6;">${t.description || ""}</p>
              <div class="tour-card-actions">
                <div class="tour-price ${hasPromotion ? 'has-promotion' : ''}">
                  ${hasPromotion ? `
                    <div class="price-container">
                      <span class="price-label text-muted small">Giá gốc</span>
                      <div class="price-main">
                        <span class="price-original text-muted text-decoration-line-through small">
                          ${formatPrice(pricing.originalPrice)}
                        </span>
                      </div>
                      <span class="price-label text-success small mt-2">Giá khuyến mãi</span>
                      <div class="price-main">
                        <span class="fw-bold text-danger" style="font-size: 1.25rem;">${formatPrice(pricing.finalPrice)}</span>
                        ${pricing.discountPercent > 0 ? `
                        <span class="price-save-badge">Tiết kiệm ${pricing.discountPercent}%</span>
                        ` : ''}
                      </div>
                    </div>
                  ` : `
                    <div class="price-container">
                      <span class="price-label text-muted small">Từ</span>
                      <div class="price-main">
                        <span class="fw-bold text-primary" style="font-size: 1.25rem;">${formatPrice(pricing.finalPrice)}</span>
                      </div>
                    </div>
                  `}
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-outline-success btn-sm add-cart flex-grow-1" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}'>
                    <i class="bi bi-cart-plus"></i> Thêm giỏ
                  </button>
                  <button class="btn btn-favorite btn-sm add-fav" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}' title="Thêm vào yêu thích">
                    <i class="bi bi-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        }
      )
      .join("");
    $catList.html(html || `
      <div class="category-empty-state">
        <div class="category-empty-icon">
          <i class="bi bi-inbox"></i>
        </div>
        <div class="category-empty-title">Chưa có tour phù hợp</div>
        <div class="category-empty-text">Không tìm thấy tour nào cho chủ đề này. Hãy thử chọn chủ đề khác.</div>
        <a href="tours.html" class="btn btn-primary">
          <i class="bi bi-compass me-1"></i>Xem tất cả tour
        </a>
      </div>
    `);
  }
  
  // Expose renderCategory globally for homepage.js
  window.renderCategory = renderCategory;

  function applyFilter() {
    if (!tours || tours.length === 0) {
      console.warn("⚠️ Chưa có dữ liệu tours để lọc");
      return;
    }

    let filtered = [...tours];
    const q = ($search.val() || "").trim().toLowerCase();
    const dest = $destination.val();
    const priceRange = $price.val();
    const dur = Number($duration.val());
    const sort = $sort.val();

    // Tìm kiếm mở rộng: title, description, destination, theme
    if (q) {
      filtered = filtered.filter((t) => {
        const title = (t.title || "").toLowerCase();
        const description = (t.description || "").toLowerCase();
        const destination = (t.destination || "").toLowerCase();
        const theme = (t.theme || "").toLowerCase();
        const duration = String(t.duration || "");
        
        return (
          title.includes(q) ||
          description.includes(q) ||
          destination.includes(q) ||
          theme.includes(q) ||
          duration.includes(q)
        );
      });
    }

    // Lọc theo điểm đến
    if (dest) {
      filtered = filtered.filter((t) => t.destination === dest);
    }

    // Lọc theo khoảng giá - parse price đúng cách
    if (priceRange) {
      const [minStr, maxStr] = priceRange.split("-");
      const min = window.APP_UTILS?.parsePrice(minStr) || Number(minStr) || 0;
      const max = maxStr ? (window.APP_UTILS?.parsePrice(maxStr) || Number(maxStr) || Infinity) : Infinity;
      
      filtered = filtered.filter((t) => {
        const tourPrice = window.APP_UTILS?.parsePrice(t.price) || Number(t.price) || 0;
        return tourPrice >= min && tourPrice <= max;
      });
    }

    // Lọc theo số ngày
    if (dur) {
      filtered = filtered.filter((t) => Number(t.duration) === dur);
    }

    // Sắp xếp nâng cao
    if (sort) {
      const [field, dir] = sort.split("-");
      filtered.sort((a, b) => {
        let valA, valB;
        
        if (field === "price") {
          valA = window.APP_UTILS?.parsePrice(a.price) || Number(a.price) || 0;
          valB = window.APP_UTILS?.parsePrice(b.price) || Number(b.price) || 0;
        } else if (field === "duration") {
          valA = Number(a.duration) || 0;
          valB = Number(b.duration) || 0;
        } else if (field === "rating") {
          valA = Number(a.rating) || 0;
          valB = Number(b.rating) || 0;
        } else {
          valA = Number(a[field]) || 0;
          valB = Number(b[field]) || 0;
        }
        
        return dir === "asc" ? valA - valB : valB - valA;
      });
    }

    // Hiển thị số kết quả (chỉ khi có filter active)
    const resultCount = filtered.length;
    const hasActiveFilters = q || dest || priceRange || dur;
    
    if (resultCount === 0 && hasActiveFilters) {
      // Không hiển thị toast nếu không có filter (để tránh spam)
      // Empty state sẽ được hiển thị trong render()
    } else if (resultCount > 0 && hasActiveFilters && resultCount !== tours.length) {
      // Chỉ hiển thị toast nếu có filter và kết quả khác với tổng số
      showToast(`Tìm thấy ${resultCount} tour phù hợp`, "success", 2000);
    }

    render(filtered);
  }

  // Render Destinations - HOÀN TOÀN ĐỘC LẬP, chỉ load từ file tùy chỉnh, chỉ dùng ảnh local từ thư mục img
  // Tham số items KHÔNG được sử dụng, chỉ để tương thích với code cũ
  async function renderDestinations(items) {
    const $destGrid = $("#destinations-grid");
    if (!$destGrid.length) return;
    
    // Fallback cứng để luôn có dữ liệu khi fetch bị chặn (file:// hoặc lỗi mạng)
    const defaultDestinations = [
      { name: "Đà Nẵng", image: "assets/img/tours/10.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Biển", link: "tours.html?destination=Đà Nẵng" },
      { name: "Sapa", image: "assets/img/tours/11.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Núi", link: "tours.html?destination=Sapa" },
      { name: "Phú Quốc", image: "assets/img/tours/12.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Biển", link: "tours.html?destination=Phú Quốc" },
      { name: "Hạ Long", image: "assets/img/tours/13.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Biển", link: "tours.html?destination=Hạ Long" },
      { name: "Nha Trang", image: "assets/img/tours/14.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Biển", link: "tours.html?destination=Nha Trang" },
      { name: "Đà Lạt", image: "assets/img/tours/15.jpg", fallbackImage: "assets/img/banners/banner.jpg", theme: "Du lịch Núi", link: "tours.html?destination=Đà Lạt" },
    ];
    
    let destinations = [];
    
    // CHỈ load từ file tùy chỉnh, KHÔNG phụ thuộc vào API
    try {
      const response = await fetch('data/destinations-custom.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.destinations && data.destinations.length > 0) {
        destinations = data.destinations;
        console.log("Đã load destinations từ file tùy chỉnh");
      } else {
        console.warn("File destinations-custom.json rỗng, dùng fallback mặc định");
        destinations = defaultDestinations;
      }
    } catch (err) {
      // Không có file hoặc bị chặn (file://), dùng fallback
      console.warn("Không tải được destinations-custom.json, dùng fallback mặc định.", err);
      destinations = defaultDestinations;
    }
    
    // Render HTML từ file tùy chỉnh - Đảm bảo ảnh hiển thị
    const html = destinations
      .map((dest, index) => {
        // Đảm bảo đường dẫn ảnh đúng format
        const imageSrc = dest.image || dest.fallbackImage || 'assets/img/banners/banner.jpg';
        const fallbackImage = dest.fallbackImage || dest.image || 'assets/img/banners/banner.jpg';
        const link = dest.link || `tours.html?destination=${encodeURIComponent(dest.name)}`;
        
        return `
        <div class="dest-card-wrapper">
          <div class="dest-card reveal-scale hover-scale image-zoom ${index > 0 ? `animate-delay-${index}` : ''}" 
               onclick="window.location.href='${link}'" style="cursor: pointer;">
            <img src="${imageSrc}" 
                 alt="${dest.name}" 
                 class="loaded"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${fallbackImage}'; this.onerror=null; this.src='assets/img/banners/banner.jpg';">
            <div class="dest-overlay">
              <h6 class="mb-1">${dest.name}</h6>
              <span class="badge bg-light text-dark badge-soft">${dest.theme || "Du lịch"}</span>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
    
    if (html) {
      $destGrid.html(html);
      console.log(`Đã render ${destinations.length} destinations với ảnh từ file local`);
    } else {
      console.warn("Không có HTML để render");
    }
  }

  async function loadTours() {
    showLoading(true);
    try {
      // Load image mapping trước (từ file JSON - fallback)
      if (window.IMAGE_MAPPING) {
        await window.IMAGE_MAPPING.load();
      }
      
      // Load tours từ API - LUÔN LUÔN load mới nhất để có tours mới và ảnh mới
      tours = await http.get(API.tours);
      console.log(`✅ Đã load ${tours.length} tours từ API`);
      
      // Chỉ render stats và fill destinations, không render list ngay
      renderStats(tours);
      fillDestinations(tours);
      
      // Render các section khác (hot, category) nếu có
      if ($hotList.length) renderHot(tours);
      if ($catList.length) renderCategory(tours, "");
      
      return true;
    } catch (err) {
      console.error("❌ Lỗi khi load tours từ API:", err);
      // Fallback sang data local để vẫn hiển thị
      try {
        const fallbackRes = await fetch("data/sample-tours.json");
        const fallbackData = await fallbackRes.json();
        tours = fallbackData?.tours || [];
        if (tours.length) {
          showToast("Đang dùng dữ liệu mẫu (API lỗi)", "warning", 3000);
          renderStats(tours);
          fillDestinations(tours);
          if ($hotList.length) renderHot(tours);
          if ($catList.length) renderCategory(tours, "");
          return true;
        } else {
          showToast("Không tải được tour", "danger");
          return false;
        }
      } catch (fallbackErr) {
        console.error("❌ Fallback cũng lỗi:", fallbackErr);
        showToast("Không tải được tour", "danger");
        return false;
      }
    } finally {
      showLoading(false);
    }
  }
  
  // Listen for tour image updates từ dashboard
  $(document).on('tourImageUpdated toursImagesUpdated', function(e, data) {
    console.log('Nhận được thông báo cập nhật ảnh tour, reload tours...');
    // Reload tours để hiển thị ảnh mới
    loadTours();
  });

  // Load filter từ URL params (nếu có)
  function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || params.get("q") || "";
    const destination = params.get("destination") || "";
    const price = params.get("price") || "";
    const duration = params.get("duration") || "";
    const sort = params.get("sort") || "";

    if (search) $search.val(search);
    if (destination) $destination.val(destination);
    if (price) $price.val(price);
    if (duration) $duration.val(duration);
    if (sort) $sort.val(sort);
  }

  $(function () {
    if (!$list.length) return;
    
    // Load filters từ URL trước
    loadFiltersFromURL();
    
    loadTours().then((success) => {
      if (success && tours && tours.length > 0) {
        // Áp dụng filter sau khi load xong tours (nếu có params trong URL)
        if (window.location.search) {
          applyFilter();
        } else {
          // Nếu không có filter, render tất cả tours
          render(tours);
        }
      }
    });
    
    // Event handlers với debounce cho search
    $search.on("input", debounce(function() {
      applyFilter();
    }, 300));
    
    // Hỗ trợ Enter để tìm kiếm
    $search.on("keypress", function(e) {
      if (e.which === 13) { // Enter key
        e.preventDefault();
        applyFilter();
        const $tourList = document.getElementById("tour-list");
        if ($tourList) {
          $tourList.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
    
    $destination.on("change", applyFilter);
    $price.on("change", applyFilter);
    $duration.on("change", applyFilter);
    $sort.on("change", applyFilter);
    
    $submit.on("click", function (e) {
      e.preventDefault();
      applyFilter();
      const $tourList = document.getElementById("tour-list");
      if ($tourList) {
        $tourList.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    
    $reset.on("click", function (e) {
      e.preventDefault();
      $search.val("");
      $destination.val("");
      $price.val("");
      $duration.val("");
      $sort.val("");
      
      // Xóa URL params
      const url = new URL(window.location);
      url.search = "";
      window.history.replaceState({}, "", url);
      
      applyFilter();
      showToast("Đã xóa tất cả bộ lọc", "info", 1500);
    });

    // Support both old button pills and new category tab cards
    // Support both old button pills and new category tab cards
    $catPills.on("click", "button", function () {
      $catPills.find("button").removeClass("active");
      $(this).addClass("active");
      renderCategory(tours, $(this).data("category"));
    });

    // Support new category tab cards
    $(document).on("click", ".category-tab-card", function () {
      $(".category-tab-card").removeClass("active");
      $(this).addClass("active");
      renderCategory(tours, $(this).data("category"));
    });

    // Click toàn bộ thẻ tour để mở chi tiết (trừ khi bấm vào nút)
    $(document).on("click", ".tour-card-clickable", function (e) {
      const isAction = $(e.target).closest("a, button").length > 0;
      if (isAction) return;
      const id = $(this).data("id");
      if (id) {
        window.location.href = `tour-detail.html?id=${id}`;
      }
    });

    // Support new category tab cards
    $(document).on("click", ".category-tab-card", function () {
      $(".category-tab-card").removeClass("active");
      $(this).addClass("active");
      renderCategory(tours, $(this).data("category"));
    });

    // Event handler cho nút yêu thích - sử dụng event delegation
    $(document).on("click", ".add-fav", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      const $btn = $(this);
      const id = $btn.data("id");
      
      console.log("Click thêm vào yêu thích, tour ID:", id);
      
      if (!window.APP_FAVORITES) {
        console.error("APP_FAVORITES không tồn tại");
        showToast("Hệ thống yêu thích chưa sẵn sàng", "danger");
        return;
      }
      
      // Lấy tourData từ nhiều nguồn để đảm bảo có dữ liệu
      let tourData = null;
      
      // 1. Ưu tiên: Lấy từ data-tour trên chính nút yêu thích
      const favTourData = $btn.data("tour");
      if (favTourData) {
        // Nếu là string (JSON), parse lại
        if (typeof favTourData === 'string') {
          try {
            tourData = JSON.parse(favTourData.replace(/&#39;/g, "'"));
            console.log("Lấy tourData từ data-tour trên nút yêu thích");
          } catch (err) {
            console.warn("Không thể parse tourData từ data-tour:", err);
          }
        } else {
          tourData = favTourData;
          console.log("Lấy tourData từ data-tour (object)");
        }
      }
      
      // 2. Nếu không có, thử lấy từ .add-cart button trong cùng card
      if (!tourData) {
        const $cartBtn = $btn.closest('.tour-card').find('.add-cart');
        if ($cartBtn.length) {
          const cartTourData = $cartBtn.data('tour');
          if (cartTourData) {
            // Nếu là string (JSON), parse lại
            if (typeof cartTourData === 'string') {
              try {
                tourData = JSON.parse(cartTourData.replace(/&#39;/g, "'"));
                console.log("Lấy tourData từ .add-cart button");
              } catch (err) {
                console.warn("Không thể parse tourData từ .add-cart:", err);
              }
            } else {
              tourData = cartTourData;
              console.log("Lấy tourData từ .add-cart (object)");
            }
          }
        }
      }
      
      // 3. Nếu không có, lấy từ tours array
      if (!tourData && tours && tours.length) {
        const tour = tours.find(t => String(t.id) === String(id));
        if (tour) {
          tourData = tour;
          console.log("Tìm thấy tour từ tours array:", tour.title);
        }
      }
      
      // 4. Nếu vẫn không có, thử load từ API (async)
      if (!tourData && window.APP_CONFIG && window.APP_UTILS) {
        const { API } = window.APP_CONFIG;
        const { http } = window.APP_UTILS;
        console.log("Không tìm thấy tourData, đang load từ API...");
        http.get(`${API.tours}/${id}`).then(tour => {
          tourData = tour;
          console.log("Đã load tour từ API:", tour.title);
          addToFavorites(id, tourData, $btn);
        }).catch(err => {
          console.error("Không thể load tour từ API:", err);
          // Vẫn thử thêm với tourData null
          addToFavorites(id, null, $btn);
        });
        return;
      }
      
      // Thêm vào yêu thích ngay lập tức
      addToFavorites(id, tourData, $btn);
    });
    
    // Hàm helper để thêm vào yêu thích
    function addToFavorites(id, tourData, $btn) {
      // Kiểm tra APP_FAVORITES có tồn tại không
      if (!window.APP_FAVORITES) {
        console.error("APP_FAVORITES không tồn tại. Vui lòng đảm bảo favorites.js đã được load.");
        showToast("Hệ thống yêu thích chưa sẵn sàng. Vui lòng tải lại trang.", "danger");
        return false;
      }
      
      // Kiểm tra hàm add có tồn tại không
      if (typeof window.APP_FAVORITES.add !== 'function') {
        console.error("APP_FAVORITES.add không phải là function");
        showToast("Hệ thống yêu thích chưa sẵn sàng", "danger");
        return false;
      }
      
      console.log("Thêm vào yêu thích:", {
        id: id,
        hasTourData: !!tourData,
        tourTitle: tourData ? tourData.title : "null",
        APP_FAVORITES_exists: !!window.APP_FAVORITES,
        add_function_exists: typeof window.APP_FAVORITES.add === 'function'
      });
      
      try {
        // Gọi hàm add từ APP_FAVORITES
        const result = window.APP_FAVORITES.add(id, "", tourData);
        
        console.log("Kết quả thêm vào yêu thích:", result);
        
        if (result === true) {
          // Cập nhật UI khi thành công
          $btn.html('<i class="bi bi-heart-fill"></i>')
              .addClass("btn-favorite-active")
              .removeClass("btn-favorite")
              .prop("title", "Đã thêm vào yêu thích");
          $btn.find('i').addClass('heart-beat-animation');
          
          setTimeout(() => {
            $btn.find('i').removeClass('heart-beat-animation');
          }, 600);
          
          console.log("Đã thêm vào yêu thích thành công");
          return true;
        } else if (result === false) {
          // Nếu đã có trong yêu thích hoặc có lỗi (ví dụ: chưa đăng nhập)
          // Vẫn cập nhật UI để hiển thị trạng thái
          const favorites = window.APP_FAVORITES.getAll();
          const isInFavorites = favorites.some(f => String(f.id) === String(id));
          
          if (isInFavorites) {
            $btn.html('<i class="bi bi-heart-fill"></i>')
                .addClass("btn-favorite-active")
                .removeClass("btn-favorite")
                .prop("title", "Đã có trong yêu thích");
            console.log("Tour đã có trong yêu thích");
          }
          return false;
        }
      } catch (error) {
        console.error("Lỗi khi thêm vào yêu thích:", error);
        console.error("Error stack:", error.stack);
        showToast("Có lỗi xảy ra khi thêm vào yêu thích: " + error.message, "danger");
        return false;
      }
    }

    // Event add to cart cho toàn bộ danh sách (list, hot, category)
    $(document).on("click", ".add-cart", function (e) {
      e.preventDefault();
      e.stopPropagation(); // tránh click card mở trang chi tiết
      const $btn = $(this);
      const id = $btn.data("id");

      let tourData = $btn.data("tour");
      if (typeof tourData === "string") {
        try {
          tourData = JSON.parse(tourData.replace(/&#39;/g, "'"));
        } catch (err) {
          console.warn("Không parse được tourData từ data-tour, dùng object trống.", err);
          tourData = {};
        }
      }

      if (window.APP_CART && typeof window.APP_CART.addToCart === "function") {
        window.APP_CART.addToCart(id, 1, tourData);
        
        // Track add to cart
        if (window.TRACKING && typeof window.TRACKING.trackAddToCart === "function") {
          window.TRACKING.trackAddToCart(id, tourData, 1);
        }
        
        const originalHtml = $btn.html();
        $btn.html('<i class="bi bi-check-circle-fill"></i> <span>Đã thêm</span>').prop("disabled", true).addClass("btn-cart-added");
        showToast("Đã thêm vào giỏ hàng", "success");
        setTimeout(() => {
          $btn.html(originalHtml).prop("disabled", false).removeClass("btn-cart-added");
        }, 2000);
      } else {
        showToast("Giỏ hàng chưa sẵn sàng", "warning");
      }
    });
  });
})();
