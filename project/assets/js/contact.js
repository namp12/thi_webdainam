(function () {
  const { showToast } = window.APP_UTILS;
  const CONTACTS_KEY = "travel_contacts";

  function saveContact(contact) {
    const contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY) || "[]");
    contact.id = Date.now();
    contact.createdAt = new Date().toISOString();
    contacts.push(contact);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }

  function validateField($field, validator) {
    const value = $field.val().trim();
    const $feedback = $field.siblings('.contact-form-feedback');
    const isValid = validator(value);
    
    $field.removeClass('is-valid is-invalid');
    $feedback.hide();
    
    if (value && !isValid) {
      $field.addClass('is-invalid');
      $feedback.addClass('invalid-feedback').removeClass('valid-feedback').show();
      return false;
    } else if (value && isValid) {
      $field.addClass('is-valid');
      $feedback.addClass('valid-feedback').removeClass('invalid-feedback').html('<i class="bi bi-check-circle"></i> Hợp lệ').show();
      return true;
    }
    return null; // Empty field
  }

  function validateForm() {
    let isValid = true;
    
    // Validate name
    const nameValid = validateField($("#contact-name"), (val) => val.length >= 2);
    if (nameValid === false) isValid = false;
    
    // Validate email
    const emailValid = validateField($("#contact-email"), (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    if (emailValid === false) isValid = false;
    
    // Validate phone (optional)
    const phone = $("#contact-phone").val().trim();
    if (phone) {
      const phoneValid = validateField($("#contact-phone"), (val) => /^[0-9]{10,11}$/.test(val));
      if (phoneValid === false) isValid = false;
    }
    
    // Validate message
    const messageValid = validateField($("#contact-message"), (val) => val.length >= 10);
    if (messageValid === false) isValid = false;
    
    return isValid;
  }

  $(function () {
    const $form = $("#contact-form-element");
    const $submitBtn = $form.find('button[type="submit"]');
    
    // Real-time validation
    $("#contact-name, #contact-email, #contact-phone, #contact-message").on('blur', function() {
      const $field = $(this);
      if ($field.attr('id') === 'contact-name') {
        validateField($field, (val) => val.length >= 2);
      } else if ($field.attr('id') === 'contact-email') {
        validateField($field, (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
      } else if ($field.attr('id') === 'contact-phone') {
        const val = $field.val().trim();
        if (val) {
          validateField($field, (val) => /^[0-9]{10,11}$/.test(val));
        }
      } else if ($field.attr('id') === 'contact-message') {
        validateField($field, (val) => val.length >= 10);
      }
    });

    $form.on("submit", function (e) {
      e.preventDefault();
      
      const name = $("#contact-name").val().trim();
      const email = $("#contact-email").val().trim();
      const phone = $("#contact-phone").val().trim();
      const message = $("#contact-message").val().trim();

      // Validate all fields
      if (!validateForm()) {
        showToast("Vui lòng kiểm tra lại thông tin đã nhập", "warning");
        return;
      }

      // Disable submit button
      $submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Đang gửi...');

      // Simulate API call
      setTimeout(() => {
        saveContact({ name, email, phone, message });
        showToast("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.", "success");
        
        // Reset form
        $form[0].reset();
        $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
        $form.find('.contact-form-feedback').hide();
        
        // Re-enable submit button
        $submitBtn.prop('disabled', false).html('<i class="bi bi-send-fill"></i> <span data-i18n="contact_send">Gửi tin nhắn</span>');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);
    });
  });
})();







