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
    const avg =
      data.reduce((sum, t) => sum + Number(t.price || 0), 0) /
      (total || 1);
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
    if (!items.length) {
      $list.empty();
      $empty.removeClass("d-none");
      return;
    }
    const html = items
      .map(
        (t) => `
        <div class="col-md-4 mb-4">
          <div class="card h-100 tour-card">
            <div class="position-relative card-image-wrapper">
              <img src="${t.image || "assets/img/banners/placeholder.jpg"}" class="card-img-top" alt="${t.title}">
              <div class="card-overlay"></div>
              <span class="badge badge-destination position-absolute top-0 start-0 m-2">
                <i class="bi bi-geo-alt-fill"></i> ${t.destination || "Điểm đến"}
              </span>
              <span class="badge badge-duration position-absolute top-0 end-0 m-2">
                <i class="bi bi-clock-fill"></i> ${formatDuration(t.duration)}
              </span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold mb-2">${t.title}</h5>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="rating">
                  <i class="bi bi-star-fill"></i> ${t.rating || "4.6"}
                </span>
                <span class="small text-muted">(${t.reviews || "128"} đánh giá)</span>
              </div>
              <p class="small text-muted flex-grow-1 mb-3">${t.description || ""}</p>
              <div class="tour-card-actions">
                <div class="tour-price">
                  <span class="price-label text-muted small d-block">Từ</span>
                  <span class="fw-bold text-primary fs-5">${formatPrice(t.price)}</span>
                </div>
                <div class="tour-buttons d-flex gap-2">
                  <a href="tour-detail.html?id=${t.id}" class="btn btn-detail btn-sm">
                    <i class="bi bi-eye"></i>
                    <span>Chi tiết</span>
                  </a>
                  <button class="btn btn-cart btn-sm add-cart" data-id="${t.id}" data-tour='${JSON.stringify(t).replace(/'/g, "&#39;")}'>
                    <i class="bi bi-cart-plus"></i>
                    <span>Giỏ hàng</span>
                  </button>
                  <button class="btn btn-favorite btn-sm add-fav" data-id="${t.id}" title="Thêm vào yêu thích">
                    <i class="bi bi-heart-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
    $list.html(html);
  }

  function renderHot(items) {
    if (!$hotList.length) return;
    const hot = [...items].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)).slice(0, 6);
    const html = hot
      .map(
        (t) => `
        <div class="col-md-4 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="position-relative">
              <img src="${t.image || "assets/img/banners/placeholder.jpg"}" class="card-img-top" alt="${t.title}">
              <span class="badge bg-danger position-absolute top-0 start-0 m-2">Hot</span>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${t.title}</h5>
              <p class="small text-muted mb-1">${t.destination}</p>
              <p class="text-primary fw-bold mb-1">${formatPrice(t.price)}</p>
              <p class="small text-muted mb-3">${formatDuration(t.duration)}</p>
              <a href="tour-detail.html?id=${t.id}" class="btn btn-outline-primary btn-sm mt-auto">Xem chi tiết</a>
            </div>
          </div>
        </div>`
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
    const html = filtered.slice(0, 6)
      .map(
        (t) => `
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="position-relative">
              <img src="${t.image || "assets/img/banners/placeholder.jpg"}" class="card-img-top" alt="${t.title}">
              <span class="badge badge-soft position-absolute top-0 start-0 m-2">${t.destination || "Chủ đề"}</span>
            </div>
            <div class="card-body d-flex flex-column">
              <h6 class="fw-bold mb-1">${t.title}</h6>
              <div class="small text-muted mb-1">${t.destination}</div>
              <div class="d-flex justify-content-between align-items-center mt-auto">
                <span class="fw-semibold text-primary">${formatPrice(t.price)}</span>
                <span class="small text-muted">${formatDuration(t.duration)}</span>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
    $catList.html(html || `<div class="text-muted">Chưa có tour phù hợp</div>`);
  }

  function applyFilter() {
    let filtered = [...tours];
    const q = $search.val()?.toLowerCase() || "";
    const dest = $destination.val();
    const priceRange = $price.val();
    const dur = Number($duration.val());
    const sort = $sort.val();

    if (q) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          String(t.duration).includes(q)
      );
    }
    if (dest) filtered = filtered.filter((t) => t.destination === dest);
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((t) => t.price >= min && t.price <= max);
    }
    if (dur) filtered = filtered.filter((t) => Number(t.duration) === dur);

    if (sort) {
      const [field, dir] = sort.split("-");
      filtered.sort((a, b) => {
        const valA = Number(a[field]) || 0;
        const valB = Number(b[field]) || 0;
        return dir === "asc" ? valA - valB : valB - valA;
      });
    }

    render(filtered);
  }

  async function loadTours() {
    showLoading(true);
    try {
      tours = await http.get(API.tours);
      renderStats(tours);
      fillDestinations(tours);
      render(tours);
      renderHot(tours);
      renderCategory(tours, "");
    } catch (err) {
      showToast("Không tải được tour", "danger");
    } finally {
      showLoading(false);
    }
  }

  $(function () {
    if (!$list.length) return;
    loadTours();
    $search.on("input", debounce(applyFilter, 300));
    $destination.on("change", applyFilter);
    $price.on("change", applyFilter);
    $duration.on("change", applyFilter);
    $sort.on("change", applyFilter);
    $submit.on("click", function (e) {
      e.preventDefault();
      applyFilter();
      document.getElementById("tour-list").scrollIntoView({ behavior: "smooth" });
    });
    $reset.on("click", function () {
      $search.val("");
      $destination.val("");
      $price.val("");
      $duration.val("");
      $sort.val("");
      applyFilter();
    });

    $catPills.on("click", "button", function () {
      $catPills.find("button").removeClass("active");
      $(this).addClass("active");
      renderCategory(tours, $(this).data("category"));
    });

    $list.on("click", ".add-fav", function () {
      const id = $(this).data("id");
      if (window.APP_FAVORITES) {
        window.APP_FAVORITES.add(id);
        const $btn = $(this);
        $btn.html('<i class="bi bi-heart-fill"></i>').addClass("btn-favorite-active").removeClass("btn-favorite");
        $btn.find('i').addClass('heart-beat-animation');
        showToast("Đã thêm vào yêu thích", "success");
        setTimeout(() => {
          $btn.find('i').removeClass('heart-beat-animation');
        }, 600);
      }
    });

    $list.on("click", ".add-cart", function () {
      const id = $(this).data("id");
      const tourData = $(this).data("tour");
      if (window.APP_CART) {
        window.APP_CART.addToCart(id, 1, tourData);
        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.html('<i class="bi bi-check-circle-fill"></i> <span>Đã thêm</span>').prop("disabled", true).addClass("btn-cart-added");
        showToast("Đã thêm vào giỏ hàng", "success");
        setTimeout(() => {
          $btn.html(originalHtml).prop("disabled", false).removeClass("btn-cart-added");
        }, 2000);
      }
    });
  });
})();
