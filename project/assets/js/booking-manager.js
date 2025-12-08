/**
 * Booking Manager Module
 * Xử lý locking, stock management, và confirmation
 */
(function () {
  const { storage, showToast } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;
  const { http } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";
  const LOCKED_BOOKINGS_KEY = "travel_locked_bookings";
  const LOCK_DURATION = 15 * 60 * 1000; // 15 phút

  /**
   * III. Post-Booking & Confirmation
   */

  /**
   * Khóa stock khi khách hàng bắt đầu thanh toán
   */
  function lockStock(tourId, quantity, departureDate, bookingCode) {
    try {
      const locks = storage.get(LOCKED_BOOKINGS_KEY, []);
      
      // Xóa các lock đã hết hạn
      const now = new Date();
      const activeLocks = locks.filter(lock => new Date(lock.expiresAt) > now);
      
      // Thêm lock mới
      const newLock = {
        tourId: String(tourId),
        quantity,
        departureDate,
        bookingCode,
        lockedAt: new Date().toISOString(),
        expiresAt: new Date(now.getTime() + LOCK_DURATION).toISOString()
      };
      
      activeLocks.push(newLock);
      storage.set(LOCKED_BOOKINGS_KEY, activeLocks);
      
      return {
        success: true,
        lock: newLock
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Giải phóng lock khi booking bị hủy hoặc hết hạn
   */
  function releaseLock(bookingCode) {
    try {
      const locks = storage.get(LOCKED_BOOKINGS_KEY, []);
      const filtered = locks.filter(lock => lock.bookingCode !== bookingCode);
      storage.set(LOCKED_BOOKINGS_KEY, filtered);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Xóa các lock đã hết hạn
   */
  function cleanupExpiredLocks() {
    try {
      const locks = storage.get(LOCKED_BOOKINGS_KEY, []);
      const now = new Date();
      const activeLocks = locks.filter(lock => new Date(lock.expiresAt) > now);
      storage.set(LOCKED_BOOKINGS_KEY, activeLocks);
      return activeLocks.length;
    } catch {
      return 0;
    }
  }

  /**
   * Xác nhận booking từ nhà cung cấp (giả lập API)
   */
  async function confirmWithProvider(bookingData) {
    try {
      // Giả lập API call đến nhà cung cấp
      // Trong thực tế, đây sẽ là API call thật
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Giả lập: 90% thành công, 10% pending
      const success = Math.random() > 0.1;
      
      if (success) {
        return {
          confirmed: true,
          providerBookingId: `PROV-${Date.now()}`,
          confirmedAt: new Date().toISOString()
        };
      } else {
        return {
          confirmed: false,
          status: "pending",
          message: "Đang chờ xác nhận từ nhà cung cấp"
        };
      }
    } catch (err) {
      return {
        confirmed: false,
        error: err.message
      };
    }
  }

  /**
   * Giảm stock sau khi xác nhận booking
   */
  async function reduceStock(tourId, quantity) {
    try {
      // Lấy danh sách tours
      const tours = await http.get(`${API.tours}`);
      const tourList = Array.isArray(tours) ? tours : [tours];
      const tourIndex = tourList.findIndex(t => String(t.id) === String(tourId));
      
      if (tourIndex === -1) {
        return { success: false, error: "Tour không tồn tại" };
      }

      const tour = tourList[tourIndex];
      const currentStock = tour.stock || tour.availableSlots || 999;
      
      if (currentStock < quantity) {
        return {
          success: false,
          error: `Không đủ stock. Còn lại: ${currentStock}, yêu cầu: ${quantity}`
        };
      }

      // Cập nhật stock (trong thực tế sẽ là API call)
      tour.stock = currentStock - quantity;
      tour.availableSlots = tour.stock;
      
      // Lưu lại (trong thực tế sẽ update qua API)
      // localStorage chỉ để demo
      const updatedTours = [...tourList];
      updatedTours[tourIndex] = tour;
      
      return {
        success: true,
        newStock: tour.stock,
        tour
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
  async function restoreStock(tourId, quantity) {
    try {
      const tours = await http.get(`${API.tours}`);
      const tourList = Array.isArray(tours) ? tours : [tours];
      const tourIndex = tourList.findIndex(t => String(t.id) === String(tourId));
      
      if (tourIndex === -1) {
        return { success: false, error: "Tour không tồn tại" };
      }

      const tour = tourList[tourIndex];
      const currentStock = tour.stock || tour.availableSlots || 0;
      tour.stock = currentStock + quantity;
      tour.availableSlots = tour.stock;
      
      return {
        success: true,
        newStock: tour.stock
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Lưu booking vào database
   */
  function saveBooking(bookingData) {
    try {
      const bookings = storage.get(BOOKINGS_KEY, []);
      
      const booking = {
        id: Date.now().toString(),
        code: bookingData.code || `BK${Date.now()}`,
        tourId: bookingData.tourId,
        tourTitle: bookingData.tourTitle,
        quantity: bookingData.quantity,
        departureDate: bookingData.departureDate,
        returnDate: bookingData.returnDate,
        customer: bookingData.customer,
        paymentMethod: bookingData.paymentMethod,
        paymentData: bookingData.paymentData || {},
        total: bookingData.total,
        subtotal: bookingData.subtotal,
        discount: bookingData.discount || 0,
        discountCode: bookingData.discountCode,
        status: bookingData.status || "pending",
        providerBookingId: bookingData.providerBookingId,
        confirmedAt: bookingData.confirmedAt,
        createdAt: bookingData.createdAt || new Date().toISOString(),
        paidAt: bookingData.paidAt,
        cancelledAt: bookingData.cancelledAt,
        cancellationFee: bookingData.cancellationFee,
        refundAmount: bookingData.refundAmount
      };
      
      bookings.push(booking);
      storage.set(BOOKINGS_KEY, bookings);
      
      // Trigger event
      $(document).trigger('bookingUpdated', [booking]);
      
      return {
        success: true,
        booking
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Cập nhật trạng thái booking
   */
  function updateBookingStatus(bookingCode, status, additionalData = {}) {
    try {
      const bookings = storage.get(BOOKINGS_KEY, []);
      const bookingIndex = bookings.findIndex(b => b.code === bookingCode);
      
      if (bookingIndex === -1) {
        return { success: false, error: "Booking không tồn tại" };
      }

      const booking = bookings[bookingIndex];
      booking.status = status;
      
      // Thêm dữ liệu bổ sung
      Object.assign(booking, additionalData);
      
      bookings[bookingIndex] = booking;
      storage.set(BOOKINGS_KEY, bookings);
      
      // Trigger event
      $(document).trigger('bookingUpdated', [booking]);
      
      return {
        success: true,
        booking
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Gửi email xác nhận (giả lập)
   */
  function sendConfirmationEmail(booking) {
    // Trong thực tế, đây sẽ là API call đến email service
    const emailData = {
      to: booking.customer.email,
      subject: `Xác nhận đặt tour - ${booking.code}`,
      body: `
        Kính chào ${booking.customer.name},
        
        Cảm ơn bạn đã đặt tour với chúng tôi!
        
        Mã đặt chỗ: ${booking.code}
        Tour: ${booking.tourTitle}
        Số lượng: ${booking.quantity} người
        Ngày đi: ${booking.departureDate}
        Ngày về: ${booking.returnDate}
        Tổng tiền: ${window.APP_UTILS.formatPrice(booking.total)}
        Trạng thái: ${booking.status}
        
        Trân trọng,
        Travel Booking Team
      `
    };
    
    console.log("Email xác nhận đã được gửi:", emailData);
    return { success: true, emailData };
  }

  /**
   * Xử lý booking hoàn chỉnh: lock -> confirm -> reduce stock -> send email
   */
  async function processCompleteBooking(bookingData) {
    try {
      // 1. Lock stock
      const lockResult = lockStock(
        bookingData.tourId,
        bookingData.quantity,
        bookingData.departureDate,
        bookingData.code
      );
      
      if (!lockResult.success) {
        return {
          success: false,
          error: "Không thể khóa stock: " + lockResult.error
        };
      }

      // 2. Xác nhận với nhà cung cấp
      const providerResult = await confirmWithProvider(bookingData);
      
      if (!providerResult.confirmed) {
        // Nếu chưa xác nhận, giữ booking ở trạng thái pending
        bookingData.status = "pending";
        bookingData.providerStatus = providerResult.status;
        const saveResult = saveBooking(bookingData);
        
        return {
          success: true,
          status: "pending",
          booking: saveResult.booking,
          message: providerResult.message || "Đang chờ xác nhận từ nhà cung cấp"
        };
      }

      // 3. Giảm stock
      const stockResult = await reduceStock(bookingData.tourId, bookingData.quantity);
      
      if (!stockResult.success) {
        // Nếu không giảm được stock, giải phóng lock
        releaseLock(bookingData.code);
        return {
          success: false,
          error: stockResult.error
        };
      }

      // 4. Cập nhật booking với thông tin xác nhận
      bookingData.status = "confirmed";
      bookingData.providerBookingId = providerResult.providerBookingId;
      bookingData.confirmedAt = providerResult.confirmedAt;
      bookingData.paidAt = new Date().toISOString();
      
      const saveResult = saveBooking(bookingData);
      
      // 5. Gửi email xác nhận
      sendConfirmationEmail(saveResult.booking);
      
      // 6. Giải phóng lock (đã xác nhận rồi)
      releaseLock(bookingData.code);
      
      return {
        success: true,
        status: "confirmed",
        booking: saveResult.booking,
        stock: stockResult.newStock
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  // Cleanup expired locks on load
  $(function () {
    cleanupExpiredLocks();
    // Cleanup mỗi 5 phút
    setInterval(cleanupExpiredLocks, 5 * 60 * 1000);
  });

  // Expose API
  window.BOOKING_MANAGER = {
    lockStock,
    releaseLock,
    cleanupExpiredLocks,
    confirmWithProvider,
    reduceStock,
    restoreStock,
    saveBooking,
    updateBookingStatus,
    sendConfirmationEmail,
    processCompleteBooking
  };
})();



