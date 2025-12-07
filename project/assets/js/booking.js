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
    
    // Hiển thị stock
    const stock = tour.stock || tour.availableSlots || 999;
    const stockHtml = stock > 0
      ? `<span class="stock-badge bg-success"><i class="bi bi-check-circle me-1"></i>Còn ${stock} chỗ</span>`
      : `<span class="stock-badge bg-danger"><i class="bi bi-x-circle me-1"></i>Hết chỗ</span>`;
    
    $("#bk-tour-stock").html(stockHtml);

    // Set min date cho departure date (không được chọn ngày quá khứ)
    const today = new Date().toISOString().split('T')[0];
    $("#bk-departure-date").attr("min", today);
    
    // Khi chọn departure date, set min cho return date
    $("#bk-departure-date").on("change", function() {
      const depDate = $(this).val();
      const $error = $("#bk-departure-date-error");
      if (depDate) {
        $("#bk-return-date").attr("min", depDate);
        if (depDate < today) {
          $(this).addClass("is-invalid").removeClass("is-valid");
          $error.html('<i class="bi bi-exclamation-circle"></i> Ngày đi không được là ngày quá khứ').removeClass("d-none");
        } else {
          $(this).addClass("is-valid").removeClass("is-invalid");
          $error.addClass("d-none");
        }
      }
    });

    // Setup validation
    setupBookingValidation();
  }

  function setupBookingValidation() {
    // Name validation
    $("#bk-name").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim();
      const $error = $("#bk-name-error");
      
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
    $("#bk-email").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim();
      const $error = $("#bk-email-error");
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
    $("#bk-phone").on("blur", function() {
      const $input = $(this);
      const value = $input.val().trim().replace(/\s/g, "");
      const $error = $("#bk-phone-error");
      
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

    // Quantity validation
    $("#bk-quantity").on("blur", function() {
      const $input = $(this);
      const value = parseInt($input.val()) || 0;
      const $error = $("#bk-quantity-error");
      
      if (value < 1) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Số lượng phải lớn hơn 0').removeClass("d-none");
      } else if (value > 100) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Số lượng không được vượt quá 100').removeClass("d-none");
      } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
      }
    });

    // Return date validation
    $("#bk-return-date").on("change", function() {
      const $input = $(this);
      const returnDate = $input.val();
      const departureDate = $("#bk-departure-date").val();
      const $error = $("#bk-return-date-error");
      
      if (returnDate && departureDate && returnDate < departureDate) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $error.html('<i class="bi bi-exclamation-circle"></i> Ngày về phải sau ngày đi').removeClass("d-none");
      } else if (returnDate) {
        $input.addClass("is-valid").removeClass("is-invalid");
        $error.addClass("d-none");
      }
    });

    // Discount code handler
    $("#btn-apply-discount-booking").on("click", function() {
      const code = $("#bk-discount-code").val().trim();
      const $error = $("#bk-discount-error");
      const $success = $("#bk-discount-success");
      
      if (!code) {
        window.APP_UTILS.showToast("Vui lòng nhập mã giảm giá", "warning");
        return;
      }

      if (!window.BOOKING_VALIDATION) {
        window.APP_UTILS.showToast("Hệ thống validation chưa sẵn sàng", "danger");
        return;
      }

      const validation = window.BOOKING_VALIDATION.validateDiscountCode(code);
      
      if (validation.valid) {
        $error.addClass("d-none");
        $success.html(`<i class="bi bi-check-circle"></i> Mã giảm giá hợp lệ!`).removeClass("d-none");
        $("#bk-discount-code").addClass("is-valid").removeClass("is-invalid");
        window.APP_UTILS.showToast("Mã giảm giá đã được áp dụng", "success");
      } else {
        $success.addClass("d-none");
        $error.html(`<i class="bi bi-exclamation-circle"></i> ${validation.error}`).removeClass("d-none");
        $("#bk-discount-code").addClass("is-invalid").removeClass("is-valid");
      }
    });
  }

  $(function () {
    const tourId = getTourId();
    if (tourId) {
      loadTour(tourId).then(renderSummary).catch(() => {});
    }

    $("#booking-form").on("submit", async function (e) {
      e.preventDefault();
      const $form = $(this);
      const $submitBtn = $form.find("button[type='submit']");
      const originalText = $submitBtn.html();
      
      $submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...');

      try {
        // Lấy dữ liệu từ form
        const name = $("#bk-name").val().trim();
        const email = $("#bk-email").val().trim();
        const phone = $("#bk-phone").val().trim();
        const departureDate = $("#bk-departure-date").val();
        const returnDate = $("#bk-return-date").val();
        const quantity = parseInt($("#bk-quantity").val()) || 1;
        const discountCode = $("#bk-discount-code").val().trim() || null;
        const note = $("#bk-note").val().trim();
        const paymentMethod = $("#bk-payment").val();

        // Validate với booking validation module
        if (!window.BOOKING_VALIDATION) {
          window.APP_UTILS.showToast("Hệ thống validation chưa sẵn sàng", "danger");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 1. Validate input data
        const inputValidation = window.BOOKING_VALIDATION.validateInputData({
          tourId: tourId,
          quantity: quantity,
          departureDate: departureDate,
          returnDate: returnDate
        });

        if (!inputValidation.isValid) {
          window.APP_UTILS.showToast(inputValidation.errors[0], "warning");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 2. Check availability
        const availability = await window.BOOKING_VALIDATION.checkAvailability(
          tourId,
          quantity,
          departureDate
        );

        if (!availability.available) {
          window.APP_UTILS.showToast(availability.error, "danger");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 3. Validate customer data
        const customerValidation = window.BOOKING_VALIDATION.validateCustomerData({
          name,
          email,
          phone
        });

        if (!customerValidation.isValid) {
          window.APP_UTILS.showToast(customerValidation.errors[0], "warning");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 4. Validate payment
        const paymentValidation = window.BOOKING_VALIDATION.validatePaymentInfo(paymentMethod);
        if (!paymentValidation.isValid) {
          window.APP_UTILS.showToast(paymentValidation.errors[0], "warning");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 5. Load tour để lấy giá
        const tour = await loadTour(tourId);
        if (!tour) {
          window.APP_UTILS.showToast("Không tìm thấy tour", "danger");
          $submitBtn.prop("disabled", false).html(originalText);
          return;
        }

        // 6. Tính giá
        const subtotal = (tour.price || 0) * quantity;
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

        // 7. Tạo booking data
        const bookingCode = `BK${Date.now()}`;
        const bookingData = {
          code: bookingCode,
          tourId: tourId,
          tourTitle: tour.title || "Tour",
          quantity: quantity,
          departureDate: departureDate,
          returnDate: returnDate,
          customer: { name, email, phone, note },
          paymentMethod: paymentMethod,
          total: total,
          subtotal: subtotal,
          discount: discount,
          discountCode: discountCode,
          status: "pending",
          createdAt: new Date().toISOString()
        };

        // 8. Lock stock
        if (window.BOOKING_MANAGER) {
          const lockResult = window.BOOKING_MANAGER.lockStock(
            tourId,
            quantity,
            departureDate,
            bookingCode
          );

          if (!lockResult.success) {
            window.APP_UTILS.showToast("Không thể khóa chỗ. Vui lòng thử lại.", "danger");
            $submitBtn.prop("disabled", false).html(originalText);
            return;
          }
        }

        // 9. Lưu booking tạm thời
        saveBooking({
          ...bookingData,
          id: Date.now().toString()
        });

        // 10. Redirect đến payment page
        sessionStorage.setItem("pending_booking", JSON.stringify(bookingData));
        window.location.href = `payment.html?booking=${bookingCode}`;
      } catch (err) {
        console.error("Booking error:", err);
        window.APP_UTILS.showToast("Có lỗi xảy ra: " + err.message, "danger");
        $submitBtn.prop("disabled", false).html(originalText);
      }
    });
  });
})();

