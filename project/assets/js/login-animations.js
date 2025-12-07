/**
 * Login Page Animations
 * Handles interactive animations and effects
 */
(function () {
  // Password toggle
  function initPasswordToggle() {
    const $toggle = $('#toggle-password');
    const $password = $('#login-password');

    if ($toggle.length && $password.length) {
      $toggle.on('click', function () {
        const type = $password.attr('type') === 'password' ? 'text' : 'password';
        $password.attr('type', type);
        
        const icon = type === 'password' ? 'bi-eye' : 'bi-eye-slash';
        $(this).find('i').removeClass('bi-eye bi-eye-slash').addClass(icon);
        
        // Add animation
        $(this).addClass('animate-pulse');
        setTimeout(() => {
          $(this).removeClass('animate-pulse');
        }, 300);
      });
    }
  }

  // Input focus animations
  function initInputAnimations() {
    $('.login-input').on('focus', function () {
      $(this).closest('.input-wrapper').addClass('input-focused');
    });

    $('.login-input').on('blur', function () {
      $(this).closest('.input-wrapper').removeClass('input-focused');
    });

    // Add floating label effect
    $('.login-input').on('input', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('has-value');
      } else {
        $(this).removeClass('has-value');
      }
    });
  }

  // Form submission animation
  function initFormSubmission() {
    $('#login-form').on('submit', function () {
      const $btn = $(this).find('button[type="submit"]');
      const $btnText = $btn.find('.btn-text');
      const $btnLoader = $btn.find('.btn-loader');

      // Show loading state
      $btnText.addClass('d-none');
      $btnLoader.removeClass('d-none');
      $btn.prop('disabled', true);

      // Add pulse animation
      $btn.addClass('animate-pulse');
    });
  }

  // Social button hover effects
  function initSocialButtons() {
    $('.btn-social').on('mouseenter', function () {
      $(this).find('i').addClass('animate-bounce');
    });

    $('.btn-social').on('mouseleave', function () {
      $(this).find('i').removeClass('animate-bounce');
    });
  }

  // Ripple effect for buttons
  function initRippleEffect() {
    $('.btn-login, .btn-social').on('click', function (e) {
      const $btn = $(this);
      const ripple = $('<span class="ripple-effect"></span>');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.css({
        width: size,
        height: size,
        left: x,
        top: y
      });

      $btn.append(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  // Stagger animation for form elements
  function initStaggerAnimations() {
    const elements = $('.form-group-wrapper, .form-options, .btn-login, .login-divider, .social-login, .login-footer, .admin-info');
    
    elements.each(function (index) {
      $(this).css('animation-delay', `${index * 0.1}s`);
    });
  }

  // Parallax effect for background shapes
  function initParallax() {
    $(window).on('mousemove', function (e) {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      $('.shape').each(function (index) {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        $(this).css('transform', `translate(${x}px, ${y}px)`);
      });
    });
  }

  // Initialize all animations
  $(function () {
    initPasswordToggle();
    initInputAnimations();
    initFormSubmission();
    initSocialButtons();
    initRippleEffect();
    initStaggerAnimations();
    initParallax();

    // Add entrance animation
    setTimeout(() => {
      $('.login-card').addClass('active');
    }, 100);
  });
})();





