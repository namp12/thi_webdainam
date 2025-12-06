(function () {
  const { showToast, formatPrice } = window.APP_UTILS;

  let bookings = [];

  function loadBookings() {
    try {
      bookings = JSON.parse(localStorage.getItem("travel_bookings") || "[]");
      renderTable();
    } catch (err) {
      showToast("Không tải được bookings", "danger");
    }
  }

  function renderTable() {
    const tbody = $("#bookings-tbody");
    if (!tbody.length) return;

    if (!bookings.length) {
      tbody.html('<tr><td colspan="6" class="text-center text-muted">Chưa có booking nào</td></tr>');
      return;
    }

    const html = bookings
      .map(
        (b, idx) => `
      <tr>
        <td>${b.code || `BK${idx + 1}`}</td>
        <td>${b.customer?.name || b.customerName || ""}</td>
        <td>Tour #${b.tourId || ""}</td>
        <td>${formatPrice(b.total || 0)}</td>
        <td><span class="badge bg-${b.status === "confirmed" ? "success" : "warning"}">${b.status || "pending"}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="updateStatus(${idx}, 'confirmed')">Xác nhận</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBooking(${idx})">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
    tbody.html(html);
  }

  window.updateStatus = function (idx, status) {
    bookings[idx].status = status;
    localStorage.setItem("travel_bookings", JSON.stringify(bookings));
    showToast("Đã cập nhật trạng thái", "success");
    loadBookings();
  };

  window.deleteBooking = function (idx) {
    if (!confirm("Xác nhận xóa booking này?")) return;
    bookings.splice(idx, 1);
    localStorage.setItem("travel_bookings", JSON.stringify(bookings));
    showToast("Đã xóa booking", "success");
    loadBookings();
  };

  $(function () {
    loadBookings();
  });
})();

