/**
 * Partners Page Script
 * Optimized loading and display of partner information
 */
(function () {
  // Partners data embedded for faster loading
  const partners = [
    {
      id: 1, name: "Vietnam Airlines", category: "airline",
      logo: "https://logos-world.net/wp-content/uploads/2021/02/Vietnam-Airlines-Logo.png",
      description: "Hãng hàng không quốc gia Việt Nam, cung cấp dịch vụ bay nội địa và quốc tế với đội tàu bay hiện đại.",
      since: "2015", badges: ["Quốc gia", "5 sao"],
      features: ["Đội tàu bay hiện đại", "Mạng lưới bay rộng", "Dịch vụ 5 sao"],
      website: "https://www.vietnamairlines.com"
    },
    {
      id: 2, name: "Vietjet Air", category: "airline",
      logo: "https://logos-world.net/wp-content/uploads/2021/02/VietJet-Air-Logo.png",
      description: "Hãng hàng không giá rẻ hàng đầu Việt Nam, mang đến cơ hội bay cho mọi người với giá cả phải chăng.",
      since: "2016", badges: ["Giá rẻ", "Tiện lợi"],
      features: ["Giá vé cạnh tranh", "Mạng lưới bay rộng", "Dịch vụ online"],
      website: "https://www.vietjetair.com"
    },
    {
      id: 3, name: "Bamboo Airways", category: "airline",
      logo: "https://logos-world.net/wp-content/uploads/2021/02/Bamboo-Airways-Logo.png",
      description: "Hãng hàng không tư nhân với dịch vụ cao cấp, kết hợp giữa giá cả hợp lý và chất lượng dịch vụ tốt.",
      since: "2019", badges: ["Cao cấp", "Mới"],
      features: ["Dịch vụ cao cấp", "Đội tàu bay mới", "Nhiều đường bay"],
      website: "https://www.bambooairways.com"
    },
    {
      id: 4, name: "Marriott International", category: "hotel",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Marriott-Logo.png",
      description: "Tập đoàn khách sạn quốc tế hàng đầu với hơn 7,000 khách sạn trên toàn thế giới.",
      since: "2018", badges: ["Quốc tế", "5 sao"],
      features: ["Hơn 30 thương hiệu", "Tiêu chuẩn 5 sao", "Chương trình thân thiết"],
      website: "https://www.marriott.com"
    },
    {
      id: 5, name: "IHG Hotels & Resorts", category: "hotel",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/IHG-Logo.png",
      description: "Một trong những tập đoàn khách sạn lớn nhất thế giới với các thương hiệu nổi tiếng.",
      since: "2017", badges: ["Toàn cầu", "Đa dạng"],
      features: ["Hơn 6,000 khách sạn", "Nhiều thương hiệu", "IHG Rewards Club"],
      website: "https://www.ihg.com"
    },
    {
      id: 6, name: "Vinpearl", category: "hotel",
      logo: "",
      description: "Thương hiệu nghỉ dưỡng và giải trí hàng đầu Việt Nam, sở hữu các resort và khách sạn cao cấp.",
      since: "2014", badges: ["Việt Nam", "5 sao"],
      features: ["Resort 5 sao", "Khu vui chơi lớn", "Dịch vụ spa đẳng cấp"],
      website: "https://www.vinpearl.com"
    },
    {
      id: 7, name: "Saigontourist", category: "travel",
      logo: "",
      description: "Công ty du lịch lữ hành hàng đầu Việt Nam với hơn 40 năm kinh nghiệm.",
      since: "2013", badges: ["Lâu đời", "Chuyên nghiệp"],
      features: ["40+ năm kinh nghiệm", "Hướng dẫn viên chuyên nghiệp", "Tour đa dạng"],
      website: "https://www.saigontourist.net"
    },
    {
      id: 8, name: "Vietravel", category: "travel",
      logo: "",
      description: "Công ty du lịch hàng đầu với mạng lưới rộng khắp cả nước.",
      since: "2012", badges: ["Rộng khắp", "Chất lượng"],
      features: ["Mạng lưới văn phòng rộng", "Tour đa dạng", "Dịch vụ 24/7"],
      website: "https://www.vietravel.com"
    },
    {
      id: 9, name: "FLC Group", category: "travel",
      logo: "",
      description: "Tập đoàn đa ngành với các dự án nghỉ dưỡng và giải trí lớn tại các điểm đến du lịch nổi tiếng.",
      since: "2015", badges: ["Nghỉ dưỡng", "Golf"],
      features: ["Khu nghỉ dưỡng cao cấp", "Sân golf", "Dịch vụ giải trí"],
      website: "https://www.flc.vn"
    },
    {
      id: 10, name: "Avis Car Rental", category: "service",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Avis-Logo.png",
      description: "Dịch vụ thuê xe hàng đầu thế giới với hơn 5,000 địa điểm tại hơn 165 quốc gia.",
      since: "2020", badges: ["Quốc tế", "Chuyên nghiệp"],
      features: ["Đội xe đa dạng", "Thuê tại sân bay", "Bảo hiểm 24/7"],
      website: "https://www.avis.com"
    }
  ];

  let filteredPartners = [];
  let searchQuery = '';

  // Load partners data (now embedded, no fetch needed)
  function loadPartners() {
    try {
      filteredPartners = [...partners];
      $('#partners-loading').addClass('d-none');
      renderPartners();
    } catch (err) {
      console.error('Error loading partners:', err);
      $('#partners-loading').addClass('d-none');
      $('#partners-grid').html(`
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <p class="text-muted mt-3">Không tải được dữ liệu đối tác</p>
        </div>
      `);
    }
  }

  // Render partners grid
  function renderPartners() {
    const $grid = $('#partners-grid');
    if (!$grid.length) return;

    if (filteredPartners.length === 0) {
      $grid.html(`
        <div class="col-12 text-center py-5 reveal">
          <div class="empty-state">
            <i class="bi bi-inbox text-muted" style="font-size: 4rem; opacity: 0.5;"></i>
            <h5 class="text-muted mt-3 mb-2">Không có đối tác nào</h5>
            <p class="text-muted small">Không tìm thấy đối tác trong danh mục này</p>
          </div>
        </div>
      `);
      return;
    }

    const html = filteredPartners.map((partner, index) => {
      const categoryIcon = {
        airline: 'bi-airplane',
        hotel: 'bi-building',
        travel: 'bi-map',
        service: 'bi-star'
      }[partner.category] || 'bi-building';

      const categoryName = {
        airline: 'Hãng bay',
        hotel: 'Khách sạn',
        travel: 'Lữ hành',
        service: 'Dịch vụ'
      }[partner.category] || 'Khác';

      const categoryColor = {
        airline: '#0d6efd',
        hotel: '#198754',
        travel: '#fd7e14',
        service: '#6f42c1'
      }[partner.category] || '#0d6efd';

      const badges = partner.badges.map(badge => 
        `<span class="badge bg-primary-subtle text-primary small me-1 mb-1">${badge}</span>`
      ).join('');

      const logoHtml = partner.logo 
        ? `<img src="${partner.logo}" alt="${partner.name}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'logo-placeholder-small\\'><i class=\\'bi ${categoryIcon}\\'></i></div>'">`
        : `<div class="logo-placeholder-small" style="background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd);"><i class="bi ${categoryIcon}"></i></div>`;

      return `
        <div class="col-lg-4 col-md-6 partner-card-wrapper" data-category="${partner.category}">
          <div class="partner-card reveal hover-lift" data-id="${partner.id}" style="animation-delay: ${index * 0.1}s;">
            <div class="partner-card-header">
              <div class="partner-logo">
                ${logoHtml}
              </div>
              <div class="partner-category" style="background: ${categoryColor}15; color: ${categoryColor};">
                <i class="bi ${categoryIcon}"></i>
                <span>${categoryName}</span>
              </div>
            </div>
            <div class="partner-card-body">
              <h5 class="partner-name">${partner.name}</h5>
              <p class="partner-description">${partner.description.substring(0, 100)}${partner.description.length > 100 ? '...' : ''}</p>
              <div class="partner-badges mb-2">
                ${badges}
              </div>
              <div class="partner-meta">
                <span class="text-muted small">
                  <i class="bi bi-calendar-check"></i> Hợp tác từ ${partner.since}
                </span>
              </div>
            </div>
            <div class="partner-card-footer">
              <button class="btn btn-outline-primary btn-sm w-100 btn-view-partner" data-id="${partner.id}">
                <i class="bi bi-info-circle me-1"></i> Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $grid.html(html);
  }

  // Filter and search partners
  function filterPartners(category) {
    let result = [...partners];
    
    // Filter by category
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.badges.some(b => b.toLowerCase().includes(query))
      );
    }
    
    filteredPartners = result;
    renderPartners();
  }

  // Show partner detail modal
  function showPartnerModal(partnerId) {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    const modal = new bootstrap.Modal(document.getElementById('partnerModal'));
    
    const categoryIcon = {
      airline: 'bi-airplane',
      hotel: 'bi-building',
      travel: 'bi-map',
      service: 'bi-star'
    }[partner.category] || 'bi-building';
    
    // Set logo
    const logoHtml = partner.logo 
      ? `<img src="${partner.logo}" alt="${partner.name}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'logo-placeholder\\'><i class=\\'bi ${categoryIcon}\\'></i></div>'">`
      : `<div class="logo-placeholder"><i class="bi ${categoryIcon}"></i></div>`;
    $('#modal-logo').html(logoHtml);

    // Set name
    $('#modal-name').text(partner.name);

    // Set badges
    const badgesHtml = partner.badges.map(badge => 
      `<span class="badge bg-primary-subtle text-primary">${badge}</span>`
    ).join('');
    $('#modal-badges').html(badgesHtml);

    // Set description
    $('#modal-description').text(partner.description);

    // Set category
    const categoryName = {
      airline: 'Hãng bay',
      hotel: 'Khách sạn',
      travel: 'Lữ hành',
      service: 'Dịch vụ'
    }[partner.category] || 'Khác';
    $('#modal-category').text(categoryName);

    // Set since
    $('#modal-since').text(partner.since);

    // Set features
    const featuresHtml = partner.features.map(feature => 
      `<li class="mb-2"><i class="bi bi-check-circle text-success"></i> ${feature}</li>`
    ).join('');
    $('#modal-features').html(featuresHtml);

    // Set website link
    $('#modal-website').attr('href', partner.website);

    modal.show();
  }

  // Initialize scroll reveal animations
  function initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    reveals.forEach(el => {
      observer.observe(el);
    });

    // Observe partner cards
    const cards = document.querySelectorAll('.partner-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      observer.observe(card);
    });
  }

  // Animate partner cards on load
  function animatePartnerCards() {
    const cards = document.querySelectorAll('.partner-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Initialize with delay for better UX
  $(function () {
    // Show loading state
    $('#partners-loading').removeClass('d-none');
    $('#partners-grid').addClass('d-none');

    // Load partners after a short delay to show loading
    setTimeout(() => {
      loadPartners();
      $('#partners-grid').removeClass('d-none');
      
      // Initialize animations after content is loaded
      setTimeout(() => {
        initScrollReveal();
        animatePartnerCards();
      }, 100);
    }, 300);

    // Filter buttons
    $('.partners-filter button').on('click', function () {
      $('.partners-filter button').removeClass('active');
      $(this).addClass('active');
      const category = $(this).data('category');
      filterPartners(category);
      
      // Re-animate cards after filter
      setTimeout(() => {
        animatePartnerCards();
        initScrollReveal();
      }, 100);
    });

    // Search input
    $('#partner-search').on('input', function () {
      searchQuery = $(this).val();
      const activeCategory = $('.partners-filter button.active').data('category') || 'all';
      
      if (searchQuery.trim()) {
        $('#search-clear').removeClass('d-none');
      } else {
        $('#search-clear').addClass('d-none');
      }
      
      filterPartners(activeCategory);
      
      // Re-animate cards after search
      setTimeout(() => {
        animatePartnerCards();
        initScrollReveal();
      }, 100);
    });

    // Clear search
    $('#search-clear').on('click', function () {
      $('#partner-search').val('');
      searchQuery = '';
      $(this).addClass('d-none');
      const activeCategory = $('.partners-filter button.active').data('category') || 'all';
      filterPartners(activeCategory);
      
      setTimeout(() => {
        animatePartnerCards();
        initScrollReveal();
      }, 100);
    });

    // View partner detail
    $(document).on('click', '.btn-view-partner', function () {
      const partnerId = parseInt($(this).data('id'));
      showPartnerModal(partnerId);
    });

    // Click on partner card to open modal
    $(document).on('click', '.partner-card', function (e) {
      if (!$(e.target).closest('.btn-view-partner').length) {
        const partnerId = parseInt($(this).data('id'));
        if (partnerId) {
          showPartnerModal(partnerId);
        }
      }
    });
  });
})();

