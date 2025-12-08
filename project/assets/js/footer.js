/**
 * Footer Scripts
 * Handles footer interactions and animations
 */
(function () {
  // Back to Top Button
  function initBackToTop() {
    const $btn = $('#backToTop');
    
    if (!$btn.length) return;

    $(window).on('scroll', function () {
      if ($(window).scrollTop() > 300) {
        $btn.addClass('show');
      } else {
        $btn.removeClass('show');
      }
    });

    $btn.on('click', function () {
      $('html, body').animate({
        scrollTop: 0
      }, 600);
    });
  }

  // Newsletter Form
  function initNewsletter() {
    $('.footer-newsletter').on('submit', function (e) {
      e.preventDefault();
      const email = $(this).find('input[type="email"]').val();
      
      if (!email) {
        if (window.APP_UTILS && window.APP_UTILS.showToast) {
          window.APP_UTILS.showToast('Vui lòng nhập email', 'warning');
        }
        return;
      }

      // Show success message
      if (window.APP_UTILS && window.APP_UTILS.showToast) {
        window.APP_UTILS.showToast('Đã đăng ký nhận tin thành công!', 'success');
      }
      
      $(this).find('input[type="email"]').val('');
    });
  }

  // Animate elements on scroll
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe footer sections
    document.querySelectorAll('.footer-brand, .footer-title, .contact-item').forEach(el => {
      observer.observe(el);
    });
  }

  // Initialize
  $(function () {
    initBackToTop();
    initNewsletter();
    initScrollAnimations();
  });
})();







