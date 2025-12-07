/**
 * Booking Cancellation Module
 * Xử lý hủy booking, tính phí hủy, hoàn tiền và hoàn lại stock
 */
(function () {
  const { storage, showToast, formatPrice } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  /**
   * IV. Cancellation/Modification Processing
   */

  /**
   * Kiểm tra chính sách hủy và tính phí hủy
   */
  function checkCancellationPolicy(booking, cancellationDate = null) {
    if (!booking) {
      return {
        allowed: false,
        error: "Booking không tồn tại"
      };
    }

    if (booking.status === "cancelled") {
      return {
        allowed: false,
        error: "Booking đã bị hủy trước đó"
      };
    }

    if (booking.status !== "confirmed" && booking.status !== "pending") {
      return {
        allowed: false,
        error: "Không thể hủy booking ở trạng thái này"
      };
    }

    const cancelDate = cancellationDate ? new Date(cancellationDate) : new Date();
    const departureDate = new Date(booking.departureDate);
    const daysUntilDeparture = Math.floor((departureDate - cancelDate) / (1000 * 60 * 60 * 24));

    // Chính sách hủy (có thể lấy từ tour hoặc booking)
    const cancellationPolicy = booking.cancellationPolicy || {
      freeCancellationDays: 7, // Hủy miễn phí nếu trước 7 ngày
      cancellationFees: [
        { days: 7, feePercent: 0 },      // Trước 7 ngày: miễn phí
        { days: 3, feePercent: 50 },      // 3-7 ngày: 50%
        { days: 1, feePercent: 75 },      // 1-3 ngày: 75%
        { days: 0, feePercent: 100 }      // Dưới 1 ngày: 100%
      ]
    };

    // Tính phí hủy
    let feePercent = 100; // Mặc định: không hoàn tiền
    let feeReason = "";

    if (daysUntilDeparture >= cancellationPolicy.freeCancellationDays) {
      feePercent = 0;
      feeReason = "Hủy miễn phí (trước 7 ngày)";
    } else if (daysUntilDeparture >= 3) {
      feePercent = 50;
      feeReason = "Hủy trước 3-7 ngày: phí 50%";
    } else if (daysUntilDeparture >= 1) {
      feePercent = 75;
      feeReason = "Hủy trước 1-3 ngày: phí 75%";
    } else {
      feePercent = 100;
      feeReason = "Hủy trong vòng 24h: không hoàn tiền";
    }

    const cancellationFee = (booking.total * feePercent) / 100;
    const refundAmount = booking.total - cancellationFee;

    return {
      allowed: true,
      daysUntilDeparture,
      feePercent,
      cancellationFee,
      refundAmount,
      feeReason,
      policy: cancellationPolicy
    };
  }

  /**
   * Xử lý hoàn tiền
   */
  async function processRefund(booking, refundAmount) {
    try {
      // Trong thực tế, đây sẽ là API call đến payment gateway
      // Giả lập xử lý hoàn tiền
      await new Promise(resolve => setTimeout(resolve, 1000));

      const refund = {
        bookingCode: booking.code,
        amount: refundAmount,
        originalAmount: booking.total,
        paymentMethod: booking.paymentMethod,
        processedAt: new Date().toISOString(),
        status: "completed",
        refundId: `REF-${Date.now()}`
      };

      // Lưu thông tin hoàn tiền vào booking
      const bookings = storage.get(BOOKINGS_KEY, []);
      const bookingIndex = bookings.findIndex(b => b.code === booking.code);
      
      if (bookingIndex !== -1) {
        bookings[bookingIndex].refund = refund;
        bookings[bookingIndex].refundAmount = refundAmount;
        storage.set(BOOKINGS_KEY, bookings);
      }

      return {
        success: true,
        refund
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Hoàn lại stock khi hủy booking
   */
  async function restoreStockOnCancellation(booking) {
    try {
      if (!window.BOOKING_MANAGER) {
        return {
          success: false,
          error: "Booking manager không khả dụng"
        };
      }

      const result = await window.BOOKING_MANAGER.restoreStock(
        booking.tourId,
        booking.quantity
      );

      return result;
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Hủy booking hoàn chỉnh
   */
  async function cancelBooking(bookingCode, reason = "", cancellationDate = null) {
    try {
      const bookings = storage.get(BOOKINGS_KEY, []);
      const bookingIndex = bookings.findIndex(b => b.code === bookingCode);
      
      if (bookingIndex === -1) {
        return {
          success: false,
          error: "Booking không tồn tại"
        };
      }

      const booking = bookings[bookingIndex];

      // 1. Kiểm tra chính sách hủy
      const policyCheck = checkCancellationPolicy(booking, cancellationDate);
      
      if (!policyCheck.allowed) {
        return {
          success: false,
          error: policyCheck.error
        };
      }

      // 2. Cập nhật trạng thái booking
      booking.status = "cancelled";
      booking.cancelledAt = cancellationDate || new Date().toISOString();
      booking.cancellationReason = reason;
      booking.cancellationFee = policyCheck.cancellationFee;
      booking.refundAmount = policyCheck.refundAmount;
      booking.feeReason = policyCheck.feeReason;

      // 3. Hoàn lại stock
      const stockResult = await restoreStockOnCancellation(booking);
      
      if (!stockResult.success) {
        console.warn("Không thể hoàn lại stock:", stockResult.error);
        // Vẫn tiếp tục hủy booking dù không hoàn được stock
      }

      // 4. Xử lý hoàn tiền (nếu có)
      if (policyCheck.refundAmount > 0) {
        const refundResult = await processRefund(booking, policyCheck.refundAmount);
        
        if (!refundResult.success) {
          console.warn("Không thể hoàn tiền:", refundResult.error);
          booking.refundStatus = "failed";
          booking.refundError = refundResult.error;
        } else {
          booking.refund = refundResult.refund;
          booking.refundStatus = "completed";
        }
      } else {
        booking.refundStatus = "no_refund";
      }

      // 5. Lưu booking đã cập nhật
      bookings[bookingIndex] = booking;
      storage.set(BOOKINGS_KEY, bookings);

      // 6. Gửi email thông báo hủy (giả lập)
      sendCancellationEmail(booking, policyCheck);

      // 7. Trigger event
      $(document).trigger('bookingUpdated', [booking]);
      $(document).trigger('bookingCancelled', [booking]);

      return {
        success: true,
        booking,
        cancellationFee: policyCheck.cancellationFee,
        refundAmount: policyCheck.refundAmount,
        feeReason: policyCheck.feeReason
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Gửi email thông báo hủy
   */
  function sendCancellationEmail(booking, policyCheck) {
    const emailData = {
      to: booking.customer.email,
      subject: `Thông báo hủy đặt tour - ${booking.code}`,
      body: `
        Kính chào ${booking.customer.name},
        
        Chúng tôi xác nhận đã nhận được yêu cầu hủy đặt tour của bạn.
        
        Mã đặt chỗ: ${booking.code}
        Tour: ${booking.tourTitle}
        ${policyCheck.feeReason}
        
        ${policyCheck.refundAmount > 0 
          ? `Số tiền hoàn lại: ${formatPrice(policyCheck.refundAmount)}\nPhí hủy: ${formatPrice(policyCheck.cancellationFee)}`
          : "Theo chính sách, không có hoàn tiền cho trường hợp này."
        }
        
        ${booking.refundStatus === "completed" 
          ? "Tiền hoàn lại sẽ được chuyển về tài khoản của bạn trong vòng 3-5 ngày làm việc."
          : ""
        }
        
        Trân trọng,
        Travel Booking Team
      `
    };
    
    console.log("Email thông báo hủy đã được gửi:", emailData);
    return { success: true, emailData };
  }

  /**
   * Lấy danh sách bookings có thể hủy
   */
  function getCancellableBookings() {
    try {
      const bookings = storage.get(BOOKINGS_KEY, []);
      return bookings.filter(b => {
        if (b.status === "cancelled") return false;
        if (b.status !== "confirmed" && b.status !== "pending") return false;
        return true;
      });
    } catch {
      return [];
    }
  }

  /**
   * Lấy thông tin chi tiết về chính sách hủy cho một booking
   */
  function getCancellationInfo(bookingCode) {
    try {
      const bookings = storage.get(BOOKINGS_KEY, []);
      const booking = bookings.find(b => b.code === bookingCode);
      
      if (!booking) {
        return {
          found: false,
          error: "Booking không tồn tại"
        };
      }

      const policyCheck = checkCancellationPolicy(booking);
      
      return {
        found: true,
        booking,
        policy: policyCheck
      };
    } catch (err) {
      return {
        found: false,
        error: err.message
      };
    }
  }

  // Expose API
  window.BOOKING_CANCELLATION = {
    checkCancellationPolicy,
    processRefund,
    restoreStockOnCancellation,
    cancelBooking,
    sendCancellationEmail,
    getCancellableBookings,
    getCancellationInfo
  };
})();

