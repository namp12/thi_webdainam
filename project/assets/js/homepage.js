/**
 * Homepage Enhanced Functionality
 * Handles hero search, category tabs, newsletter, and other homepage interactions
 */
(function () {
  const { http, showToast } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;

  // Hero Search Form Handler
  function initHeroSearch() {
    const $heroForm = $("#hero-search");
    const $heroDestination = $("#hero-destination");
    const $heroDateStart = $("#hero-date-start");
    const $heroDateEnd = $("#hero-date-end");
    const $heroGuests = $("#hero-guests");
    const $tourDestination = $("#tour-destination");
    const $tourDate = $("#tour-date");
    const $tourGuests = $("#tour-guests");
    const $tourSearch = $("#tour-search");

    // Sync hero search with main search
    if ($heroForm.length) {
      // Load destinations
      if (window.tours && window.tours.length) {
        const unique = Array.from(new Set(window.tours.map((t) => t.destination))).filter(Boolean);
        const options = ['<option value="">Chọn điểm đến</option>', ...unique.map((d) => `<option value="${d}">${d}</option>`)];
        $heroDestination.html(options.join(""));
      }

      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      $heroDateStart.attr('min', today);
      $heroDateEnd.attr('min', today);

      // Update end date min when start date changes
      $heroDateStart.on('change', function() {
        const startDate = $(this).val();
        if (startDate) {
          $heroDateEnd.attr('min', startDate);
        }
      });

      // Handle form submission
      $heroForm.on('submit', function(e) {
        e.preventDefault();
        
        // Sync values to main search form
        if ($tourDestination.length) {
          $tourDestination.val($heroDestination.val());
        }
        if ($tourDate.length) {
          $tourDate.val($heroDateStart.val());
        }
        if ($tourGuests.length) {
          $tourGuests.val($heroGuests.val());
        }

        // Navigate to tours page with search params
        const params = new URLSearchParams();
        if ($heroDestination.val()) params.set('destination', $heroDestination.val());
        if ($heroDateStart.val()) params.set('date', $heroDateStart.val());
        if ($heroDateEnd.val()) params.set('returnDate', $heroDateEnd.val());
        if ($heroGuests.val()) params.set('guests', $heroGuests.val());

        const queryString = params.toString();
        window.location.href = `tours.html${queryString ? '?' + queryString : ''}`;
      });
    }
  }

  // Enhanced Category Pills Handler
  function initCategoryTabs() {
    const $categoryPills = $(".category-pill");
    const $catPills = $("#category-pills");

    if ($categoryPills.length) {
      // Handle click on category pills
      $categoryPills.on('click', function() {
        const category = $(this).data('category');
        
        // Update active state
        $categoryPills.removeClass('active');
        $(this).addClass('active');

        // Trigger category filter (if tours.js is loaded)
        if (window.tours && typeof window.renderCategory === 'function') {
          window.renderCategory(window.tours, category);
        } else if ($catPills.length) {
          // Fallback: trigger button click if old pills exist
          $catPills.find(`button[data-category="${category}"]`).trigger('click');
        }

        // Smooth scroll to tour list
        const $tourList = $("#category-tour-list");
        if ($tourList.length) {
          setTimeout(() => {
            $tourList[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });

      // Keyboard navigation
      $categoryPills.on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          $(this).trigger('click');
        }
      });
    }
  }

  // Newsletter Form Handler
  function initNewsletter() {
    const $newsletterForm = $("#newsletter-form");

    if ($newsletterForm.length) {
      $newsletterForm.on('submit', function(e) {
        e.preventDefault();
        
        const email = $(this).find('input[type="email"]').val();
        
        if (!email) {
          showToast("Vui lòng nhập email", "warning");
          return;
        }

        // Simulate newsletter subscription
        const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
        if (!subscriptions.includes(email)) {
          subscriptions.push(email);
          localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
          showToast("Đăng ký thành công! Chúng tôi sẽ gửi ưu đãi đến email của bạn.", "success");
          $(this)[0].reset();
        } else {
          showToast("Email này đã được đăng ký rồi!", "info");
        }
      });
    }
  }

  // Initialize date pickers with Vietnamese locale
  function initDatePickers() {
    // Set Vietnamese labels if possible
    const $dateInputs = $('input[type="date"]');
    $dateInputs.each(function() {
      const $input = $(this);
      const label = $input.closest('.hero-search-field').find('label').text();
      
      // Add placeholder text via data attribute
      if (label.includes('Ngày đi')) {
        $input.attr('title', 'Chọn ngày khởi hành');
      } else if (label.includes('Ngày về')) {
        $input.attr('title', 'Chọn ngày trở về');
      }
    });
  }

  // Initialize all homepage enhancements
  $(function () {
    initHeroSearch();
    initCategoryTabs();
    initNewsletter();
    initDatePickers();

    // Animate category pills on load
    $('.category-pill').each(function(index) {
      $(this).css('animation-delay', `${index * 0.05}s`);
      $(this).addClass('reveal');
    });

    // Animate hero search on load
    setTimeout(() => {
      $('.hero-search-enhanced').addClass('animate-slide-in-up');
    }, 300);
  });
})();

