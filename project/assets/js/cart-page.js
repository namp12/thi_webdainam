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

    if (!cart.length) {
      $empty.removeClass("d-none");
      $content.addClass("d-none");
      $("#btn-checkout").prop("disabled", true);
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

      return `
        <div class="card shadow-sm mb-3 cart-item" data-tour-id="${item.tourId}">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3 position-relative">
                <img src="${tour.image || 'assets/img/banners/placeholder.jpg'}" 
                     class="img-fluid rounded" 
                     alt="${tour.title}" 
                     style="height: 120px; object-fit: cover; width: 100%;">
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
                      <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateCartQty('${item.tourId}', ${item.quantity - 1})">-</button>
                      <input type="number" class="form-control form-control-sm text-center" 
                             value="${item.quantity}" 
                             min="1" 
                             onchange="updateCartQty('${item.tourId}', parseInt(this.value))">
                      <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateCartQty('${item.tourId}', ${item.quantity + 1})">+</button>
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
    updateSummary();
  }

  function updateSummary() {
    const cart = APP_CART.getCart();
    let subtotal = 0;
    let originalSubtotal = 0;
    let totalDiscount = 0;

    cart.forEach(item => {
      const tour = item.tour || {};
      
      // Parse price from API format
      const parsedPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price || 0);
      
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
      
      const itemOriginalTotal = pricing.originalPrice * item.quantity;
      const itemFinalTotal = pricing.finalPrice * item.quantity;
      
      originalSubtotal += itemOriginalTotal;
      subtotal += itemFinalTotal;
      totalDiscount += (itemOriginalTotal - itemFinalTotal);
    });

    // Service fee (5%)
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;

    // Update summary display with proper order: Subtotal -> Discount -> Service Fee -> Total
    $("#cart-subtotal").text(formatPrice(subtotal));
    
    // Show discount row between Subtotal and Service Fee (if discount exists)
    const $discountRow = $("#cart-discount-row");
    if (totalDiscount > 0) {
      $discountRow.show();
      $("#cart-discount-amount").text(`-${formatPrice(totalDiscount)}`);
    } else {
      $discountRow.hide();
    }
    
    // Show service fee
    $("#cart-service-fee").text(formatPrice(serviceFee));
    
    // Total
    $("#cart-total").text(formatPrice(total));
    $("#btn-checkout").prop("disabled", total === 0);
  }

  window.updateCartQty = function (tourId, quantity) {
    APP_CART.updateQuantity(tourId, quantity);
    renderCart();
    APP_CART.updateCartBadge();
  };

  window.removeCartItem = function (tourId) {
    if (confirm("Bạn có chắc muốn xóa tour này khỏi giỏ hàng?")) {
      APP_CART.removeFromCart(tourId);
      renderCart();
      APP_CART.updateCartBadge();
    }
  };

  $("#btn-checkout").on("click", function () {
    const cart = APP_CART.getCart();
    if (!cart.length) {
      showToast("Giỏ hàng trống", "warning");
      return;
    }

    // Save cart to session for checkout
    sessionStorage.setItem("checkout_cart", JSON.stringify(cart));
    window.location.href = "checkout.html";
  });

  $(function () {
    renderCart();
  });
})();






