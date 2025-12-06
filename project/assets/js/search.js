(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast, formatPrice, formatDuration } = window.APP_UTILS;

  const $list = $("#tour-list");
  const $empty = $("#tour-empty");
  const $search = $("#tour-search");
  const $queryText = $("#search-query");

  function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
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

  async function load(query) {
    try {
      const tours = await http.get(API.tours);
      const q = query.toLowerCase();
      const filtered = q
        ? tours.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              (t.destination || "").toLowerCase().includes(q) ||
              String(t.duration).includes(q)
          )
        : tours;
      render(filtered);
    } catch (err) {
      showToast("Không tải được kết quả", "danger");
    }
  }

  $(function () {
    if (!$list.length) return;
    const q = getQuery();
    $queryText.text(q);
    $search.val(q);
    load(q);

    $search.on("input", function () {
      const value = $(this).val().trim();
      $queryText.text(value);
      load(value);
    });
  });
})();



