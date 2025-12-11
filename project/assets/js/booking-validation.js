/**
 * Booking Validation Module
 * Xử lý tất cả các validation trước khi đặt tour
 */
(function () {
  const { showToast } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;
  const { http } = window.APP_UTILS;

  /**
   * I. Pre-Booking Validation
   */

  /**
   * Kiểm tra tính hợp lệ của dữ liệu đầu vào
   */
  function validateInputData(data) {
    const errors = [];

    // Kiểm tra các trường bắt buộc
    if (!data.departureDate) {
      errors.push("Ngày đi là bắt buộc");
    }
    if (!data.returnDate) {
      errors.push("Ngày về là bắt buộc");
    }
    if (!data.quantity || data.quantity <= 0) {
      errors.push("Số lượng khách phải lớn hơn 0");
    }
    if (!data.tourId) {
      errors.push("Tour ID không hợp lệ");
    }

    // Kiểm tra định dạng ngày
    if (data.departureDate && data.returnDate) {
      const departure = new Date(data.departureDate);
      const returnDate = new Date(data.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departure < today) {
        errors.push("Ngày đi không được là ngày trong quá khứ");
      }
      if (returnDate < departure) {
        errors.push("Ngày về phải sau ngày đi");
      }
      if (departure.getTime() === returnDate.getTime()) {
        errors.push("Ngày về phải khác ngày đi");
      }
    }

    // Kiểm tra số lượng hợp lệ
    if (data.quantity && (data.quantity > 100 || data.quantity < 1)) {
      errors.push("Số lượng khách phải từ 1 đến 100");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Kiểm tra tính khả dụng (Availability)
   */
  async function checkAvailability(tourId, quantity, departureDate) {
    try {
      // Lấy thông tin tour
      const tours = await http.get(`${API.tours}`);
      const tour = Array.isArray(tours) 
        ? tours.find(t => String(t.id) === String(tourId))
        : tours;

      if (!tour) {
        return {
          available: false,
          error: "Tour không tồn tại"
        };
      }

      // Kiểm tra trạng thái tour
      if (tour.status === "locked" || tour.status === "maintenance") {
        return {
          available: false,
          error: "Tour hiện không khả dụng (đang bảo trì hoặc bị khóa)"
        };
      }

      // Kiểm tra stock
      const currentStock = tour.stock || tour.availableSlots || 999;
      const lockedStock = getLockedStock(tourId, departureDate);
      const availableStock = currentStock - lockedStock;

      if (quantity > availableStock) {
        return {
          available: false,
          error: `Chỉ còn ${availableStock} chỗ trống. Bạn yêu cầu ${quantity} chỗ.`,
          availableStock,
          requestedQuantity: quantity
        };
      }

      return {
        available: true,
        availableStock,
        tour
      };
    } catch (err) {
      return {
        available: false,
        error: "Không thể kiểm tra tính khả dụng: " + err.message
      };
    }
  }

  /**
   * Lấy số lượng đã bị khóa (locked) cho tour và ngày cụ thể
   */
  function getLockedStock(tourId, departureDate) {
    try {
      const lockedBookings = JSON.parse(localStorage.getItem("travel_locked_bookings") || "[]");
      const relevantLocks = lockedBookings.filter(lock => 
        String(lock.tourId) === String(tourId) &&
        lock.departureDate === departureDate &&
        lock.expiresAt > new Date().toISOString() // Chỉ tính các lock còn hiệu lực
      );
      return relevantLocks.reduce((sum, lock) => sum + (lock.quantity || 0), 0);
    } catch {
      return 0;
    }
  }

  /**
   * Kiểm tra giá và mã giảm giá
   */
  function validatePriceAndDiscount(price, discountCode = null) {
    const errors = [];

    // Kiểm tra giá hợp lệ
    if (!price || price <= 0) {
      errors.push("Giá tour không hợp lệ");
    }

    // Kiểm tra mã giảm giá (nếu có)
    if (discountCode) {
      const discount = validateDiscountCode(discountCode);
      if (!discount.valid) {
        errors.push(discount.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      discount: discountCode ? validateDiscountCode(discountCode) : null
    };
  }

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá
   */
  function validateDiscountCode(code) {
    try {
      const discounts = JSON.parse(localStorage.getItem("travel_discounts") || "[]");
      const discount = discounts.find(d => d.code === code && d.active);

      if (!discount) {
        return {
          valid: false,
          error: "Mã giảm giá không tồn tại hoặc đã hết hạn"
        };
      }

      // Kiểm tra hạn sử dụng
      const now = new Date();
      if (discount.expiresAt && new Date(discount.expiresAt) < now) {
        return {
          valid: false,
          error: "Mã giảm giá đã hết hạn"
        };
      }

      // Kiểm tra số lần sử dụng
      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        return {
          valid: false,
          error: "Mã giảm giá đã hết lượt sử dụng"
        };
      }

      return {
        valid: true,
        discount
      };
    } catch {
      return {
        valid: false,
        error: "Lỗi kiểm tra mã giảm giá"
      };
    }
  }

  /**
   * II. Booking Processing Validation
   */

  /**
   * Kiểm tra dữ liệu khách hàng
   */
  function validateCustomerData(customerData) {
    const errors = [];

    // Kiểm tra tên
    if (!customerData.name || customerData.name.trim().length < 2) {
      errors.push("Tên khách hàng phải có ít nhất 2 ký tự");
    }
    if (customerData.name && /[<>{}[\]\\]/.test(customerData.name)) {
      errors.push("Tên không được chứa ký tự đặc biệt");
    }

    // Kiểm tra email
    if (!customerData.email) {
      errors.push("Email là bắt buộc");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push("Email không hợp lệ");
    }

    // Kiểm tra số điện thoại
    if (!customerData.phone) {
      errors.push("Số điện thoại là bắt buộc");
    } else {
      const phone = customerData.phone.replace(/\s/g, "");
      if (!/^[0-9]{10,11}$/.test(phone)) {
        errors.push("Số điện thoại phải có 10-11 chữ số");
      }
    }

    // Kiểm tra tuổi (nếu có)
    if (customerData.age !== undefined && customerData.age !== null) {
      if (customerData.age < 0 || customerData.age > 120) {
        errors.push("Tuổi không hợp lệ");
      }
    }

    // Kiểm tra giới tính (nếu có)
    if (customerData.gender && !["male", "female", "other"].includes(customerData.gender)) {
      errors.push("Giới tính không hợp lệ");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Kiểm tra thông tin thanh toán
   */
  function validatePaymentInfo(paymentMethod, paymentData = {}) {
    const errors = [];

    if (!paymentMethod) {
      errors.push("Phương thức thanh toán là bắt buộc");
      return { isValid: false, errors };
    }

    // Kiểm tra theo từng phương thức
    switch (paymentMethod) {
      case "card":
        if (!paymentData.cardNumber || !/^\d{13,19}$/.test(paymentData.cardNumber.replace(/\s/g, ""))) {
          errors.push("Số thẻ không hợp lệ (13-19 chữ số)");
        }
        if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
          errors.push("Ngày hết hạn không hợp lệ (MM/YY)");
        }
        if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) {
          errors.push("CVV không hợp lệ (3-4 chữ số)");
        }
        break;
      case "momo":
      case "zalopay":
        if (!paymentData.phone || !/^[0-9]{10,11}$/.test(paymentData.phone.replace(/\s/g, ""))) {
          errors.push("Số điện thoại ví điện tử không hợp lệ");
        }
        break;
      case "bank":
        // Chuyển khoản không cần validation thêm
        break;
      default:
        errors.push("Phương thức thanh toán không được hỗ trợ");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate toàn bộ booking trước khi xử lý
   */
  async function validateCompleteBooking(bookingData) {
    const allErrors = [];
    const warnings = [];

    // 1. Validate input data
    const inputValidation = validateInputData(bookingData);
    if (!inputValidation.isValid) {
      allErrors.push(...inputValidation.errors);
    }

    // 2. Check availability
    if (inputValidation.isValid) {
      const availability = await checkAvailability(
        bookingData.tourId,
        bookingData.quantity,
        bookingData.departureDate
      );
      if (!availability.available) {
        allErrors.push(availability.error);
      }
    }

    // 3. Validate price and discount
    if (bookingData.price) {
      const priceValidation = validatePriceAndDiscount(
        bookingData.price,
        bookingData.discountCode
      );
      if (!priceValidation.isValid) {
        allErrors.push(...priceValidation.errors);
      }
    }

    // 4. Validate customer data
    if (bookingData.customer) {
      const customerValidation = validateCustomerData(bookingData.customer);
      if (!customerValidation.isValid) {
        allErrors.push(...customerValidation.errors);
      }
    }

    // 5. Validate payment info
    if (bookingData.paymentMethod) {
      const paymentValidation = validatePaymentInfo(
        bookingData.paymentMethod,
        bookingData.paymentData
      );
      if (!paymentValidation.isValid) {
        allErrors.push(...paymentValidation.errors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings
    };
  }

  // Expose API
  window.BOOKING_VALIDATION = {
    validateInputData,
    checkAvailability,
    validatePriceAndDiscount,
    validateDiscountCode,
    validateCustomerData,
    validatePaymentInfo,
    validateCompleteBooking,
    getLockedStock
  };
})();



