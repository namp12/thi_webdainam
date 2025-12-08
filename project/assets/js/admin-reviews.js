(function () {
  const { showToast } = window.APP_UTILS;

  let reviews = [];

  function loadReviews() {
    try {
      reviews = JSON.parse(localStorage.getItem("travel_reviews") || "[]");
      renderTable();
    } catch (err) {
      showToast("Không tải được reviews", "danger");
    }
  }

  function renderTable() {
    const tbody = $("#reviews-tbody");
    if (!tbody.length) return;

    if (!reviews.length) {
      tbody.html('<tr><td colspan="5" class="text-center text-muted">Chưa có review nào</td></tr>');
      return;
    }

    const html = reviews
      .map(
        (r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${r.userName || "Khách"}</td>
        <td>Tour #${r.tourId || ""}</td>
        <td>${"★".repeat(r.rating || 0)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteReview(${idx})">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
    tbody.html(html);
  }

  window.deleteReview = function (idx) {
    if (!confirm("Xác nhận xóa review này?")) return;
    reviews.splice(idx, 1);
    localStorage.setItem("travel_reviews", JSON.stringify(reviews));
    showToast("Đã xóa review", "success");
    loadReviews();
  };

  $(function () {
    loadReviews();
  });
})();









