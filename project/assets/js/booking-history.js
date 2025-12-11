(function () {
  const { storage, formatPrice } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";
  const $list = $("#booking-history-list");
  const $empty = $("#booking-history-empty");

  function getBookingList() {
    return storage.get(BOOKINGS_KEY, []);
  }

  function render(list) {
    if (!$list.length) return;
    if (!list.length) {
      $empty.removeClass("d-none");
      return;
    }
    const html = list
      .map(
        (b) => `
        <div class="col-md-6">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="fw-bold">${b.code}</div>
                  <div class="text-muted small">${b.customer?.name || ""}</div>
                </div>
                <span class="badge bg-secondary text-uppercase">${b.status}</span>
              </div>
              <div class="small text-muted mt-2">${b.customer?.email || ""}</div>
              <div class="small text-muted">${b.customer?.phone || ""}</div>
              <div class="small text-muted mt-2">Tour ID: ${b.tourId || "N/A"}</div>
            </div>
          </div>
        </div>`
      )
      .join("");
    $list.html(html);
  }

  $(function () {
    const list = getBookingList();
    render(list);
  });
})();









