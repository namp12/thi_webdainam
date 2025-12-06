(function () {
  const { storage, showToast } = window.APP_UTILS;
  const REVIEWS_KEY = "travel_reviews";

  const $list = $("#reviews-list");
  const $empty = $("#reviews-empty");

  function getReviews() {
    return storage.get(REVIEWS_KEY, []);
  }

  function render(items) {
    if (!$list.length) return;
    if (!items.length) {
      $empty.removeClass("d-none");
      return;
    }
    const html = items
      .map(
        (r) => `
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div class="fw-bold">${r.tourName || "Tour"}</div>
                <span class="badge bg-warning text-dark">★ ${r.score}</span>
              </div>
              <div class="text-muted small mb-2">${r.user || "Ẩn danh"}</div>
              <p class="mb-0">${r.content || ""}</p>
            </div>
          </div>
        </div>`
      )
      .join("");
    $list.html(html);
  }

  $(function () {
    render(getReviews());
  });

  // expose for other modules
  window.APP_REVIEWS = { getReviews, getAll: getReviews };
})();
