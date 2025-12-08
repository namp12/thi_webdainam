/**
 * Xử lý Modal Chi tiết Deal
 * Hiển thị thông tin chi tiết về các ưu đãi khuyến mãi
 */
(function () {
  // Dữ liệu deal
  const deals = {
    'combo-bien-dao': {
      title: 'Combo biển đảo',
      subtitle: 'Vé máy bay + Resort 3N2Đ',
      badge: '-20%',
      badgeType: 'discount',
      originalPrice: 8500000,
      discountPrice: 6800000,
      discountPercent: 20,
      saveAmount: 1700000,
      description: `
        <p class="mb-3">Combo trọn gói bao gồm vé máy bay khứ hồi và nghỉ dưỡng tại resort 4 sao trong 3 ngày 2 đêm. Trải nghiệm trọn vẹn với dịch vụ cao cấp và giá cả hợp lý.</p>
        <div class="deal-includes">
          <h6 class="fw-semibold mb-2">Bao gồm:</h6>
          <ul class="list-unstyled ms-3">
            <li><i class="bi bi-check-circle text-success"></i> Vé máy bay khứ hồi (Vietnam Airlines/Vietjet)</li>
            <li><i class="bi bi-check-circle text-success"></i> Nghỉ dưỡng 3N2Đ tại resort 4 sao</li>
            <li><i class="bi bi-check-circle text-success"></i> Bữa sáng buffet hàng ngày</li>
            <li><i class="bi bi-check-circle text-success"></i> Đưa đón sân bay miễn phí</li>
            <li><i class="bi bi-check-circle text-success"></i> Bảo hiểm du lịch</li>
          </ul>
        </div>
      `,
      conditions: [
        'Áp dụng cho đặt tour từ 2 người trở lên',
        'Không áp dụng vào các ngày lễ, Tết',
        'Có thể hủy miễn phí trước 7 ngày',
        'Không hoàn tiền nếu hủy trong vòng 3 ngày',
        'Áp dụng cho khách hàng mới và cũ'
      ],
      validPeriod: '01/01/2024 - 31/12/2024',
      quantity: 'Còn 15 suất',
      quantityType: 'limited'
    },
    'flash-sale-nui': {
      title: 'Tour miền núi',
      subtitle: 'Khởi hành cuối tuần, số lượng có hạn',
      badge: 'Flash sale',
      badgeType: 'flash',
      originalPrice: 5500000,
      discountPrice: 3850000,
      discountPercent: 30,
      saveAmount: 1650000,
      description: `
        <p class="mb-3">Tour khám phá miền núi với lịch trình khởi hành vào cuối tuần. Trải nghiệm văn hóa địa phương, trekking và thưởng thức ẩm thực đặc sản.</p>
        <div class="deal-includes">
          <h6 class="fw-semibold mb-2">Bao gồm:</h6>
          <ul class="list-unstyled ms-3">
            <li><i class="bi bi-check-circle text-success"></i> Xe đưa đón và di chuyển trong tour</li>
            <li><i class="bi bi-check-circle text-success"></i> Nghỉ tại homestay/khách sạn 2-3 sao</li>
            <li><i class="bi bi-check-circle text-success"></i> Hướng dẫn viên địa phương</li>
            <li><i class="bi bi-check-circle text-success"></i> Bữa ăn theo chương trình</li>
            <li><i class="bi bi-check-circle text-success"></i> Vé tham quan các điểm du lịch</li>
          </ul>
        </div>
      `,
      conditions: [
        'Chỉ áp dụng cho tour khởi hành thứ 7, Chủ nhật',
        'Áp dụng cho nhóm từ 4 người trở lên',
        'Không áp dụng vào các ngày lễ',
        'Không thể hủy hoặc đổi ngày',
        'Thanh toán 100% khi đặt tour'
      ],
      validPeriod: 'Hàng tuần (Thứ 7 - Chủ nhật)',
      quantity: 'Còn 8 suất tuần này',
      quantityType: 'urgent'
    },
    'voucher-gia-dinh': {
      title: 'Ưu đãi gia đình',
      subtitle: 'Tặng kèm bữa tối & spa',
      badge: 'Voucher',
      badgeType: 'voucher',
      originalPrice: 12000000,
      discountPrice: 10800000,
      discountPercent: 10,
      saveAmount: 1200000,
      description: `
        <p class="mb-3">Gói ưu đãi đặc biệt dành cho gia đình với nhiều tiện ích đi kèm. Trải nghiệm nghỉ dưỡng cao cấp với các dịch vụ spa và ẩm thực đẳng cấp.</p>
        <div class="deal-includes">
          <h6 class="fw-semibold mb-2">Bao gồm:</h6>
          <ul class="list-unstyled ms-3">
            <li><i class="bi bi-check-circle text-success"></i> Nghỉ dưỡng tại resort 5 sao</li>
            <li><i class="bi bi-check-circle text-success"></i> Bữa tối buffet cao cấp cho cả gia đình</li>
            <li><i class="bi bi-check-circle text-success"></i> Voucher spa trị giá 500.000đ/người</li>
            <li><i class="bi bi-check-circle text-success"></i> Phòng gia đình với giường phụ</li>
            <li><i class="bi bi-check-circle text-success"></i> Hoạt động giải trí cho trẻ em</li>
          </ul>
        </div>
      `,
      conditions: [
        'Áp dụng cho gia đình từ 3 người trở lên (có trẻ em)',
        'Áp dụng cho đặt phòng tối thiểu 2 đêm',
        'Có thể sử dụng kèm các ưu đãi khác',
        'Có thể hủy miễn phí trước 14 ngày',
        'Voucher spa có thời hạn 6 tháng'
      ],
      validPeriod: '01/01/2024 - 30/06/2024',
      quantity: 'Không giới hạn',
      quantityType: 'unlimited'
    }
  };

  // Format price
  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Show deal modal
  function showDealModal(dealId) {
    const deal = deals[dealId];
    if (!deal) return;

    const modal = new bootstrap.Modal(document.getElementById('dealDetailModal'));
    
    // Set badge
    const badgeEl = document.getElementById('deal-badge');
    badgeEl.textContent = deal.badge;
    badgeEl.className = `deal-badge-large mb-3 ${deal.badgeType}`;

    // Set title and subtitle
    document.getElementById('deal-title').textContent = deal.title;
    document.getElementById('deal-subtitle').textContent = deal.subtitle;

    // Set prices
    document.getElementById('deal-price-original').textContent = formatPrice(deal.originalPrice);
    document.getElementById('deal-price-discount').textContent = formatPrice(deal.discountPrice);
    document.getElementById('deal-save-amount').textContent = `Tiết kiệm ${formatPrice(deal.saveAmount)}`;
    document.getElementById('deal-discount-percent').innerHTML = `
      <div class="discount-circle">
        <span class="discount-number">${deal.discountPercent}%</span>
        <span class="discount-label">GIẢM</span>
      </div>
    `;

    // Set description
    document.getElementById('deal-description').innerHTML = deal.description;

    // Set conditions
    const conditionsEl = document.getElementById('deal-conditions');
    conditionsEl.innerHTML = deal.conditions.map(condition => 
      `<li class="mb-2"><i class="bi bi-dot text-primary"></i> ${condition}</li>`
    ).join('');

    // Set timeline
    document.getElementById('deal-valid-period').textContent = deal.validPeriod;
    const quantityEl = document.getElementById('deal-quantity');
    quantityEl.textContent = deal.quantity;
    if (deal.quantityType === 'urgent') {
      quantityEl.className = 'text-danger fw-bold';
    } else if (deal.quantityType === 'limited') {
      quantityEl.className = 'text-warning fw-bold';
    } else {
      quantityEl.className = 'text-success fw-bold';
    }

    // Set apply button
    const applyBtn = document.getElementById('deal-btn-apply');
    applyBtn.onclick = () => {
      window.location.href = `tours.html?deal=${dealId}`;
    };

    modal.show();
  }

  // Initialize
  $(function () {
    $(document).on('click', '.btn-view-deal', function (e) {
      e.preventDefault();
      const dealId = $(this).data('deal');
      showDealModal(dealId);
    });
  });
})();





