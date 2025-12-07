/**
 * Promotions Page Handler
 * Quản lý và hiển thị tất cả khuyến mãi, mã giảm giá
 */
(function () {
  const { formatPrice, showToast, storage } = window.APP_UTILS;

  // Sample promotions data
  const promotions = [
    {
      id: 'combo-bien-dao',
      type: 'combo',
      title: 'Combo biển đảo',
      subtitle: 'Vé máy bay + Resort 3N2Đ',
      description: 'Combo trọn gói bao gồm vé máy bay khứ hồi và nghỉ dưỡng tại resort 4 sao trong 3 ngày 2 đêm.',
      originalPrice: 8500000,
      discountPrice: 6800000,
      discountPercent: 20,
      saveAmount: 1700000,
      badge: '-20%',
      badgeType: 'discount',
      conditions: [
        'Áp dụng cho đặt tour từ 2 người trở lên',
        'Không áp dụng vào các ngày lễ, Tết',
        'Có thể hủy miễn phí trước 7 ngày'
      ],
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      quantity: 15,
      quantityType: 'limited',
      image: 'assets/img/banners/placeholder.jpg',
      includes: [
        'Vé máy bay khứ hồi',
        'Nghỉ dưỡng 3N2Đ tại resort 4 sao',
        'Bữa sáng buffet hàng ngày',
        'Đưa đón sân bay miễn phí',
        'Bảo hiểm du lịch'
      ]
    },
    {
      id: 'flash-sale-nui',
      type: 'flash-sale',
      title: 'Flash Sale Tour miền núi',
      subtitle: 'Khởi hành cuối tuần, số lượng có hạn',
      description: 'Tour khám phá miền núi phía Bắc với giá cực kỳ ưu đãi. Chỉ áp dụng cho các tour khởi hành cuối tuần.',
      originalPrice: 3500000,
      discountPrice: 2450000,
      discountPercent: 30,
      saveAmount: 1050000,
      badge: 'Flash Sale',
      badgeType: 'flash',
      conditions: [
        'Chỉ áp dụng cho tour khởi hành thứ 6, 7, CN',
        'Số lượng có hạn, đặt ngay',
        'Không áp dụng mã giảm giá khác'
      ],
      validFrom: '2024-01-01',
      validTo: '2024-03-31',
      quantity: 8,
      quantityType: 'limited',
      image: 'assets/img/banners/placeholder.jpg',
      timeLeft: '2 ngày 15 giờ'
    },
    {
      id: 'voucher-gia-dinh',
      type: 'voucher',
      title: 'Ưu đãi gia đình',
      subtitle: 'Tặng kèm bữa tối & spa',
      description: 'Voucher đặc biệt dành cho gia đình. Tặng kèm bữa tối buffet và voucher spa trị giá 500.000đ.',
      originalPrice: 0,
      discountPrice: 0,
      discountPercent: 0,
      saveAmount: 500000,
      badge: 'Voucher',
      badgeType: 'voucher',
      conditions: [
        'Áp dụng cho đặt tour từ 3 người trở lên',
        'Tặng bữa tối buffet cho cả gia đình',
        'Tặng voucher spa 500.000đ/người',
        'Có thể kết hợp với mã giảm giá khác'
      ],
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      quantity: 50,
      quantityType: 'limited',
      image: 'assets/img/banners/placeholder.jpg',
      gifts: [
        'Bữa tối buffet',
        'Voucher spa 500.000đ/người',
        'Quà tặng lưu niệm'
      ]
    },
    {
      id: 'discount-summer2024',
      type: 'discount-code',
      code: 'SUMMER2024',
      title: 'Mã giảm giá mùa hè',
      subtitle: 'Giảm 15% cho tất cả tour',
      description: 'Mã giảm giá đặc biệt cho mùa hè 2024. Áp dụng cho tất cả các tour trong tháng 6, 7, 8.',
      discountType: 'percent',
      discountValue: 15,
      minOrder: 2000000,
      maxDiscount: 1000000,
      badge: '-15%',
      badgeType: 'discount',
      conditions: [
        'Áp dụng cho đơn hàng từ 2.000.000đ',
        'Giảm tối đa 1.000.000đ',
        'Chỉ áp dụng cho tour trong tháng 6-8',
        'Không áp dụng với các khuyến mãi khác'
      ],
      validFrom: '2024-06-01',
      validTo: '2024-08-31',
      maxUses: 1000,
      usedCount: 342,
      quantityType: 'unlimited'
    },
    {
      id: 'discount-firsttime',
      type: 'discount-code',
      code: 'WELCOME50',
      title: 'Chào mừng khách hàng mới',
      subtitle: 'Giảm 50.000đ cho đơn hàng đầu tiên',
      description: 'Mã giảm giá đặc biệt dành cho khách hàng mới. Áp dụng cho đơn hàng đầu tiên của bạn.',
      discountType: 'fixed',
      discountValue: 50000,
      minOrder: 1000000,
      maxDiscount: 50000,
      badge: '-50K',
      badgeType: 'discount',
      conditions: [
        'Chỉ áp dụng cho khách hàng mới',
        'Áp dụng cho đơn hàng từ 1.000.000đ',
        'Mỗi tài khoản chỉ sử dụng 1 lần',
        'Không áp dụng với các khuyến mãi khác'
      ],
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      maxUses: 5000,
      usedCount: 1234,
      quantityType: 'unlimited',
      userType: 'new'
    },
    {
      id: 'combo-ha-long',
      type: 'combo',
      title: 'Combo Hạ Long 2N1Đ',
      subtitle: 'Tour + Khách sạn 4 sao',
      description: 'Combo tour Hạ Long 2 ngày 1 đêm bao gồm tour tham quan và nghỉ đêm tại khách sạn 4 sao.',
      originalPrice: 2500000,
      discountPrice: 2000000,
      discountPercent: 20,
      saveAmount: 500000,
      badge: '-20%',
      badgeType: 'discount',
      conditions: [
        'Áp dụng cho đặt tour từ 2 người',
        'Bao gồm 1 đêm nghỉ tại khách sạn 4 sao',
        'Có thể hủy miễn phí trước 5 ngày'
      ],
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      quantity: 30,
      quantityType: 'limited',
      image: 'assets/img/banners/placeholder.jpg'
    }
  ];

  // Load discount codes from localStorage
  function loadDiscountCodes() {
    try {
      const codes = storage.get("travel_discounts", []);
      return codes;
    } catch {
      return [];
    }
  }

  // Initialize discount codes if empty
  function initDiscountCodes() {
    const codes = loadDiscountCodes();
    if (codes.length === 0) {
      const defaultCodes = promotions
        .filter(p => p.type === 'discount-code')
        .map(p => ({
          code: p.code,
          title: p.title,
          description: p.description,
          type: p.discountType,
          value: p.discountValue,
          minOrder: p.minOrder,
          maxDiscount: p.maxDiscount,
          expiresAt: p.validTo,
          maxUses: p.maxUses,
          usedCount: p.usedCount || 0,
          active: true,
          conditions: p.conditions,
          userType: p.userType
        }));
      storage.set("travel_discounts", defaultCodes);
    }
  }

  // Render promotion card
  function renderPromoCard(promo) {
    const isExpired = new Date(promo.validTo) < new Date();
    const isLimited = promo.quantityType === 'limited' && promo.quantity <= 0;
    
    if (isExpired || isLimited) return '';

    const badgeClass = promo.badgeType === 'flash' ? 'flash' : '';
    const headerClass = promo.type === 'flash-sale' ? 'flash-sale' : 
                       promo.type === 'combo' ? 'combo' :
                       promo.type === 'voucher' ? 'voucher' : 'discount';

    return `
      <div class="col-md-6 col-lg-4">
        <div class="promo-card" data-promo-id="${promo.id}">
          <div class="promo-card-header ${headerClass}">
            <div class="promo-badge ${badgeClass}">${promo.badge}</div>
            <div>
              <div class="promo-title">${promo.title}</div>
              <div class="promo-subtitle">${promo.subtitle}</div>
            </div>
          </div>
          <div class="promo-card-body">
            <p class="promo-description">${promo.description}</p>
            ${promo.originalPrice > 0 ? `
              <div class="promo-price-section">
                <div class="promo-price-original">Giá gốc: ${formatPrice(promo.originalPrice)}</div>
                <div class="promo-price-discount">${formatPrice(promo.discountPrice)}</div>
                <div class="promo-discount-amount">Tiết kiệm ${formatPrice(promo.saveAmount)}</div>
              </div>
            ` : ''}
            <ul class="promo-conditions">
              ${promo.conditions.slice(0, 3).map(c => `
                <li><i class="bi bi-check-circle"></i> ${c}</li>
              `).join('')}
            </ul>
            <div class="promo-meta">
              <div class="promo-expiry">
                <i class="bi bi-calendar-event"></i>
                <span>Đến ${new Date(promo.validTo).toLocaleDateString('vi-VN')}</span>
              </div>
              ${promo.quantityType === 'limited' ? `
                <div class="promo-quantity">
                  <i class="bi bi-box-seam"></i>
                  <span>Còn ${promo.quantity} suất</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="promo-card-footer">
            <button class="btn promo-btn promo-btn-primary" onclick="viewPromoDetail('${promo.id}')">
              <i class="bi bi-eye me-2"></i>Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render discount code card
  function renderDiscountCodeCard(promo) {
    const isExpired = new Date(promo.validTo) < new Date();
    const isUsedUp = promo.maxUses && promo.usedCount >= promo.maxUses;
    
    if (isExpired || isUsedUp) return '';

    const discountText = promo.discountType === 'percent' 
      ? `-${promo.discountValue}%` 
      : formatPrice(promo.discountValue);

    return `
      <div class="col-md-6 col-lg-4">
        <div class="discount-code-card">
          <div class="discount-code-header">
            <div>
              <div class="discount-code-title">${promo.title}</div>
              <div class="discount-code-subtitle">${promo.subtitle}</div>
            </div>
            <div class="discount-code-badge">${promo.badge}</div>
          </div>
          <div class="discount-code-value">${discountText}</div>
          <div class="discount-code-input-group">
            <input type="text" class="discount-code-input" value="${promo.code}" readonly id="code-${promo.id}">
            <button class="discount-code-btn" onclick="copyDiscountCode('${promo.code}', '${promo.id}')">
              <i class="bi bi-clipboard me-1"></i>Copy
            </button>
          </div>
          <div class="discount-code-conditions">
            <div><i class="bi bi-info-circle me-2"></i>${promo.conditions[0]}</div>
            ${promo.maxUses ? `
              <div class="mt-2">
                <i class="bi bi-people me-2"></i>Đã dùng: ${promo.usedCount}/${promo.maxUses}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Filter promotions by type
  function filterPromotions(type) {
    if (type === 'all') {
      return promotions.filter(p => p.type !== 'discount-code');
    }
    return promotions.filter(p => p.type === type);
  }

  // Render promotions list
  function renderPromotions(type = 'all') {
    const filtered = filterPromotions(type);
    const containerId = `promo-list-${type === 'all' ? 'all' : type}`;
    const $container = $(`#${containerId}`);
    
    if (filtered.length === 0) {
      $container.html('<div class="col-12 text-center py-5"><p class="text-muted">Chưa có khuyến mãi nào</p></div>');
      return;
    }

    const html = filtered.map(promo => renderPromoCard(promo)).join('');
    $container.html(html);
  }

  // Render discount codes
  function renderDiscountCodes() {
    const codes = promotions.filter(p => p.type === 'discount-code');
    const $container = $('#promo-list-discount-code');
    
    if (codes.length === 0) {
      $container.html('<div class="col-12 text-center py-5"><p class="text-muted">Chưa có mã giảm giá nào</p></div>');
      return;
    }

    const html = codes.map(promo => renderDiscountCodeCard(promo)).join('');
    $container.html(html);
  }

  // View promotion detail
  window.viewPromoDetail = function(promoId) {
    const promo = promotions.find(p => p.id === promoId);
    if (!promo) return;

    const headerClass = promo.type === 'flash-sale' ? 'flash-sale' : 
                       promo.type === 'combo' ? 'combo' :
                       promo.type === 'voucher' ? 'voucher' : 'discount';

    const modalBody = `
      <div class="promo-modal-header ${headerClass}">
        <div class="promo-badge mb-3">${promo.badge}</div>
        <h2 class="modal-title fw-bold mb-2">${promo.title}</h2>
        <p class="mb-0">${promo.subtitle}</p>
      </div>
      <div class="promo-modal-body">
        <div class="mb-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-info-circle me-2"></i>Mô tả</h5>
          <p>${promo.description}</p>
        </div>
        ${promo.originalPrice > 0 ? `
          <div class="mb-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-currency-exchange me-2"></i>Giá</h5>
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="mb-2">
                  <span class="text-muted">Giá gốc: </span>
                  <span class="text-decoration-line-through">${formatPrice(promo.originalPrice)}</span>
                </div>
                <div class="mb-2">
                  <span class="text-muted">Giá sau giảm: </span>
                  <span class="fs-4 fw-bold text-success">${formatPrice(promo.discountPrice)}</span>
                </div>
                <div>
                  <span class="badge bg-success fs-6">Tiết kiệm ${formatPrice(promo.saveAmount)}</span>
                </div>
              </div>
              <div class="col-md-6 text-center">
                <div class="display-4 fw-bold text-primary">-${promo.discountPercent}%</div>
              </div>
            </div>
          </div>
        ` : ''}
        ${promo.includes ? `
          <div class="mb-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-check-circle me-2"></i>Bao gồm</h5>
            <ul class="list-unstyled">
              ${promo.includes.map(item => `
                <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${item}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        ${promo.gifts ? `
          <div class="mb-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-gift me-2"></i>Quà tặng</h5>
            <ul class="list-unstyled">
              ${promo.gifts.map(item => `
                <li class="mb-2"><i class="bi bi-gift-fill text-warning me-2"></i>${item}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="mb-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-list-check me-2"></i>Điều kiện áp dụng</h5>
          <ul class="list-unstyled">
            ${promo.conditions.map(condition => `
              <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>${condition}</li>
            `).join('')}
          </ul>
        </div>
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-calendar-event text-primary"></i>
              <strong>Thời gian áp dụng:</strong>
            </div>
            <div class="ms-4">
              ${new Date(promo.validFrom).toLocaleDateString('vi-VN')} - ${new Date(promo.validTo).toLocaleDateString('vi-VN')}
            </div>
          </div>
          ${promo.quantityType === 'limited' ? `
            <div class="col-md-6">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-box-seam text-warning"></i>
                <strong>Số lượng còn lại:</strong>
              </div>
              <div class="ms-4">
                <span class="badge bg-warning fs-6">Còn ${promo.quantity} suất</span>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-lg flex-grow-1" onclick="applyPromo('${promo.id}')">
            <i class="bi bi-cart-plus me-2"></i>Áp dụng ngay
          </button>
          <a href="tours.html" class="btn btn-outline-primary btn-lg">
            <i class="bi bi-arrow-right me-2"></i>Xem tours
          </a>
        </div>
      </div>
    `;

    $('#promo-modal-body').html(modalBody);
    new bootstrap.Modal(document.getElementById('promoDetailModal')).show();
  };

  // Copy discount code
  window.copyDiscountCode = function(code, id) {
    const input = document.getElementById(`code-${id}`);
    input.select();
    document.execCommand('copy');
    showToast(`Đã copy mã: ${code}`, 'success');
  };

  // Apply promotion
  window.applyPromo = function(promoId) {
    const promo = promotions.find(p => p.id === promoId);
    if (!promo) return;

    if (promo.type === 'discount-code') {
      // Copy code to clipboard
      copyDiscountCode(promo.code, promoId);
      showToast(`Mã ${promo.code} đã được copy. Vui lòng nhập vào ô mã giảm giá khi thanh toán.`, 'info');
    } else {
      // Redirect to tours
      showToast('Đang chuyển đến trang tours...', 'info');
      setTimeout(() => {
        window.location.href = 'tours.html';
      }, 1000);
    }
  };

  // Search promotions - Enhanced to search code, title, subtitle, description, and tour names
  function searchPromotions(query) {
    if (!query) return promotions;
    
    const searchTerm = query.toLowerCase().trim();
    
    return promotions.filter(promo => {
      // Search in code
      if (promo.code && promo.code.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in title
      if (promo.title && promo.title.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in subtitle
      if (promo.subtitle && promo.subtitle.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in description
      if (promo.description && promo.description.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in conditions
      if (promo.conditions && Array.isArray(promo.conditions)) {
        if (promo.conditions.some(cond => cond.toLowerCase().includes(searchTerm))) {
          return true;
        }
      }
      
      // Search in includes/gifts
      if (promo.includes && Array.isArray(promo.includes)) {
        if (promo.includes.some(item => item.toLowerCase().includes(searchTerm))) {
          return true;
        }
      }
      
      if (promo.gifts && Array.isArray(promo.gifts)) {
        if (promo.gifts.some(item => item.toLowerCase().includes(searchTerm))) {
          return true;
        }
      }
      
      return false;
    });
  }

  // Initialize
  $(function () {
    initDiscountCodes();
    
    // Render all promotions
    renderPromotions('all');
    renderPromotions('flash-sale');
    renderPromotions('combo');
    renderPromotions('voucher');
    renderDiscountCodes();

    // Tab change handler
    $('#promo-tabs button').on('shown.bs.tab', function (e) {
      const target = $(e.target).data('bs-target');
      if (target === '#pane-discount-code') {
        renderDiscountCodes();
      }
    });

    // Search handler - Enhanced to search all types including discount codes
    $('#btn-search-promo').on('click', function() {
      const query = $('#promo-search-input').val().trim();
      if (!query) {
        renderPromotions('all');
        renderDiscountCodes();
        $('#promo-empty').addClass('d-none');
        return;
      }

      const results = searchPromotions(query);
      if (results.length === 0) {
        $('#promo-list-all').html('');
        $('#promo-list-discount-code').html('');
        $('#promo-empty').removeClass('d-none');
      } else {
        $('#promo-empty').addClass('d-none');
        
        // Render promotions (non-discount-code)
        const promoResults = results.filter(p => p.type !== 'discount-code');
        if (promoResults.length > 0) {
          const html = promoResults.map(promo => renderPromoCard(promo)).join('');
          $('#promo-list-all').html(html);
        } else {
          $('#promo-list-all').html('');
        }
        
        // Render discount codes
        const codeResults = results.filter(p => p.type === 'discount-code');
        if (codeResults.length > 0) {
          const codesHtml = codeResults.map(code => renderDiscountCodeCard(code)).join('');
          $('#promo-list-discount-code').html(codesHtml);
        } else {
          $('#promo-list-discount-code').html('');
        }
      }
    });

    // Enter key search
    $('#promo-search-input').on('keypress', function(e) {
      if (e.which === 13) {
        $('#btn-search-promo').click();
      }
    });
  });
})();

