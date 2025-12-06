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
        (t) => `
        <div class="col-md-4 mb-3">
          <div class="card h-100 shadow-sm">
            <img src="${t.image || "assets/img/banners/placeholder.jpg"}" class="card-img-top" alt="${t.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${t.title}</h5>
              <p class="small text-muted mb-1">${t.destination}</p>
              <p class="mb-1 fw-semibold text-primary">${formatPrice(t.price)}</p>
              <p class="small text-muted mb-2">${formatDuration(t.duration)}</p>
              <a href="tour-detail.html?id=${t.id}" class="btn btn-outline-primary btn-sm mt-auto">Chi tiết</a>
            </div>
          </div>
        </div>`
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

