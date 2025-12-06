/**
 * Checkout Page Handler
 */
(function () {
  const { formatPrice, showToast, storage } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  function loadCheckoutData() {
    const cartData = sessionStorage.getItem("checkout_cart");
    if (!cartData) {
      showToast("Không tìm thấy đơn hàng. Vui lòng thêm tour vào giỏ hàng.", "warning");
      setTimeout(() => window.location.href = "cart.html", 2000);
      return null;
    }

    try {
      return JSON.parse(cartData);
    } catch (err) {
      showToast("Lỗi dữ liệu đơn hàng", "danger");
      return null;
    }
  }

  function renderOrderSummary(cart) {
    const $items = $("#checkout-items");
    let subtotal = 0;

    const html = cart.map(item => {
      const tour = item.tour || {};
      const price = Number(tour.price || 0);
      const total = price * item.quantity;
      subtotal += total;

      return `
        <div class="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
          <div class="flex-grow-1">
            <div class="fw-semibold">${tour.title || 'Tour'}</div>
            <div class="small text-muted">${tour.destination || ''} • ${item.quantity} người</div>
          </div>
          <div class="text-end">
            <div class="fw-bold">${formatPrice(total)}</div>
          </div>
        </div>
      `;
    }).join("");

    $items.html(html);
    $("#checkout-subtotal").text(formatPrice(subtotal));
    $("#checkout-total").text(formatPrice(subtotal));
  }

  function saveBooking(customerInfo, cart, paymentMethod) {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    const total = cart.reduce((sum, item) => {
      return sum + (Number(item.tour?.price || 0) * item.quantity);
    }, 0);

    const booking = {
      id: Date.now().toString(),
      code: `BK${Date.now()}`,
      tours: cart.map(item => ({
        tourId: item.tourId,
        title: item.tour?.title,
        quantity: item.quantity,
        price: item.tour?.price
      })),
      customer: customerInfo,
      payment: paymentMethod,
      total: total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    // Trigger custom event for dashboard updates
    $(document).trigger('bookingUpdated');
    return booking;
  }

  $("#btn-process-payment").on("click", function () {
    const cart = loadCheckoutData();
    if (!cart || !cart.length) return;

    const name = $("#checkout-name").val().trim();
    const email = $("#checkout-email").val().trim();
    const phone = $("#checkout-phone").val().trim();
    const date = $("#checkout-date").val();
    const note = $("#checkout-note").val().trim();
    const paymentMethod = $("input[name='payment']:checked").val();

    // Validation
    if (!name || !email || !phone) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Email không hợp lệ", "warning");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      showToast("Số điện thoại không hợp lệ", "warning");
      return;
    }

    // Save booking
    const customerInfo = { name, email, phone, date, note };
    const booking = saveBooking(customerInfo, cart, paymentMethod);

    // Clear cart
    if (window.APP_CART) {
      window.APP_CART.clearCart();
    }
    sessionStorage.removeItem("checkout_cart");

    // Redirect to payment page
    window.location.href = `payment.html?booking=${booking.code}`;
  });

  $(function () {
    const cart = loadCheckoutData();
    if (cart) {
      renderOrderSummary(cart);

      // Auto-fill user info if logged in
      const user = storage.get("travel_user", null);
      if (user) {
        $("#checkout-name").val(user.name || "");
        $("#checkout-email").val(user.email || "");
      }
    }

    // Payment method selection
    $(".payment-method input").on("change", function () {
      $(".payment-method label").removeClass("border-primary bg-light");
      $(this).closest(".payment-method").find("label").addClass("border-primary bg-light");
    });
  });
})();


