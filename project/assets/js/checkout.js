/**
 * Checkout Page Handler
 * Tích hợp validation và booking manager
 */
(function () {
  const { formatPrice, showToast, storage } = window.APP_UTILS;
  const BOOKINGS_KEY = "travel_bookings";

  async function loadCheckoutData() {
    console.log("📦 Đang load checkout data...");
    
    // LUÔN LUÔN lấy từ APP_CART trước (đảm bảo đồng bộ với giỏ hàng)
    let cart = null;
    if (window.APP_CART) {
      cart = window.APP_CART.getCart();
      console.log("📦 Cart từ APP_CART:", {
        items: cart ? cart.length : 0,
        cart: cart
      });
      
      // Nếu có cart nhưng thiếu tour data, load từ API
      if (cart && cart.length) {
        const { API } = window.APP_CONFIG || {};
        const { http } = window.APP_UTILS || {};
        
        // Kiểm tra và load tour data cho các items thiếu
        const itemsNeedingData = cart.filter(item => !item.tour || !item.tour.price);
        if (itemsNeedingData.length > 0 && API && http) {
          console.log(`⚠️ ${itemsNeedingData.length} items thiếu tour data, đang load từ API...`);
          
          try {
            await Promise.all(itemsNeedingData.map(async (item) => {
              try {
                const tour = await http.get(`${API.tours}/${item.tourId}`);
                item.tour = tour;
                console.log(`✅ Đã load tour data cho item ${item.tourId}:`, tour);
              } catch (err) {
                console.error(`❌ Không thể load tour ${item.tourId}:`, err);
              }
            }));
            
            // Lưu lại cart đã có đầy đủ data
            window.APP_CART.saveCart(cart);
            console.log("✅ Đã cập nhật cart với tour data đầy đủ");
          } catch (err) {
            console.error("❌ Lỗi khi load tour data:", err);
          }
        }
        
        // Lưu vào sessionStorage để đảm bảo
        try {
          sessionStorage.setItem("checkout_cart", JSON.stringify(cart));
          console.log("✅ Đã đồng bộ cart từ APP_CART sang sessionStorage");
        } catch (err) {
          console.warn("⚠️ Không thể lưu vào sessionStorage:", err);
        }
      }
    }
    
    // Nếu không có từ APP_CART, thử lấy từ sessionStorage
    if (!cart || !cart.length) {
      console.log("⚠️ Không có cart từ APP_CART, thử lấy từ sessionStorage...");
      const cartData = sessionStorage.getItem("checkout_cart");
      if (cartData) {
        try {
          cart = JSON.parse(cartData);
          console.log("✅ Đã load cart từ sessionStorage:", {
            items: cart.length,
            cart: cart
          });
        } catch (err) {
          console.error("❌ Lỗi khi parse cart từ sessionStorage:", err);
        }
      }
    }
    
    if (!cart || !cart.length) {
      console.error("❌ Không tìm thấy cart data trong cả APP_CART và sessionStorage");
      showToast("Không tìm thấy đơn hàng. Vui lòng thêm tour vào giỏ hàng.", "warning");
      setTimeout(() => window.location.href = "cart.html", 2000);
      return null;
    }
    
    // Kiểm tra xem cart có tour data đầy đủ không
    const validCart = cart.filter(item => item.tour && item.tour.price);
    if (validCart.length !== cart.length) {
      console.warn("⚠️ Một số items không có tour data đầy đủ:", {
        total: cart.length,
        valid: validCart.length,
        invalid: cart.length - validCart.length
      });
    }
    
    console.log("✅ Đã load cart thành công:", {
      items: cart.length,
      validItems: validCart.length
    });
    
    return cart;
  }

  function renderOrderSummary(cart) {
    console.log("🔄 renderOrderSummary được gọi với cart:", cart);
    
    if (!cart || !cart.length) {
      console.warn("⚠️ Cart rỗng hoặc không hợp lệ");
      $("#checkout-subtotal").text(formatPrice(0) + " ₫");
      $("#checkout-service-fee").text(formatPrice(0) + " ₫");
      $("#checkout-total").text(formatPrice(0) + " ₫");
      return;
    }
    
    const $items = $("#checkout-items");
    let subtotal = 0;

    const html = cart.map(item => {
      const tour = item.tour || {};
      
      // Kiểm tra tour có dữ liệu không
      if (!tour || !tour.price) {
        console.warn("⚠️ Tour không có dữ liệu hoặc không có price:", item);
        return "";
      }
      
      // Parse price from API format (handles "21,664,750 VND" format)
      const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
      
      // Kiểm tra parsedPrice hợp lệ
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        console.warn("⚠️ Giá tour không hợp lệ:", parsedPrice, tour);
        return "";
      }
      
      // Calculate pricing with promotions (giống như trong cart-page.js)
      let pricing = { 
        originalPrice: parsedPrice, 
        finalPrice: parsedPrice, 
        discount: 0, 
        discountPercent: 0, 
        promotion: null 
      };
      
      if (window.PRICING_MANAGER) {
        try {
          pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
        } catch (err) {
          console.warn("Lỗi khi tính pricing cho tour:", err);
          // Giữ nguyên giá gốc
        }
      }
      
      // Sử dụng finalPrice (đã có promotion) thay vì originalPrice
      const price = pricing.finalPrice;
      const total = price * item.quantity;
      subtotal += total;
      
      console.log(`📦 Item ${tour.title || 'Tour'}:`, {
        quantity: item.quantity,
        originalPrice: pricing.originalPrice,
        finalPrice: pricing.finalPrice,
        total: total,
        subtotalSoFar: subtotal
      });

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
    
    // Log tổng sau khi tính toán
    console.log("📊 Tổng sau khi tính toán tất cả items:", {
      subtotal: subtotal,
      cartItems: cart.length
    });
    
    // Cập nhật subtotal TRỰC TIẾP vào DOM
    const subtotalFormatted = formatPrice(subtotal) + " ₫";
    $("#checkout-subtotal").text(subtotalFormatted);
    console.log("✅ Đã cập nhật subtotal:", subtotalFormatted);
    
    // Tính phí dịch vụ (5%)
    const serviceFee = subtotal * 0.05;
    
    // Lấy discount từ sessionStorage (có thể là số hoặc JSON string)
    let discount = 0;
    const discountData = sessionStorage.getItem("applied_discount");
    if (discountData) {
      try {
        // Thử parse nếu là JSON
        const parsed = JSON.parse(discountData);
        if (parsed.discountAmount) {
          discount = parsed.discountAmount;
        } else {
          discount = parseFloat(discountData) || 0;
        }
      } catch (e) {
        // Nếu không phải JSON, parse như số
        discount = parseFloat(discountData) || 0;
      }
    }
    
    const total = subtotal + serviceFee - discount;
    const finalTotal = Math.max(0, total);
    
    // Cập nhật service fee TRỰC TIẾP vào DOM
    const serviceFeeFormatted = formatPrice(serviceFee) + " ₫";
    $("#checkout-service-fee").text(serviceFeeFormatted);
    console.log("✅ Đã cập nhật serviceFee:", serviceFeeFormatted);
    
    // Update discount display with real-time calculation
    if (discount > 0) {
      const discountFormatted = `-${formatPrice(discount)} ₫`;
      $("#checkout-discount").text(discountFormatted).removeClass("d-none");
      console.log("✅ Đã cập nhật discount:", discountFormatted);
    } else {
      $("#checkout-discount").text("0 đ").addClass("d-none");
      console.log("ℹ️ Không có mã giảm giá");
    }
    
    // Cập nhật total TRỰC TIẾP vào DOM
    const totalFormatted = formatPrice(finalTotal) + " ₫";
    $("#checkout-total").text(totalFormatted);
    console.log("✅ Đã cập nhật total:", totalFormatted);
    
    // Log tổng kết
    console.log("💰 Tính toán summary:", {
      subtotal: subtotal,
      serviceFee: serviceFee,
      discount: discount,
      total: finalTotal
    });
    
    // Enable/disable nút thanh toán
    const $payBtn = $("#btn-process-payment");
    if ($payBtn.length) {
      if (finalTotal > 0) {
        $payBtn.prop("disabled", false);
        console.log("✅ Nút thanh toán: ENABLED (total > 0)");
      } else {
        $payBtn.prop("disabled", true);
        console.log("⚠️ Nút thanh toán: DISABLED (total = 0)");
      }
    } else {
      console.error("❌ Không tìm thấy nút thanh toán!");
    }
    
    // Track checkout started
    if (window.TRACKING) {
      window.TRACKING.trackCheckoutStarted(cart, finalTotal);
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

    // Return date validation với debounce để tránh trigger nhiều lần
    let returnDateValidationTimeout = null;
    $("#checkout-return-date").off("change").on("change", function() {
      const $input = $(this);
      
      // Clear timeout trước đó
      if (returnDateValidationTimeout) {
        clearTimeout(returnDateValidationTimeout);
      }
      
      // Debounce validation
      returnDateValidationTimeout = setTimeout(() => {
        const returnDate = $input.val();
        const departureDate = $("#checkout-date").val();
        
        // Tạo error element nếu chưa có
        let $error = $("#checkout-return-date-error");
        if (!$error.length) {
          $input.after('<div class="invalid-feedback d-none" id="checkout-return-date-error"></div>');
          $error = $("#checkout-return-date-error");
        }
        
        // Nếu không có ngày về, không validate (trường này không bắt buộc)
        if (!returnDate) {
          $input.removeClass("is-invalid is-valid");
          $error.addClass("d-none");
          return;
        }
        
        // Nếu không có ngày đi, yêu cầu chọn ngày đi trước
        if (!departureDate) {
          $input.addClass("is-invalid").removeClass("is-valid");
          $error.html('<i class="bi bi-exclamation-circle"></i> Vui lòng chọn ngày khởi hành trước').removeClass("d-none");
          return;
        }
        
        // Chuyển đổi sang Date object để so sánh chính xác
        const returnDateObj = new Date(returnDate);
        const departureDateObj = new Date(departureDate);
        
        // Reset time để chỉ so sánh ngày
        returnDateObj.setHours(0, 0, 0, 0);
        departureDateObj.setHours(0, 0, 0, 0);
        
        // Kiểm tra ngày về phải SAU ngày đi (không được bằng)
        if (returnDateObj.getTime() <= departureDateObj.getTime()) {
          $input.addClass("is-invalid").removeClass("is-valid");
          $error.html('<i class="bi bi-exclamation-circle"></i> Ngày về phải sau ngày đi').removeClass("d-none");
          // Chỉ hiển thị toast nếu thực sự có lỗi và chưa hiển thị
          if (!$input.data('toast-shown')) {
            showToast("Ngày về phải sau ngày đi", "warning");
            $input.data('toast-shown', true);
            // Reset sau 2 giây
            setTimeout(() => {
              $input.data('toast-shown', false);
            }, 2000);
          }
        } else {
          $input.addClass("is-valid").removeClass("is-invalid");
          $error.addClass("d-none");
          $input.data('toast-shown', false); // Reset khi hợp lệ
        }
      }, 300); // Debounce 300ms
    });
    
    // Khi ngày đi thay đổi, validate lại ngày về nếu đã có (với debounce)
    let departureDateValidationTimeout = null;
    $("#checkout-date").off("change").on("change", function() {
      // Clear timeout trước đó
      if (departureDateValidationTimeout) {
        clearTimeout(departureDateValidationTimeout);
      }
      
      departureDateValidationTimeout = setTimeout(() => {
        const departureDate = $(this).val();
        const returnDate = $("#checkout-return-date").val();
        
        if (returnDate && departureDate) {
          // Trigger validation lại cho ngày về (không trigger change event để tránh loop)
          const $returnInput = $("#checkout-return-date");
          const returnDateObj = new Date(returnDate);
          const departureDateObj = new Date(departureDate);
          
          returnDateObj.setHours(0, 0, 0, 0);
          departureDateObj.setHours(0, 0, 0, 0);
          
          let $error = $("#checkout-return-date-error");
          if (!$error.length) {
            $returnInput.after('<div class="invalid-feedback d-none" id="checkout-return-date-error"></div>');
            $error = $("#checkout-return-date-error");
          }
          
          if (returnDateObj.getTime() <= departureDateObj.getTime()) {
            $returnInput.addClass("is-invalid").removeClass("is-valid");
            $error.html('<i class="bi bi-exclamation-circle"></i> Ngày về phải sau ngày đi').removeClass("d-none");
          } else {
            $returnInput.addClass("is-valid").removeClass("is-invalid");
            $error.addClass("d-none");
          }
        }
      }, 300);
    });
  }

  // Real-time discount code calculation
  async function calculateDiscountRealTime(code) {
    const cart = await loadCheckoutData();
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
    $("#btn-remove-discount").off("click").on("click", async function() {
      sessionStorage.removeItem("applied_discount");
      sessionStorage.removeItem("applied_discount_code");
      $("#checkout-discount-code").val("");
      $("#discount-preview").removeClass("active");
      const cart = await loadCheckoutData();
      if (cart) renderOrderSummary(cart);
    });
  }

  // Discount code handler
  $("#btn-apply-discount").on("click", async function() {
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
      await calculateDiscountRealTime(code);
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
  if (typeof debounce !== 'undefined' && debounce) {
    $("#checkout-discount-code").on("input", debounce(async function() {
      const code = $(this).val().trim();
      if (code.length >= 3) {
        await calculateDiscountRealTime(code);
      } else {
        sessionStorage.removeItem("applied_discount");
        sessionStorage.removeItem("applied_discount_code");
        $("#discount-preview").removeClass("active");
        const cart = await loadCheckoutData();
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

  $(document).on("click", "#btn-process-payment", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🛒 Nút thanh toán được click");
    
    const $btn = $("#btn-process-payment");
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...');

    try {
      const cart = await loadCheckoutData();
      if (!cart || !cart.length) {
        console.warn("⚠️ Cart rỗng hoặc không hợp lệ");
        showToast("Giỏ hàng trống. Vui lòng thêm tour vào giỏ hàng.", "warning");
        $btn.prop("disabled", false).html(originalText);
        setTimeout(() => {
          window.location.href = "cart.html";
        }, 2000);
        return;
      }
      
      // Kiểm tra cart có tour data đầy đủ không
      const validCart = cart.filter(item => item.tour && item.tour.price);
      if (validCart.length === 0) {
        console.error("❌ Không có item nào có tour data đầy đủ");
        showToast("Dữ liệu giỏ hàng không hợp lệ. Vui lòng thêm lại tour vào giỏ hàng.", "danger");
        $btn.prop("disabled", false).html(originalText);
        setTimeout(() => {
          window.location.href = "cart.html";
        }, 2000);
        return;
      }
      
      console.log("✅ Cart hợp lệ, có", validCart.length, "items có tour data đầy đủ");

      // Lấy thông tin từ form
      const name = $("#checkout-name").val().trim();
      const email = $("#checkout-email").val().trim();
      const phone = $("#checkout-phone").val().trim();
      const departureDate = $("#checkout-date").val();
      const returnDate = $("#checkout-return-date").val() || departureDate; // Lấy ngày về, nếu không có thì dùng ngày đi
      const note = $("#checkout-note").val().trim();
      const paymentMethod = $("input[name='payment']:checked").val();
      const discountCode = $("#checkout-discount-code")?.val()?.trim() || null;
      
      console.log("📅 Dates:", {
        departureDate: departureDate,
        returnDate: returnDate
      });

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
          returnDate: returnDate // Sử dụng returnDate thực tế từ input
        });
        
        console.log("✅ Input validation:", {
          isValid: inputValidation.isValid,
          errors: inputValidation.errors,
          departureDate: departureDate,
          returnDate: returnDate
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

      // Tính tổng tiền với pricing manager (giống như trong renderOrderSummary)
      let subtotal = 0;
      cart.forEach(item => {
        const tour = item.tour || {};
        if (!tour || !tour.price) {
          console.warn("⚠️ Tour không có dữ liệu:", item);
          return;
        }
        
        const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
          console.warn("⚠️ Giá tour không hợp lệ:", parsedPrice);
          return;
        }
        
        // Calculate pricing with promotions
        let pricing = { 
          originalPrice: parsedPrice, 
          finalPrice: parsedPrice
        };
        
        if (window.PRICING_MANAGER) {
          try {
            pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
          } catch (err) {
            console.warn("Lỗi khi tính pricing:", err);
          }
        }
        
        subtotal += pricing.finalPrice * item.quantity;
      });
      
      console.log("💰 Tính tổng tiền thanh toán:", {
        subtotal: subtotal,
        cartItems: cart.length
      });
      
      const serviceFee = subtotal * 0.05;
      
      // Lấy discount từ sessionStorage hoặc tính từ discountCode
      let discount = 0;
      
      // Ưu tiên lấy từ sessionStorage (đã được áp dụng trong renderOrderSummary)
      const discountData = sessionStorage.getItem("applied_discount");
      if (discountData) {
        try {
          const parsed = JSON.parse(discountData);
          if (parsed.discountAmount) {
            discount = parsed.discountAmount;
          } else {
            discount = parseFloat(discountData) || 0;
          }
        } catch (e) {
          discount = parseFloat(discountData) || 0;
        }
      }
      
      // Nếu không có trong sessionStorage, tính từ discountCode
      if (discount === 0 && discountCode) {
        const discountValidation = window.BOOKING_VALIDATION.validateDiscountCode(discountCode);
        if (discountValidation.valid) {
          const discountInfo = discountValidation.discount;
          if (discountInfo.type === "percent") {
            discount = subtotal * (discountInfo.value / 100);
            if (discountInfo.maxDiscount) {
              discount = Math.min(discount, discountInfo.maxDiscount);
            }
          } else if (discountInfo.type === "fixed") {
            discount = Math.min(discountInfo.value, subtotal);
          }
        }
      }

      const total = subtotal + serviceFee - discount;
      const finalTotal = Math.max(0, total);
      
      console.log("💰 Tổng kết thanh toán:", {
        subtotal: subtotal,
        serviceFee: serviceFee,
        discount: discount,
        total: finalTotal
      });
      
      // Kiểm tra tổng tiền > 0
      if (finalTotal <= 0) {
        console.error("❌ Tổng tiền không hợp lệ:", finalTotal);
        showToast("Tổng tiền thanh toán không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.", "danger");
        $btn.prop("disabled", false).html(originalText);
        // Force re-render summary
        renderOrderSummary(cart);
        return;
      }

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
        returnDate: returnDate, // Sử dụng returnDate thực tế từ input
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

  // Hàm để render summary và đồng bộ với cart
  async function syncAndRenderSummary() {
    console.log("🔄 Đồng bộ và render summary...");
    const cart = await loadCheckoutData();
    
    if (cart && cart.length) {
      console.log("✅ Cart loaded với", cart.length, "items, rendering summary");
      renderOrderSummary(cart);
      return true;
    } else {
      console.warn("⚠️ Không có cart hoặc cart rỗng");
      renderOrderSummary([]);
      return false;
    }
  }

  $(function () {
    console.log("🚀 Checkout page initialized");
    
    // Đảm bảo DOM đã sẵn sàng
    const initCheckout = async () => {
      // Đồng bộ và render summary
      await syncAndRenderSummary();
      
      // Auto-fill user info if logged in
      const user = storage.get("travel_user", null);
      if (user) {
        $("#checkout-name").val(user.name || "");
        $("#checkout-email").val(user.email || "");
      }

      // Set min date for departure
      const today = new Date().toISOString().split('T')[0];
      $("#checkout-date").attr("min", today);
    };
    
    // Gọi ngay lập tức
    initCheckout();
    
    // Gọi lại sau khi DOM sẵn sàng (fallback)
    setTimeout(async () => {
      console.log("🔄 Force re-render summary after 100ms");
      await syncAndRenderSummary();
    }, 100);
    
    // Gọi lại sau 300ms để đảm bảo
    setTimeout(async () => {
      console.log("🔄 Final force re-render summary after 300ms");
      await syncAndRenderSummary();
    }, 300);
    
    // Gọi lại sau 500ms để đảm bảo hoàn toàn
    setTimeout(async () => {
      console.log("🔄 Final check after 500ms");
      await syncAndRenderSummary();
    }, 500);

    // Setup validation
    setupValidation();

    // Payment method selection
    $(".payment-method input").on("change", function () {
      $(".payment-method label").removeClass("border-primary bg-light");
      $(this).closest(".payment-method").find("label").addClass("border-primary bg-light");
    });
    
    // Lắng nghe sự kiện cart được cập nhật (từ cart.html hoặc nơi khác)
    $(document).on('cartUpdated', async function() {
      console.log("📦 Cart updated event received, re-syncing summary");
      setTimeout(async () => {
        await syncAndRenderSummary();
      }, 100);
    });
    
    // Đồng bộ lại khi focus vào trang (nếu user quay lại từ tab khác)
    $(window).on('focus', async function() {
      console.log("🔄 Window focused, re-syncing summary");
      await syncAndRenderSummary();
    });
  });
})();


