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

  $(function () {
    $("#contact-form").on("submit", function (e) {
      e.preventDefault();
      const name = $("#contact-name").val().trim();
      const email = $("#contact-email").val().trim();
      const message = $("#contact-message").val().trim();

      if (!name || !email || !message) {
        showToast("Vui lòng điền đầy đủ thông tin", "warning");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Email không hợp lệ", "warning");
        return;
      }

      saveContact({ name, email, message });
      showToast("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.", "success");
      this.reset();
    });
  });
})();



