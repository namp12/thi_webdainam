/**
 * Cart Page Handler
 */
(function () {
  const { API } = window.APP_CONFIG;
  const { http, formatPrice, showToast } = window.APP_UTILS;
  const APP_CART = window.APP_CART;

  function renderCart() {
    const cart = APP_CART.getCart();
    const $items = $("#cart-items");
    const $empty = $("#cart-empty");
    const $content = $("#cart-content");
    const user = storage.get("travel_user", null);
    if (!user) {
      showToast("Vui lòng đăng nhập để xem giỏ hàng", "warning");
      setTimeout(() => window.location.href = "login.html?redirect=cart.html", 2000);
      return;
    }

    if (!cart.length) {
      $empty.removeClass("d-none");
      $content.addClass("d-none");
      $("#btn-checkout").prop("disabled", true);
      // Vẫn cập nhật summary về 0 khi cart rỗng
      updateSummary();
      return;
    }

    $empty.addClass("d-none");
    $content.removeClass("d-none");

    const html = cart.map((item, index) => {
      const tour = item.tour || {};
      
      // Parse price from API format
      const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price) || 0;
      
      // Calculate pricing with promotions
      let pricing = { 
        originalPrice: parsedPrice, 
        finalPrice: parsedPrice, 
        discount: 0, 
        discountPercent: 0, 
        promotion: null 
      };
      
      if (window.PRICING_MANAGER) {
        pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
      }
      
      const hasPromotion = pricing.promotion !== null;
      const badgeText = hasPromotion ? window.PRICING_MANAGER?.getPromotionBadge(pricing.promotion) : null;
      
      const unitPrice = pricing.finalPrice;
      const total = unitPrice * item.quantity;
      const originalTotal = pricing.originalPrice * item.quantity;

      // Lấy ảnh từ mapping hoặc auto-detect
      const imageSrc = window.IMAGE_MAPPING?.getTourImage(tour) || `assets/img/tours/${tour.id}.jpg`;
      const fallbackImage = window.IMAGE_MAPPING?.getTourFallbackImage(tour) || 'assets/img/banners/placeholder.jpg';

      return `
        <div class="card shadow-sm mb-3 cart-item" data-tour-id="${item.tourId}">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3 position-relative">
                <img src="${imageSrc}" 
                     class="img-fluid rounded" 
                     alt="${tour.title}" 
                     style="height: 120px; object-fit: cover; width: 100%;"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                ${hasPromotion && badgeText ? `
                <span class="badge badge-promotion position-absolute top-0 end-0 m-2" style="font-size: 0.75rem;">
                  <i class="bi bi-tag-fill"></i> ${badgeText}
                </span>
                ` : ''}
              </div>
              <div class="col-md-6">
                <h5 class="mb-2">${tour.title || 'Tour'}</h5>
                <p class="text-muted small mb-2">
                  <i class="bi bi-geo-alt"></i> ${tour.destination || 'Điểm đến'}
                </p>
                <p class="text-muted small mb-2">
                  <i class="bi bi-clock"></i> ${tour.duration || 0} ngày
                </p>
                <div class="d-flex align-items-center gap-3">
                  <div>
                    <label class="small text-muted">Số lượng:</label>
                    <div class="input-group" style="width: 120px;">
                      <button class="btn btn-outline-secondary btn-sm qty-btn-decrease" 
                              type="button" 
                              onclick="event.preventDefault(); event.stopPropagation(); updateCartQty('${item.tourId}', ${item.quantity - 1}); return false;"
                              ${item.quantity <= 1 ? 'disabled' : ''}
                              title="${item.quantity <= 1 ? 'Số lượng tối thiểu là 1. Dùng nút Xóa để xóa tour.' : 'Giảm số lượng'}">-</button>
                      <input type="number" 
                             class="form-control form-control-sm text-center qty-input" 
                             value="${item.quantity}" 
                             min="1" 
                             max="${tour.stock || tour.availability || 999}"
                             data-tour-id="${item.tourId}"
                             onchange="handleQtyInputChange(this)"
                             onkeydown="if(event.key==='Enter') { this.blur(); }">
                      <button class="btn btn-outline-secondary btn-sm qty-btn-increase" 
                              type="button" 
                              onclick="event.preventDefault(); event.stopPropagation(); updateCartQty('${item.tourId}', ${item.quantity + 1}); return false;"
                              ${item.quantity >= (tour.stock || tour.availability || 999) ? 'disabled' : ''}
                              title="${item.quantity >= (tour.stock || tour.availability || 999) ? 'Đã đạt số lượng tối đa' : 'Tăng số lượng'}">+</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 text-end">
                <div class="price-display ${hasPromotion ? 'has-promotion' : ''}">
                  <div class="mb-3">
                    <span class="price-unit text-muted small d-block mb-2">Giá ${item.quantity > 1 ? 'mỗi người' : ''}</span>
                    ${hasPromotion ? `
                      <div class="mb-2">
                        <span class="price-original text-muted text-decoration-line-through small">${formatPrice(pricing.originalPrice)}</span>
                      </div>
                      <div class="price-final text-danger">${formatPrice(unitPrice)}</div>
                      <span class="price-save-badge">Tiết kiệm ${pricing.discountPercent}%</span>
                    ` : `
                      <div class="price-final text-primary">${formatPrice(unitPrice)}</div>
                    `}
                  </div>
                  <div class="price-total-container">
                    <span class="price-unit text-muted small d-block mb-2">Thành tiền</span>
                    ${hasPromotion ? `
                      <div class="mb-2">
                        <span class="price-original text-muted text-decoration-line-through small">${formatPrice(originalTotal)}</span>
                      </div>
                      <div class="price-total text-danger">${formatPrice(total)}</div>
                      <span class="price-save-badge">Tiết kiệm ${formatPrice(originalTotal - total)}</span>
                    ` : `
                      <div class="price-total text-primary">${formatPrice(total)}</div>
                    `}
                  </div>
                </div>
                <button class="btn btn-outline-danger btn-sm mt-3" onclick="removeCartItem('${item.tourId}')">
                  <i class="bi bi-trash"></i> Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    $items.html(html);
    
    // Đảm bảo DOM đã sẵn sàng trước khi cập nhật summary
    // Sử dụng setTimeout để đảm bảo HTML đã được render xong
    setTimeout(() => {
      updateSummary();
      updateQtyButtonsState();
    }, 100);
    
    // Cũng gọi ngay lập tức để cập nhật nhanh nhất có thể
    // (Nếu DOM chưa sẵn sàng, setTimeout sẽ xử lý)
    try {
      updateSummary();
    } catch (err) {
      console.warn("Lỗi khi cập nhật summary ngay lập tức, sẽ thử lại sau:", err);
    }
  }

  /**
   * Cập nhật trạng thái enable/disable của nút +/- dựa trên số lượng và stock
   */
  function updateQtyButtonsState() {
    const cart = APP_CART.getCart();
    
    cart.forEach(item => {
      const tour = item.tour || {};
      const maxStock = tour.stock || tour.availability || 999;
      // Tìm với cả string và number
      const tourId = String(item.tourId);
      const $item = $(`.cart-item[data-tour-id="${tourId}"], .cart-item[data-tour-id="${Number(tourId)}"]`);
      
      if ($item.length) {
        const $decreaseBtn = $item.find('.qty-btn-decrease');
        const $increaseBtn = $item.find('.qty-btn-increase');
        
        // Kiểm tra số lượng hiện tại từ cart (đã được cập nhật)
        const currentQuantity = item.quantity;
        
        // Disable nút - CHỈ KHI số lượng = 1 (không phải <= 1)
        if (currentQuantity <= 1) {
          $decreaseBtn.prop('disabled', true).removeClass('loading').attr('title', 'Số lượng tối thiểu là 1. Dùng nút Xóa để xóa tour.');
        } else {
          $decreaseBtn.prop('disabled', false).removeClass('loading').attr('title', 'Giảm số lượng');
        }
        
        // Disable nút + CHỈ KHI đạt stock tối đa (không phải >=)
        if (currentQuantity >= maxStock) {
          $increaseBtn.prop('disabled', true).removeClass('loading').attr('title', `Đã đạt số lượng tối đa (${maxStock})`);
        } else {
          $increaseBtn.prop('disabled', false).removeClass('loading').attr('title', 'Tăng số lượng');
        }
        
        // Debug log
        console.log(`Tour ${tourId}: quantity=${currentQuantity}, maxStock=${maxStock}, decrease=${!$decreaseBtn.prop('disabled')}, increase=${!$increaseBtn.prop('disabled')}`);
      } else {
        console.warn("Không tìm thấy cart-item để cập nhật trạng thái nút:", tourId);
      }
    });
  }

  function updateSummary() {
    try {
      const cart = APP_CART.getCart();
      
      // Debug: Log để kiểm tra
      console.log("🔄 updateSummary được gọi, cart items:", cart.length);
      
      let subtotal = 0;
      let originalSubtotal = 0;
      let totalDiscount = 0;

      cart.forEach(item => {
        try {
          const tour = item.tour || {};
          
          // Kiểm tra xem tour có dữ liệu không
          if (!tour || !tour.price) {
            console.warn("⚠️ Tour không có dữ liệu hoặc không có price:", item);
            return; // Bỏ qua item này
          }
          
          // Parse price from API format
          const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
          
          // Kiểm tra xem parsedPrice có hợp lệ không
          if (isNaN(parsedPrice) || parsedPrice <= 0) {
            console.warn("⚠️ Giá tour không hợp lệ:", parsedPrice, tour);
            return; // Bỏ qua item này
          }
          
          // Calculate pricing with promotions
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
          
          // Tính toán cho từng tour:
          // - originalPrice: Giá gốc (chưa có promotion)
          // - finalPrice: Giá sau promotion
          const itemOriginalTotal = pricing.originalPrice * item.quantity;
          const itemFinalTotal = pricing.finalPrice * item.quantity;
          const itemDiscount = itemOriginalTotal - itemFinalTotal; // Chiết khấu từ promotion của tour này
          
          originalSubtotal += itemOriginalTotal; // Tổng giá gốc (chưa có promotion)
          subtotal += itemFinalTotal; // Tổng giá sau promotion (đã trừ promotion)
          totalDiscount += itemDiscount; // Tổng chiết khấu từ promotions của tour
          
          // Debug log cho từng item
          console.log(`📦 Item ${tour.title || tourId}:`, {
            quantity: item.quantity,
            originalPrice: pricing.originalPrice,
            finalPrice: pricing.finalPrice,
            itemTotal: itemFinalTotal,
            subtotalSoFar: subtotal
          });
        } catch (err) {
          console.warn("Lỗi khi xử lý item trong cart:", err, item);
          // Bỏ qua item lỗi, tiếp tục với item khác
        }
      });
      
      // Log tổng sau khi tính toán tất cả items
      console.log("📊 Tổng sau khi tính toán tất cả items:", {
        subtotal: subtotal,
        originalSubtotal: originalSubtotal,
        totalDiscount: totalDiscount
      });

      // Công thức tính toán theo yêu cầu:
      // 1. Tổng tiền (Subtotal) = SUM(Giá mỗi người * Số lượng) cho TẤT CẢ tour
      //    (subtotal đã là tổng sau khi áp dụng promotions của tour, tức là giá cuối cùng)
      const finalSubtotal = subtotal; // Đây là tổng tiền sau promotions
      
      // 2. Kiểm tra và validate mã giảm giá khi tổng tiền thay đổi
      //    Mã giảm giá được tính trên finalSubtotal (tổng tiền sau promotions)
      let discountCodeResult = { valid: false, discountAmount: 0 };
      try {
        discountCodeResult = checkAndValidateDiscountCode(finalSubtotal);
      } catch (err) {
        console.warn("Lỗi khi kiểm tra mã giảm giá:", err);
        // Không áp dụng mã giảm giá nếu có lỗi
      }
      
      let appliedDiscountAmount = 0;
      if (discountCodeResult.valid && discountCodeResult.discountAmount) {
        appliedDiscountAmount = discountCodeResult.discountAmount;
      }
      
      // 3. Phí dịch vụ (5%) = 5% của Tổng tiền (tính trên subtotal TRƯỚC khi trừ mã giảm giá)
      const serviceFee = finalSubtotal * 0.05;
      
      // 4. Tổng chiết khấu = Chiết khấu từ promotions của tour + Mã giảm giá
      //    (totalDiscount đã được tính trong subtotal, chỉ cần cộng thêm mã giảm giá)
      const totalDiscountAmount = appliedDiscountAmount; // Chỉ hiển thị mã giảm giá trong summary
      
      // 5. Tổng thanh toán = Tổng tiền + Phí dịch vụ - Chiết khấu (mã giảm giá)
      //    Công thức: Grand Total = Subtotal + Service Fee - Discount Code
      //    (Promotions đã được trừ trong subtotal rồi)
      const grandTotal = finalSubtotal + serviceFee - totalDiscountAmount;
      const finalGrandTotal = Math.max(0, grandTotal);

      // Debug: Log giá trị tính toán
      console.log("💰 Tính toán summary:", {
        cartItems: cart.length,
        finalSubtotal: finalSubtotal,
        serviceFee: serviceFee,
        totalDiscountAmount: totalDiscountAmount,
        grandTotal: finalGrandTotal,
        appliedDiscountCode: discountCodeResult.valid ? discountCodeResult.code : null
      });

      // Update summary display với animation
      try {
        updateSummaryWithAnimation({
          subtotal: finalSubtotal, // Tổng tiền (đã có promotions của tour)
          discountFromPromotions: totalDiscount, // Chiết khấu từ promotions (để hiển thị thông tin)
          discountFromCode: appliedDiscountAmount, // Chiết khấu từ mã giảm giá
          serviceFee: serviceFee, // Phí dịch vụ 5%
          total: finalGrandTotal // Tổng thanh toán cuối cùng (đảm bảo không âm)
        });
      } catch (err) {
        console.warn("Lỗi khi cập nhật animation summary:", err);
        // Fallback: cập nhật trực tiếp không có animation
        const $subtotal = $("#cart-subtotal");
        const $serviceFee = $("#cart-service-fee");
        const $total = $("#cart-total");
        const $checkoutBtn = $("#btn-checkout");
        
        // Tính lại theo công thức đúng (giống như trong try block)
        const finalSubtotalFallback = subtotal; // Subtotal đã có promotions
        const serviceFeeFallback = finalSubtotalFallback * 0.05;
        const totalDiscountAmountFallback = appliedDiscountAmount; // Chỉ mã giảm giá
        const grandTotalFallback = finalSubtotalFallback + serviceFeeFallback - totalDiscountAmountFallback;
        
        // Cập nhật TRỰC TIẾP vào DOM (fallback khi animation fail)
        console.log("⚠️ Sử dụng fallback update (không có animation)");
        if ($subtotal.length) {
          $subtotal.text(formatPrice(finalSubtotalFallback) + " ₫");
          console.log("✅ Fallback: Đã cập nhật subtotal:", formatPrice(finalSubtotalFallback) + " ₫");
        }
        if ($serviceFee.length) {
          $serviceFee.text(formatPrice(serviceFeeFallback) + " ₫");
          console.log("✅ Fallback: Đã cập nhật serviceFee:", formatPrice(serviceFeeFallback) + " ₫");
        }
        if ($total.length) {
          $total.text(formatPrice(Math.max(0, grandTotalFallback)) + " ₫");
          console.log("✅ Fallback: Đã cập nhật total:", formatPrice(Math.max(0, grandTotalFallback)) + " ₫");
        }
        
        // Cập nhật discount row
        const $discountRow = $("#cart-discount-row");
        if (totalDiscountAmountFallback > 0) {
          $discountRow.css("display", "flex !important").show();
          $("#cart-discount-amount").text(`-${formatPrice(totalDiscountAmountFallback)} ₫`);
          console.log("✅ Fallback: Đã cập nhật discount:", `-${formatPrice(totalDiscountAmountFallback)} ₫`);
        } else {
          $discountRow.hide();
        }
        
        // Enable checkout button nếu total > 0
        if ($checkoutBtn.length) {
          const isDisabled = grandTotalFallback <= 0;
          $checkoutBtn.prop("disabled", isDisabled);
          if (grandTotalFallback > 0) {
            $checkoutBtn.removeClass("btn-secondary").addClass("btn-primary");
          } else {
            $checkoutBtn.removeClass("btn-primary").addClass("btn-secondary");
          }
          console.log("✅ Fallback: Checkout button", isDisabled ? "disabled" : "enabled");
        }
      }
    } catch (error) {
      console.error("Lỗi nghiêm trọng trong updateSummary:", error);
      // Không throw, chỉ log để tránh break flow
    }
  }

  /**
   * Cập nhật summary với animation mượt mà - Real-time calculation
   * Công thức: Tổng thanh toán = Tổng tiền + Phí dịch vụ - Chiết khấu
   */
  function updateSummaryWithAnimation({ subtotal, discountFromPromotions, discountFromCode, serviceFee, total }) {
    // Đảm bảo các element tồn tại trước khi cập nhật
    const $subtotalEl = $("#cart-subtotal");
    const $serviceFeeEl = $("#cart-service-fee");
    const $totalEl = $("#cart-total");
    const $discountRow = $("#cart-discount-row");
    const $discountAmount = $("#cart-discount-amount");
    const $checkoutBtn = $("#btn-checkout");
    
    if (!$subtotalEl.length || !$serviceFeeEl.length || !$totalEl.length) {
      console.error("❌ Không tìm thấy các element summary!");
      console.error("Elements:", {
        subtotal: $subtotalEl.length,
        serviceFee: $serviceFeeEl.length,
        total: $totalEl.length
      });
      // Thử lại sau 200ms
      setTimeout(() => {
        updateSummary();
      }, 200);
      return;
    }
    
    // Debug: Log giá trị trước khi cập nhật
    console.log("📊 Cập nhật summary với giá trị:", {
      subtotal: subtotal,
      serviceFee: serviceFee,
      discountFromCode: discountFromCode,
      total: total
    });
    
    // 1. Cập nhật Tổng tiền (Subtotal) - SUM(Giá mỗi người * Số lượng)
    const subtotalFormatted = formatPrice(subtotal) + " ₫";
    // Cập nhật TRỰC TIẾP vào DOM ngay lập tức (không chờ animation)
    $subtotalEl.text(subtotalFormatted);
    animateValueUpdate("#cart-subtotal", subtotalFormatted);
    console.log("✅ Đã cập nhật subtotal:", subtotalFormatted);
    
    // 2. Cập nhật Phí dịch vụ (5% của Tổng tiền)
    const serviceFeeFormatted = formatPrice(serviceFee) + " ₫";
    // Cập nhật TRỰC TIẾP vào DOM ngay lập tức
    $serviceFeeEl.text(serviceFeeFormatted);
    animateValueUpdate("#cart-service-fee", serviceFeeFormatted);
    console.log("✅ Đã cập nhật serviceFee:", serviceFeeFormatted);
    
    // 3. Hiển thị Chiết khấu/Mã giảm giá nếu có
    const totalDiscountDisplay = discountFromCode; // Chỉ hiển thị mã giảm giá trong summary
    
    if (totalDiscountDisplay > 0) {
      $discountRow.css("display", "flex !important").show();
      const discountFormatted = `-${formatPrice(totalDiscountDisplay)} ₫`;
      // Cập nhật TRỰC TIẾP vào DOM ngay lập tức
      $discountAmount.text(discountFormatted);
      animateValueUpdate("#cart-discount-amount", discountFormatted);
      console.log("✅ Đã cập nhật discount:", discountFormatted);
    } else {
      $discountRow.hide();
      console.log("ℹ️ Không có mã giảm giá, ẩn discount row");
    }
    
    // 4. Cập nhật Tổng thanh toán (Grand Total) - Nổi bật với highlight
    const totalFormatted = formatPrice(total) + " ₫";
    // Cập nhật TRỰC TIẾP vào DOM ngay lập tức
    $totalEl.text(totalFormatted);
    animateValueUpdate("#cart-total", totalFormatted, true);
    console.log("✅ Đã cập nhật total:", totalFormatted);
    
    // 5. Enable/disable checkout button dựa trên total
    if ($checkoutBtn.length) {
      const isDisabled = total <= 0;
      $checkoutBtn.prop("disabled", isDisabled);
      if (total > 0) {
        $checkoutBtn.removeClass("btn-secondary").addClass("btn-primary");
        console.log("✅ Checkout button: ENABLED (total =", total, ")");
      } else {
        $checkoutBtn.removeClass("btn-primary").addClass("btn-secondary");
        console.log("⚠️ Checkout button: DISABLED (total = 0)");
      }
    } else {
      console.error("❌ Không tìm thấy checkout button element!");
    }
  }

  /**
   * Animation cho việc cập nhật giá trị số
   */
  function animateValueUpdate(selector, newValue, highlight = false) {
    const $element = $(selector);
    if (!$element.length) {
      console.warn(`⚠️ Không tìm thấy element: ${selector}`);
      return;
    }
    
    // Cập nhật giá trị NGAY LẬP TỨC (không chờ animation)
    $element.text(newValue);
    
    // Thêm animation class để có hiệu ứng
    $element.addClass('value-updating');
    
    // Animation effect
    setTimeout(() => {
      if (highlight) {
        $element.addClass('value-highlight');
        setTimeout(() => $element.removeClass('value-highlight'), 500);
      }
      $element.removeClass('value-updating');
    }, 100);
  }

  /**
   * Kiểm tra và validate mã giảm giá khi tổng tiền thay đổi
   * @param {number} subtotal - Tổng tiền hiện tại
   * @returns {object} - {valid: boolean, discountAmount: number, message: string}
   */
  function checkAndValidateDiscountCode(subtotal) {
    const appliedDiscount = sessionStorage.getItem("applied_discount");
    const appliedDiscountCode = sessionStorage.getItem("applied_discount_code");
    
    if (!appliedDiscount || !appliedDiscountCode) {
      return { valid: false, discountAmount: 0 };
    }

    try {
      const discountData = JSON.parse(appliedDiscount);
      
      // Kiểm tra điều kiện tối thiểu (nếu có)
      if (discountData.minAmount && subtotal < discountData.minAmount) {
        // Hủy áp dụng mã giảm giá
        sessionStorage.removeItem("applied_discount");
        sessionStorage.removeItem("applied_discount_code");
        
        showToast(
          `Mã giảm giá "${appliedDiscountCode}" đã bị hủy vì tổng tiền (${formatPrice(subtotal)}) nhỏ hơn mức tối thiểu (${formatPrice(discountData.minAmount)})`,
          "warning"
        );
        
        return { valid: false, discountAmount: 0, message: "Mã giảm giá đã bị hủy" };
      }

      // Tính toán số tiền giảm giá
      let discountAmount = 0;
      if (discountData.type === 'percent') {
        discountAmount = subtotal * (discountData.value / 100);
        if (discountData.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountData.maxDiscount);
        }
      } else if (discountData.type === 'fixed') {
        discountAmount = Math.min(discountData.value, subtotal); // Không được vượt quá subtotal
      }

      return { 
        valid: true, 
        discountAmount: discountAmount,
        code: appliedDiscountCode
      };
    } catch (error) {
      console.warn("Lỗi khi kiểm tra mã giảm giá:", error);
      return { valid: false, discountAmount: 0 };
    }
  }

  // Debounce để tránh multiple clicks
  let updateQtyDebounce = {};
  
  /**
   * Cập nhật số lượng tour trong giỏ hàng với đầy đủ validation
   * @param {string|number} tourId - ID của tour
   * @param {number} newQuantity - Số lượng mới
   */
  window.updateCartQty = function (tourId, quantity) {
    // Normalize tourId để tránh type mismatch (string vs number)
    tourId = String(tourId);
    quantity = parseInt(quantity) || 1;
    
    // Debounce: Tránh multiple clicks trong 300ms
    const debounceKey = `qty_${tourId}`;
    if (updateQtyDebounce[debounceKey]) {
      console.log("Đang xử lý, bỏ qua click này");
      return;
    }
    
    updateQtyDebounce[debounceKey] = true;
    setTimeout(() => {
      delete updateQtyDebounce[debounceKey];
    }, 300);
    
    const cart = APP_CART.getCart();
    // So sánh với cả string và number để đảm bảo tìm được
    const item = cart.find(item => String(item.tourId) === tourId || Number(item.tourId) === Number(tourId));
    
    if (!item) {
      console.error("Không tìm thấy tour trong giỏ hàng:", { tourId, cart: cart.map(i => ({ id: i.tourId, type: typeof i.tourId })) });
      showToast("Không tìm thấy tour trong giỏ hàng", "danger");
      delete updateQtyDebounce[debounceKey];
      return;
    }

    const tour = item.tour || {};
    const oldQuantity = item.quantity;
    
    // Đảm bảo chỉ tăng/giảm 1 đơn vị mỗi lần
    const expectedQuantity = oldQuantity + (quantity > oldQuantity ? 1 : -1);
    if (Math.abs(quantity - oldQuantity) > 1) {
      console.warn(`Phát hiện nhảy số lượng: ${oldQuantity} → ${quantity}, điều chỉnh về ${expectedQuantity}`);
      quantity = expectedQuantity;
    }
    
    // 1. Kiểm tra giới hạn tối thiểu
    if (quantity < 1) {
      showToast("Số lượng tối thiểu là 1. Nếu muốn xóa, vui lòng dùng nút 'Xóa'", "warning");
      // Giữ nguyên số lượng cũ
      delete updateQtyDebounce[debounceKey];
      renderCart();
      return;
    }

    // 2. Kiểm tra tồn kho (stock/availability)
    const maxStock = tour.stock || tour.availability || 999; // Mặc định 999 nếu không có thông tin
    if (quantity > maxStock) {
      showToast(`Số lượng tối đa cho tour này là ${maxStock} người. Vui lòng chọn số lượng nhỏ hơn.`, "warning");
      // Giữ nguyên số lượng cũ
      delete updateQtyDebounce[debounceKey];
      renderCart();
      return;
    }
    
    // 3. Kiểm tra nếu số lượng không thay đổi
    if (quantity === oldQuantity) {
      console.log("Số lượng không thay đổi, bỏ qua");
      delete updateQtyDebounce[debounceKey];
      return;
    }

    // 4. Cập nhật số lượng - sử dụng tourId từ item để đảm bảo đúng type
    try {
      APP_CART.updateQuantity(item.tourId, quantity);
      console.log(`✅ Đã cập nhật số lượng: ${oldQuantity} → ${quantity}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng trong cart:", error);
      showToast("Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại.", "danger");
      delete updateQtyDebounce[debounceKey];
      renderCart();
      return;
    }
    
    // 5. Cập nhật giao diện tức thời (cho phép fail gracefully)
    try {
      updateCartItemDisplay(item.tourId, quantity);
    } catch (error) {
      console.warn("Lỗi khi cập nhật hiển thị (không nghiêm trọng):", error);
      // Nếu không cập nhật được display, render lại toàn bộ
      delete updateQtyDebounce[debounceKey];
      renderCart();
      return;
    }
    
    // 6. Cập nhật trạng thái nút +/- ngay lập tức
    try {
      updateQtyButtonsState();
    } catch (error) {
      console.warn("Lỗi khi cập nhật trạng thái nút:", error);
    }
    
    // 7. Cập nhật summary (cho phép fail gracefully)
    try {
      updateSummary();
    } catch (error) {
      console.warn("Lỗi khi cập nhật summary (không nghiêm trọng):", error);
      // Vẫn tiếp tục, chỉ log warning
    }
    
    // 8. Cập nhật badge
    try {
      APP_CART.updateCartBadge();
    } catch (error) {
      console.warn("Lỗi khi cập nhật badge (không nghiêm trọng):", error);
    }
    
    // Xóa debounce sau khi hoàn thành
    delete updateQtyDebounce[debounceKey];
  };

  /**
   * Cập nhật hiển thị của một item trong giỏ hàng (real-time)
   * @param {string|number} tourId - ID của tour
   * @param {number} quantity - Số lượng mới
   */
  function updateCartItemDisplay(tourId, quantity) {
    // Normalize tourId
    tourId = String(tourId);
    
    const cart = APP_CART.getCart();
    const item = cart.find(item => String(item.tourId) === tourId || Number(item.tourId) === Number(tourId));
    
    if (!item) {
      console.warn("Không tìm thấy item để cập nhật display:", tourId);
      return;
    }

    const tour = item.tour || {};
    // Tìm với cả string và number
    const $item = $(`.cart-item[data-tour-id="${tourId}"], .cart-item[data-tour-id="${Number(tourId)}"]`);
    
    if (!$item.length) {
      console.warn("Không tìm thấy element để cập nhật:", tourId);
      return;
    }

    // Parse price
    const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price) || 0;
    
    // Calculate pricing with promotions
    let pricing = { 
      originalPrice: parsedPrice, 
      finalPrice: parsedPrice, 
      discount: 0, 
      discountPercent: 0, 
      promotion: null 
    };
    
    if (window.PRICING_MANAGER) {
      pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
    }

    const unitPrice = pricing.finalPrice;
    const total = unitPrice * quantity;
    const originalTotal = pricing.originalPrice * quantity;

    // Cập nhật input số lượng với animation
    const $qtyInput = $item.find('input[type="number"]');
    $qtyInput.val(quantity);
    $qtyInput.addClass('qty-updated');
    setTimeout(() => $qtyInput.removeClass('qty-updated'), 300);

    // Cập nhật thành tiền với animation
    try {
      const $priceTotal = $item.find('.price-total');
      if ($priceTotal.length) {
        $priceTotal.addClass('price-updating');
        setTimeout(() => {
          try {
            if (pricing.promotion) {
              $priceTotal.html(`
                <div class="mb-2">
                  <span class="price-original text-muted text-decoration-line-through small">${formatPrice(originalTotal)}</span>
                </div>
                <div class="price-total text-danger">${formatPrice(total)}</div>
                <span class="price-save-badge">Tiết kiệm ${formatPrice(originalTotal - total)}</span>
              `);
            } else {
              $priceTotal.html(`<div class="price-total text-primary">${formatPrice(total)}</div>`);
            }
            $priceTotal.removeClass('price-updating');
          } catch (err) {
            console.warn("Lỗi khi cập nhật HTML price:", err);
            $priceTotal.removeClass('price-updating');
          }
        }, 100);
      } else {
        // Nếu không tìm thấy element, không làm gì (không throw error)
        console.warn("Không tìm thấy .price-total element cho tour:", tourId);
      }
    } catch (error) {
      console.warn("Lỗi khi cập nhật giá thành tiền:", error);
      // Không throw, chỉ log warning để không break flow
    }
  }


  window.removeCartItem = function (tourId) {
    // Normalize tourId
    tourId = String(tourId);
    
    const cart = APP_CART.getCart();
    const item = cart.find(item => String(item.tourId) === tourId || Number(item.tourId) === Number(tourId));
    
    if (!item) {
      console.error("Không tìm thấy tour để xóa:", { tourId, cart: cart.map(i => ({ id: i.tourId, type: typeof i.tourId })) });
      showToast("Không tìm thấy tour trong giỏ hàng", "danger");
      return;
    }
    
    if (confirm("Bạn có chắc muốn xóa tour này khỏi giỏ hàng?")) {
      // Sử dụng tourId từ item để đảm bảo đúng type
      APP_CART.removeFromCart(item.tourId);
      
      // Real-time update: Cập nhật ngay lập tức không reload trang
      renderCart(); // renderCart sẽ tự động gọi updateSummary
      APP_CART.updateCartBadge();
      
      // Kiểm tra lại mã giảm giá sau khi xóa tour
      setTimeout(() => {
        updateSummary(); // Đảm bảo summary được cập nhật lại
      }, 100);
      
      showToast("Đã xóa tour khỏi giỏ hàng", "success");
    }
  };

  // Bind event cho nút checkout - sử dụng event delegation để đảm bảo hoạt động
  $(document).on("click", "#btn-checkout", function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🛒 Checkout button clicked");
    
    const cart = APP_CART.getCart();
    if (!cart || !cart.length) {
      console.warn("⚠️ Cart is empty");
      showToast("Giỏ hàng trống. Vui lòng thêm tour vào giỏ hàng trước.", "warning");
      return;
    }

    // Kiểm tra xem có tour nào hợp lệ không
    const validCart = cart.filter(item => item.tour && item.quantity > 0);
    if (!validCart.length) {
      console.warn("⚠️ No valid items in cart");
      showToast("Giỏ hàng không hợp lệ. Vui lòng kiểm tra lại.", "warning");
      return;
    }

    // Tính lại tổng tiền để đảm bảo chính xác
    let totalAmount = 0;
    validCart.forEach(item => {
      const tour = item.tour || {};
      const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
      let pricing = { finalPrice: parsedPrice };
      if (window.PRICING_MANAGER) {
        try {
          pricing = window.PRICING_MANAGER.calculateFinalPrice(tour);
        } catch (err) {
          console.warn("Lỗi khi tính pricing:", err);
        }
      }
      totalAmount += pricing.finalPrice * item.quantity;
    });
    
    const serviceFee = totalAmount * 0.05;
    const discountResult = checkAndValidateDiscountCode(totalAmount);
    const discount = discountResult.valid ? discountResult.discountAmount : 0;
    const grandTotal = totalAmount + serviceFee - discount;
    
    console.log("💰 Checkout totals:", {
      subtotal: totalAmount,
      serviceFee: serviceFee,
      discount: discount,
      grandTotal: grandTotal
    });

    // Kiểm tra tổng tiền > 0
    if (grandTotal <= 0) {
      console.error("❌ Grand total is 0 or negative:", grandTotal);
      showToast("Tổng tiền thanh toán không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.", "danger");
      // Force update summary
      updateSummary();
      return;
    }

    // Save cart to session for checkout
    try {
      sessionStorage.setItem("checkout_cart", JSON.stringify(validCart));
      sessionStorage.setItem("checkout_total", grandTotal.toString());
      console.log("✅ Đã lưu cart vào session:", validCart);
      console.log("✅ Tổng tiền thanh toán:", grandTotal);
      window.location.href = "checkout.html";
    } catch (error) {
      console.error("❌ Lỗi khi lưu cart vào session:", error);
      showToast("Có lỗi xảy ra khi chuyển đến trang thanh toán. Vui lòng thử lại.", "danger");
    }
  });

  /**
   * Xử lý khi người dùng nhập số lượng trực tiếp vào input
   * @param {HTMLInputElement} input - Input element
   */
  window.handleQtyInputChange = function(input) {
    const tourId = input.getAttribute('data-tour-id');
    if (!tourId) {
      console.error("Không tìm thấy data-tour-id trong input");
      return;
    }
    
    const newQuantity = parseInt(input.value) || 1;
    const maxStock = parseInt(input.getAttribute('max')) || 999;
    
    // Validate và cập nhật
    if (newQuantity < 1) {
      input.value = 1;
      updateCartQty(tourId, 1);
    } else if (newQuantity > maxStock) {
      input.value = maxStock;
      updateCartQty(tourId, maxStock);
    } else {
      updateCartQty(tourId, newQuantity);
    }
  };

  // Debounce cho input số lượng để tránh spam
  let qtyInputTimeout;
  $(document).on('input', '.qty-input', function() {
    clearTimeout(qtyInputTimeout);
    const $input = $(this);
    qtyInputTimeout = setTimeout(() => {
      const tourId = $input.data('tour-id');
      const newQuantity = parseInt($input.val()) || 1;
      handleQtyInputChange($input[0]);
    }, 500); // Debounce 500ms
  });

  // Disable nút +/- khi đạt giới hạn
  $(document).on('DOMContentLoaded', function() {
    // Logic này sẽ được xử lý trong renderCart
  });

  $(function () {
    console.log("🚀 Cart page initialized");
    renderCart();
    
    // Đảm bảo summary được cập nhật sau khi tất cả scripts đã load
    setTimeout(() => {
      console.log("🔄 Force update summary after page load");
      updateSummary();
    }, 300);
  });
  
  // Cũng lắng nghe event khi cart được cập nhật từ nơi khác
  $(document).on('cartUpdated', function() {
    console.log("📦 Cart updated event received, updating summary");
    setTimeout(() => {
      updateSummary();
    }, 100);
  });
})();






