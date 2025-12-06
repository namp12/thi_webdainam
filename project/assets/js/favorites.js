(function () {
  const { storage, showToast } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;
  const { http } = window.APP_UTILS;
  const KEY = "travel_favorites";

  function getAll() {
    return storage.get(KEY, []);
  }

  function save(list) {
    storage.set(KEY, list);
    // Trigger custom event for dashboard updates
    $(document).trigger('favoritesUpdated');
  }

  function add(id, note = "") {
    const list = getAll();
    if (list.some((f) => f.id === String(id))) {
      showToast("Đã có trong yêu thích", "info");
      return;
    }
    list.push({ id: String(id), note, addedAt: new Date().toISOString() });
    save(list);
    showToast("Đã thêm vào yêu thích", "success");
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
    if (!favIds.length) {
      const emptyText = window.APP_LANG?.favorites_empty || "Chưa có tour yêu thích";
      const emptyDesc = window.APP_LANG?.favorites_empty_desc || "Bạn chưa lưu tour nào vào danh sách yêu thích";
      $wrap.html(`
        <div class="text-center py-5">
          <i class="bi bi-heart" style="font-size: 4rem; color: #ccc;"></i>
          <h4 class="text-muted mt-3 mb-2">${emptyText}</h4>
          <p class="text-muted mb-4">${emptyDesc}</p>
          <a href="tours.html" class="btn btn-primary">${window.APP_LANG?.favorites_view_tours || "Xem các tour"}</a>
        </div>
      `);
      return;
    }
    try {
      const tours = await http.get(`${API.tours}`);
      const merged = favIds
        .map((f) => ({
          ...f,
          tour: tours.find((t) => String(t.id) === f.id),
        }))
        .filter((x) => x.tour);
      const html = merged
        .map(
          (item) => `
          <div class="card mb-3">
            <div class="card-body d-flex flex-column flex-md-row gap-3">
              <img src="${item.tour.image || "assets/img/banners/placeholder.jpg"}" class="rounded" style="width:160px;height:110px;object-fit:cover;">
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="mb-1">${item.tour.title}</h5>
                    <div class="text-muted small">${item.tour.destination}</div>
                  </div>
                  <button class="btn btn-outline-danger btn-sm remove-fav" data-id="${item.id}">
                    ${window.APP_LANG?.favorites_remove || "Xóa"}
                  </button>
                </div>
                <div class="text-primary fw-semibold mt-1">${window.APP_UTILS.formatPrice(item.tour.price)}</div>
                <textarea class="form-control mt-2 note-input" data-id="${item.id}" rows="2" 
                  placeholder="${window.APP_LANG?.favorites_note || "Ghi chú"}...">${item.note || ""}</textarea>
              </div>
            </div>
          </div>`
        )
        .join("");
      $wrap.html(html);
    } catch (err) {
      showToast("Không tải được yêu thích", "danger");
    }
  }

  $(function () {
    renderPage();
    $("#fav-list").on("click", ".remove-fav", function () {
      remove($(this).data("id"));
    });
    $("#fav-list").on("change", ".note-input", function () {
      updateNote($(this).data("id"), $(this).val());
    });
  });

  window.APP_FAVORITES = { add, remove, getAll };
})();



