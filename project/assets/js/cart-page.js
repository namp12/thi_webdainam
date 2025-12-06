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
      const price = Number(tour.price || 0);
      const total = price * item.quantity;

      return `
        <div class="card shadow-sm mb-3 cart-item" data-tour-id="${item.tourId}">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <img src="${tour.image || 'assets/img/banners/placeholder.jpg'}" 
                     class="img-fluid rounded" 
                     alt="${tour.title}" 
                     style="height: 120px; object-fit: cover; width: 100%;">
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
                <div class="mb-2">
                  <span class="text-muted small">Giá:</span>
                  <div class="fw-bold text-primary">${formatPrice(price)}</div>
                </div>
                <div class="mb-3">
                  <span class="text-muted small">Thành tiền:</span>
                  <div class="fw-bold fs-5">${formatPrice(total)}</div>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem('${item.tourId}')">
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
    const total = APP_CART.getCartTotal();
    $("#cart-subtotal").text(formatPrice(total));
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


