(function () {
  const { API } = window.APP_CONFIG;
  const { http, storage, formatPrice } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  const $title = $("#bk-tour-title");
  const $price = $("#bk-tour-price");
  const $duration = $("#bk-tour-duration");

  function getBookingList() {
    return storage.get(BOOKINGS_KEY, []);
  }

  function saveBooking(booking) {
    const list = getBookingList();
    list.push(booking);
    storage.set(BOOKINGS_KEY, list);
  }

  function getTourId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  async function loadTour(id) {
    if (!id) return null;
    const tours = await http.get(`${API.tours}/${id}`);
    return tours;
  }

  function renderSummary(tour) {
    if (!tour) return;
    $title.text(tour.title || "Tour");
    $price.text(formatPrice(tour.price));
    $duration.text(`${tour.duration || ""} ngày`);
  }

  $(function () {
    const tourId = getTourId();
    if (tourId) {
      loadTour(tourId).then(renderSummary).catch(() => {});
    }

    $("#booking-form").on("submit", async function (e) {
      e.preventDefault();
      const name = $("#bk-name").val().trim();
      const email = $("#bk-email").val().trim();
      const phone = $("#bk-phone").val().trim();
      const payment = $("#bk-payment").val();

      // Validation
      if (!name) {
        showToast("Vui lòng nhập họ tên", "warning");
        $("#bk-name").focus();
        return;
      }
      if (!email) {
        showToast("Vui lòng nhập email", "warning");
        $("#bk-email").focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Email không hợp lệ", "warning");
        $("#bk-email").focus();
        return;
      }
      if (!phone) {
        showToast("Vui lòng nhập số điện thoại", "warning");
        $("#bk-phone").focus();
        return;
      }
      if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
        showToast("Số điện thoại không hợp lệ (10-11 chữ số)", "warning");
        $("#bk-phone").focus();
        return;
      }

      const booking = {
        id: Date.now().toString(),
        code: `BK${Date.now()}`,
        tourId: tourId || null,
        customer: { name, email, phone },
        payment: payment || "Thẻ",
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      
      try {
        saveBooking(booking);
        showToast("Đặt tour thành công!", "success");
        setTimeout(() => {
          window.location.href = `booking-success.html?code=${booking.code}`;
        }, 1000);
      } catch (err) {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "danger");
      }
    });
  });
})();

