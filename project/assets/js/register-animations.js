/**
 * Register Page Animations
 * Handles interactive animations and password validation
 */
(function () {
  // Password toggle
  function initPasswordToggle() {
    const $togglePassword = $('#toggle-password');
    const $password = $('#register-password');
    const $toggleConfirm = $('#toggle-confirm-password');
    const $confirm = $('#register-confirm');

    if ($togglePassword.length && $password.length) {
      $togglePassword.on('click', function () {
        const type = $password.attr('type') === 'password' ? 'text' : 'password';
        $password.attr('type', type);
        
        const icon = type === 'password' ? 'bi-eye' : 'bi-eye-slash';
        $(this).find('i').removeClass('bi-eye bi-eye-slash').addClass(icon);
        
        $(this).addClass('animate-pulse');
        setTimeout(() => {
          $(this).removeClass('animate-pulse');
        }, 300);
      });
    }

    if ($toggleConfirm.length && $confirm.length) {
      $toggleConfirm.on('click', function () {
        const type = $confirm.attr('type') === 'password' ? 'text' : 'password';
        $confirm.attr('type', type);
        
        const icon = type === 'password' ? 'bi-eye' : 'bi-eye-slash';
        $(this).find('i').removeClass('bi-eye bi-eye-slash').addClass(icon);
        
        $(this).addClass('animate-pulse');
        setTimeout(() => {
          $(this).removeClass('animate-pulse');
        }, 300);
      });
    }
  }

  // Password strength checker
  function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = {
      length: password.length >= 6,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    if (requirements.length) strength += 25;
    if (requirements.upper) strength += 25;
    if (requirements.number) strength += 25;
    if (requirements.special) strength += 25;

    return { strength, requirements };
  }

  // Update password strength indicator
  function updatePasswordStrength() {
    const password = $('#register-password').val();
    const { strength, requirements } = checkPasswordStrength(password);

    const $fill = $('#strength-fill');
    const $text = $('#strength-text');
    const $reqLength = $('#req-length');
    const $reqUpper = $('#req-upper');
    const $reqNumber = $('#req-number');

    // Update strength bar
    $fill.css('width', `${strength}%`);
    
    if (strength < 50) {
      $fill.removeClass('strength-weak strength-medium strength-strong').addClass('strength-weak');
      $text.text(getI18nText('password_weak', 'Mật khẩu yếu')).removeClass('text-success text-warning').addClass('text-danger');
    } else if (strength < 75) {
      $fill.removeClass('strength-weak strength-medium strength-strong').addClass('strength-medium');
      $text.text(getI18nText('password_medium', 'Mật khẩu trung bình')).removeClass('text-success text-danger').addClass('text-warning');
    } else {
      $fill.removeClass('strength-weak strength-medium strength-strong').addClass('strength-strong');
      $text.text(getI18nText('password_strong', 'Mật khẩu mạnh')).removeClass('text-warning text-danger').addClass('text-success');
    }

    // Update requirements
    updateRequirement($reqLength, requirements.length);
    updateRequirement($reqUpper, requirements.upper);
    updateRequirement($reqNumber, requirements.number);
  }

  function updateRequirement($element, isValid) {
    const $icon = $element.find('i');
    if (isValid) {
      $icon.removeClass('bi-circle').addClass('bi-check-circle-fill text-success');
      $element.find('span').addClass('text-success');
    } else {
      $icon.removeClass('bi-check-circle-fill text-success').addClass('bi-circle');
      $element.find('span').removeClass('text-success');
    }
  }

  // Get i18n text helper
  function getI18nText(key, fallback) {
    const $element = $(`[data-i18n="${key}"]`);
    if ($element.length && $element.text().trim()) {
      return $element.text().trim();
    }
    // Try to get from dictionary if available
    if (window.APP_LANG && window.APP_LANG[key]) {
      return window.APP_LANG[key];
    }
    return fallback || key;
  }

  // Check password match
  function checkPasswordMatch() {
    const password = $('#register-password').val();
    const confirm = $('#register-confirm').val();
    const $match = $('#password-match');
    const $checkIcon = $match.find('.bi-check-circle');
    const $xIcon = $match.find('.bi-x-circle');
    const $text = $match.find('span');

    if (confirm.length === 0) {
      $checkIcon.addClass('d-none');
      $xIcon.addClass('d-none');
      $text.text('').removeClass('text-success text-danger');
      return;
    }

    if (password === confirm) {
      $checkIcon.removeClass('d-none');
      $xIcon.addClass('d-none');
      $text.text(getI18nText('password_match', 'Mật khẩu khớp')).removeClass('text-danger').addClass('text-success');
    } else {
      $checkIcon.addClass('d-none');
      $xIcon.removeClass('d-none');
      $text.text(getI18nText('password_not_match', 'Mật khẩu không khớp')).removeClass('text-success').addClass('text-danger');
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

    // Real-time password strength check
    $('#register-password').on('input', function () {
      updatePasswordStrength();
      checkPasswordMatch();
    });

    // Real-time password match check
    $('#register-confirm').on('input', function () {
      checkPasswordMatch();
    });
  }

  // Form submission animation
  function initFormSubmission() {
    $('#register-form').on('submit', function () {
      const $btn = $(this).find('button[type="submit"]');
      const $btnText = $btn.find('.btn-text');
      const $btnLoader = $btn.find('.btn-loader');

      // Validate password match
      const password = $('#register-password').val();
      const confirm = $('#register-confirm').val();
      
      if (password !== confirm) {
        if (window.APP_UTILS && window.APP_UTILS.showToast) {
          window.APP_UTILS.showToast('Mật khẩu không khớp', 'danger');
        }
        return false;
      }

      // Show loading state
      $btnText.addClass('d-none');
      $btnLoader.removeClass('d-none');
      $btn.prop('disabled', true);
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
    const elements = $('.form-group-wrapper, .form-options, .btn-login, .login-divider, .social-login, .login-footer');
    
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

  // Update password match text when language changes
  $(document).on('langChanged', function() {
    // Re-check password match to update text
    if ($('#register-confirm').val().length > 0) {
      checkPasswordMatch();
    }
    // Re-update password strength to update text
    if ($('#register-password').val().length > 0) {
      updatePasswordStrength();
    }
  });

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

