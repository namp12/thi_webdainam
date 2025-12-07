/**
 * Payment Processing Page
 * Tích hợp với booking manager để xử lý confirmation và stock
 */
(function () {
  const { formatPrice, storage, showToast } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  function getBookingCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("booking") || "";
  }

  async function processPayment() {
    const code = getBookingCode();
    if (!code) {
      showToast("Không tìm thấy mã đặt chỗ", "warning");
      setTimeout(() => window.location.href = "cart.html", 2000);
      return;
    }

    // Lấy booking data từ sessionStorage (được lưu từ checkout)
    const pendingBookingData = sessionStorage.getItem("pending_booking");
    if (!pendingBookingData) {
      showToast("Không tìm thấy thông tin đặt chỗ", "warning");
      setTimeout(() => window.location.href = "cart.html", 2000);
      return;
    }

    try {
      const bookingData = JSON.parse(pendingBookingData);

      // Kiểm tra xem booking manager có sẵn sàng không
      if (!window.BOOKING_MANAGER) {
        showToast("Hệ thống xử lý booking chưa sẵn sàng", "danger");
        return;
      }

      // Xử lý booking hoàn chỉnh: confirm -> reduce stock -> send email
      const result = await window.BOOKING_MANAGER.processCompleteBooking(bookingData);

      if (!result.success) {
        // Nếu không thành công, giải phóng lock và hiển thị lỗi
        if (window.BOOKING_MANAGER) {
          window.BOOKING_MANAGER.releaseLock(code);
        }
        showToast(result.error || "Không thể xử lý thanh toán", "danger");
        setTimeout(() => window.location.href = "cart.html", 3000);
        return;
      }

      // Track checkout completed
      if (window.TRACKING) {
        window.TRACKING.trackCheckoutCompleted(result.booking);
      }

      // Xóa dữ liệu tạm
      sessionStorage.removeItem("pending_booking");
      sessionStorage.removeItem("checkout_cart_backup");
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");

      // Clear cart
      if (window.APP_CART) {
        window.APP_CART.clearCart();
      }

      // Update progress step
      $("#step-confirm").addClass("active completed");

      // Hiển thị kết quả
      $("#payment-processing").addClass("d-none");
      $("#payment-success").removeClass("d-none");
      $("#payment-code").text(result.booking.code);
      $("#payment-total").text(formatPrice(result.booking.total || 0));

      // Hiển thị thông báo thành công
      if (result.status === "pending") {
        showToast(result.message || "Đang chờ xác nhận từ nhà cung cấp", "info");
      } else {
        showToast("Thanh toán thành công! Email xác nhận đã được gửi.", "success");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      showToast("Có lỗi xảy ra: " + err.message, "danger");
      
      // Giải phóng lock nếu có
      if (window.BOOKING_MANAGER) {
        window.BOOKING_MANAGER.releaseLock(code);
      }
      
      setTimeout(() => window.location.href = "cart.html", 3000);
    }
  }

  $(function () {
    // Delay một chút để đảm bảo các script đã load
    setTimeout(() => {
      processPayment();
    }, 500);
  });
})();


