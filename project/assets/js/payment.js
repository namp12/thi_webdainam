/**
 * Payment Processing Page
 */
(function () {
  const { formatPrice, storage } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  function getBookingCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("booking") || "";
  }

  function processPayment() {
    const code = getBookingCode();
    if (!code) {
      window.location.href = "cart.html";
      return;
    }

    // Simulate payment processing
    setTimeout(() => {
      const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
      const booking = bookings.find(b => b.code === code);

      if (booking) {
        // Update booking status
        booking.status = "confirmed";
        booking.paidAt = new Date().toISOString();
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        // Trigger custom event for dashboard updates
        $(document).trigger('bookingUpdated');

        // Show success
        $("#payment-processing").addClass("d-none");
        $("#payment-success").removeClass("d-none");
        $("#payment-code").text(code);
        $("#payment-total").text(formatPrice(booking.total || 0));
      } else {
        window.location.href = "cart.html";
      }
    }, 2000);
  }

  $(function () {
    processPayment();
  });
})();


