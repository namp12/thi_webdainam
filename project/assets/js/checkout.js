/**
 * Checkout Page Handler
 * Tích hợp validation và booking manager
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
      // Parse price from API format (handles "21,664,750 VND" format)
      const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
      const price = parsedPrice;
      const total = price * item.quantity;
      subtotal += total;

      // Hiển thị stock status
      const stock = tour.stock || tour.availableSlots || 999;
      const stockStatus = stock > 0 
        ? `<span class="stock-badge bg-success"><i class="bi bi-check-circle me-1"></i>Còn ${stock} chỗ</span>`
        : `<span class="stock-badge bg-danger"><i class="bi bi-x-circle me-1"></i>Hết chỗ</span>`;

      return `
        <div class="summary-item">
          <div class="flex-grow-1">
            <div class="fw-semibold">${tour.title || 'Tour'}</div>
            <div class="small text-muted">${tour.destination || ''} • ${item.quantity} người</div>
            <div class="mt-1">${stockStatus}</div>
          </div>
          <div class="text-end">
            <div class="fw-bold">${formatPrice(total)}</div>
          </div>
        </div>
      `;
    }).join("");

    $items.html(html);
    $("#checkout-subtotal").text(formatPrice(subtotal));
    
    // Tính phí dịch vụ (5%)
    const serviceFee = subtotal * 0.05;
    const discount = parseFloat(sessionStorage.getItem("applied_discount") || "0");
    const total = subtotal + serviceFee - discount;
    
    $("#checkout-service-fee").text(formatPrice(serviceFee));
    
    // Update discount display with real-time calculation
    if (discount > 0) {
      $("#checkout-discount").text(`-${formatPrice(discount)}`).removeClass("d-none");
    } else {
      $("#checkout-discount").text("0 đ").addClass("d-none");
    }
    
    $("#checkout-total").text(formatPrice(total));
    
    // Track checkout started
    if (window.TRACKING) {
      window.TRACKING.trackCheckoutStarted(cart, total);
    }
  }

  // Real-time validation
  function setupValidation() {
    // Name validation
    $("#checkout-name").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim();
      const $error = $("#checkout-name-error");
      
      if (!value || value.length < 2) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Tên phải có ít nhất 2 ký tự').removeClass("d-none");
      } else if (/[<>{}[\]\\]/.test(value)) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Tên không được chứa ký tự đặc biệt').removeClass("d-none");
      } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
      }
    });

    // Email validation
    $("#checkout-email").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim();
      const $error = $("#checkout-email-error");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!value) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Email là bắt buộc').removeClass("d-none");
      } else if (!emailRegex.test(value)) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Email không hợp lệ').removeClass("d-none");
      } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
      }
    });

    // Phone validation
    $("#checkout-phone").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim().replace(/\s/g, "");
      const $error = $("#checkout-phone-error");
      
      if (!value) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Số điện thoại là bắt buộc').removeClass("d-none");
      } else if (!/^[0-9]{10,11}$/.test(value)) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Số điện thoại phải có 10-11 chữ số').removeClass("d-none");
      } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
      }
    });

    // Date validation
    $("#checkout-date").on("change", function() {
      const $input = $(this);
      const value = $input.val();
      const $error = $("#checkout-date-error");
      const today = new Date().toISOString().split('T')[0];
      
      if (!value) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Ngày khởi hành là bắt buộc').removeClass("d-none");
      } else if (value < today) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Ngày khởi hành không được là ngày quá khứ').removeClass("d-none");
      } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
        
        // Set min for return date
        if ($("#checkout-return-date").length) {
          $("#checkout-return-date").attr("min", value);
        }
      }
    });

    // Return date validation
    $("#checkout-return-date").on("change", function() {
      const $input = $(this);
      const returnDate = $input.val();
      const departureDate = $("#checkout-date").val();
      
      if (returnDate && departureDate && returnDate < departureDate) {
        $input.addClass("is-invalid").removeClass("is-valid");
        showToast("Ngày về phải sau ngày đi", "warning");
      } else if (returnDate) {
        $input.addClass("is-valid").removeClass("is-invalid");
      }
    });
  }

  // Real-time discount code calculation
  function calculateDiscountRealTime(code) {
    const cart = loadCheckoutData();
    if (!cart || !code) {
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#discount-preview").removeClass("active");
      if (cart) renderOrderSummary(cart);
      return;
    }

    if (!window.BOOKING_VALIDATION) return;

    const validation = window.BOOKING_VALIDATION.validateDiscountCode(code);
    
    if (!validation.valid) {
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#discount-preview").removeClass("active");
      if (cart) renderOrderSummary(cart);
      return;
    }

    const discount = validation.discount;
    const subtotal = cart.reduce((sum, item) => {
      const parsedPrice = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
      return sum + (parsedPrice * item.quantity);
    }, 0);

    let discountAmount = 0;
    if (discount.type === "percent") {
      discountAmount = subtotal * (discount.value / 100);
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else if (discount.type === "fixed") {
      discountAmount = discount.value;
    }

    // Check min order
    if (discount.minOrder && subtotal < discount.minOrder) {
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#discount-preview").removeClass("active");
      if (cart) renderOrderSummary(cart);
      return;
    }

    sessionStorage.setItem("applied_discount", discountAmount.toString());
    sessionStorage.setItem("applied_discount_code", code);
    
    // Update UI immediately
    if (cart) renderOrderSummary(cart);
    
    // Show preview
    showDiscountPreview(discountAmount, code);
  }

  // Show discount preview
  function showDiscountPreview(amount, code) {
    let $preview = $("#discount-preview");
    if (!$preview.length) {
      $(".order-summary .card-body").append(`
        <div id="discount-preview" class="discount-code-preview">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="discount-label">Mã ${code} đã được áp dụng</div>
              <div class="discount-amount">-${formatPrice(amount)}</div>
            </div>
            <button type="button" class="btn btn-sm btn-light" id="btn-remove-discount">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      `);
      $preview = $("#discount-preview");
    }
    $preview.find(".discount-label").text(`Mã ${code} đã được áp dụng`);
    $preview.find(".discount-amount").text(`-${formatPrice(amount)}`);
    $preview.addClass("active");
    
    // Remove discount handler
    $("#btn-remove-discount").off("click").on("click", function() {
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#checkout-discount-code").val("");
      $("#discount-preview").removeClass("active");
      const cart = loadCheckoutData();
      if (cart) renderOrderSummary(cart);
    });
  }

  // Discount code handler
  $("#btn-apply-discount").on("click", function() {
    const code = $("#checkout-discount-code").val().trim();
    const $error = $("#checkout-discount-error");
    const $success = $("#checkout-discount-success");
    
    if (!code) {
      showToast("Vui lòng nhập mã giảm giá", "warning");
      return;
    }

    if (!window.BOOKING_VALIDATION) {
      showToast("Hệ thống validation chưa sẵn sàng", "danger");
      return;
    }

    const validation = window.BOOKING_VALIDATION.validateDiscountCode(code);
    
    if (validation.valid) {
      $error.addClass("d-none");
      $success.html(`<i class="bi bi-check-circle"></i> Mã giảm giá hợp lệ!`).removeClass("d-none");
      $("#checkout-discount-code").addClass("is-valid").removeClass("is-invalid");
      
      // Calculate and apply immediately
      calculateDiscountRealTime(code);
      showToast("Mã giảm giá đã được áp dụng", "success");
    } else {
      $success.addClass("d-none");
      $error.html(`<i class="bi bi-exclamation-circle"></i> ${validation.error}`).removeClass("d-none");
      $("#checkout-discount-code").addClass("is-invalid").removeClass("is-valid");
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#discount-preview").removeClass("active");
    }
  });

  // Real-time discount code input (debounced)
  if (debounce) {
    $("#checkout-discount-code").on("input", debounce(function() {
      const code = $(this).val().trim();
      if (code.length >= 3) {
        calculateDiscountRealTime(code);
      } else {
        sessionStorage.removeItem("applied_discount");
        sessionStorage.removeItem("applied_discount_code");
        $("#discount-preview").removeClass("active");
        const cart = loadCheckoutData();
        if (cart) renderOrderSummary(cart);
      }
    }, 500));
  }

  function saveBooking(customerInfo, cart, paymentMethod) {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    const total = cart.reduce((sum, item) => {
      const parsedPrice = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
      return sum + (parsedPrice * item.quantity);
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

  $("#btn-process-payment").on("click", async function () {
    const $btn = $(this);
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...');

    try {
      const cart = loadCheckoutData();
      if (!cart || !cart.length) {
        $btn.prop("disabled", false).html(originalText);
        return;
      }

      // Lấy thông tin từ form
      const name = $("#checkout-name").val().trim();
      const email = $("#checkout-email").val().trim();
      const phone = $("#checkout-phone").val().trim();
      const departureDate = $("#checkout-date").val();
      const note = $("#checkout-note").val().trim();
      const paymentMethod = $("input[name='payment']:checked").val();
      const discountCode = $("#checkout-discount-code")?.val()?.trim() || null;

      // Validate customer data
      if (!window.BOOKING_VALIDATION) {
        showToast("Hệ thống validation chưa sẵn sàng", "danger");
        $btn.prop("disabled", false).html(originalText);
        return;
      }

      const customerValidation = window.BOOKING_VALIDATION.validateCustomerData({
        name,
        email,
        phone
      });

      if (!customerValidation.isValid) {
        showToast(customerValidation.errors[0], "warning");
        $btn.prop("disabled", false).html(originalText);
        return;
      }

      // Validate input data cho từng tour trong cart
      for (const item of cart) {
        if (!departureDate) {
          showToast("Vui lòng chọn ngày khởi hành", "warning");
          $btn.prop("disabled", false).html(originalText);
          return;
        }

        const inputValidation = window.BOOKING_VALIDATION.validateInputData({
          tourId: item.tourId,
          quantity: item.quantity,
          departureDate: departureDate,
          returnDate: departureDate // Tạm thời dùng departureDate, có thể thêm returnDate sau
        });

        if (!inputValidation.isValid) {
          showToast(inputValidation.errors[0], "warning");
          $btn.prop("disabled", false).html(originalText);
          return;
        }

        // Check availability
        const availability = await window.BOOKING_VALIDATION.checkAvailability(
          item.tourId,
          item.quantity,
          departureDate
        );

        if (!availability.available) {
          showToast(availability.error, "danger");
          $btn.prop("disabled", false).html(originalText);
          return;
        }
      }

      // Validate payment
      const paymentValidation = window.BOOKING_VALIDATION.validatePaymentInfo(paymentMethod);
      if (!paymentValidation.isValid) {
        showToast(paymentValidation.errors[0], "warning");
        $btn.prop("disabled", false).html(originalText);
        return;
      }

      // Tính tổng tiền
    const subtotal = cart.reduce((sum, item) => {
      const parsedPrice = window.APP_UTILS?.parsePrice(item.tour?.price) || Number(item.tour?.price || 0);
      return sum + (parsedPrice * item.quantity);
    }, 0);
      const serviceFee = subtotal * 0.05;
      let discount = 0;
      
      if (discountCode) {
        const discountValidation = window.BOOKING_VALIDATION.validateDiscountCode(discountCode);
        if (discountValidation.valid) {
          const discountInfo = discountValidation.discount;
          if (discountInfo.type === "percent") {
            discount = subtotal * (discountInfo.value / 100);
          } else {
            discount = discountInfo.value;
          }
        }
      }

      const total = subtotal + serviceFee - discount;

      // Tạo booking data
      const bookingCode = `BK${Date.now()}`;
      const customerInfo = { name, email, phone, note };
      
      // Track discount code usage
      if (discountCode && discount > 0 && window.TRACKING) {
        window.TRACKING.trackDiscountCodeUsed(discountCode, discount, total);
      }
      
      // Tạo booking cho từng tour (hoặc gộp lại)
      const bookingData = {
        code: bookingCode,
        tourId: cart[0].tourId, // Lấy tour đầu tiên, có thể mở rộng cho nhiều tour
        tourTitle: cart[0].tour?.title || "Tour",
        quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
        departureDate: departureDate,
        returnDate: departureDate, // Có thể thêm trường returnDate sau
        customer: customerInfo,
        paymentMethod: paymentMethod,
        total: total,
        subtotal: subtotal,
        discount: discount,
        discountCode: discountCode,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      // Lock stock trước khi chuyển đến payment
      if (window.BOOKING_MANAGER) {
        const lockResult = window.BOOKING_MANAGER.lockStock(
          cart[0].tourId,
          bookingData.quantity,
          departureDate,
          bookingCode
        );

        if (!lockResult.success) {
          showToast("Không thể khóa chỗ. Vui lòng thử lại.", "danger");
          $btn.prop("disabled", false).html(originalText);
          return;
        }
      }

      // Lưu booking tạm thời vào sessionStorage để payment page xử lý
      sessionStorage.setItem("pending_booking", JSON.stringify(bookingData));
      sessionStorage.setItem("checkout_cart_backup", JSON.stringify(cart));

      // Redirect to payment page
      window.location.href = `payment.html?booking=${bookingCode}`;
    } catch (err) {
      console.error("Checkout error:", err);
      showToast("Có lỗi xảy ra: " + err.message, "danger");
      $btn.prop("disabled", false).html(originalText);
    }
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

      // Set min date for departure
      const today = new Date().toISOString().split('T')[0];
      $("#checkout-date").attr("min", today);
    }

    // Setup validation
    setupValidation();

    // Payment method selection
    $(".payment-method input").on("change", function () {
      $(".payment-method label").removeClass("border-primary bg-light");
      $(this).closest(".payment-method").find("label").addClass("border-primary bg-light");
    });
  });
})();


