(function () {
  const { storage, showToast } = window.APP_UTILS;
  const SESSION_KEY = "travel_user";

  function getCurrentUser() {
    return storage.get(SESSION_KEY, null);
  }

  function saveCurrentUser(user) {
    storage.set(SESSION_KEY, user);
  }

  $(function () {
    const user = getCurrentUser();
    if (!user) {
      showToast("Vui lòng đăng nhập", "warning");
      return;
    }
    $("#pf-name").val(user.name || "");
    $("#pf-email").val(user.email || "");

    $("#profile-form").on("submit", function (e) {
      e.preventDefault();
      const name = $("#pf-name").val().trim();
      
      // Validation
      if (!name) {
        showToast("Tên không được để trống", "warning");
        $("#pf-name").focus();
        return;
      }
      if (name.length < 2) {
        showToast("Tên phải có ít nhất 2 ký tự", "warning");
        $("#pf-name").focus();
        return;
      }
      if (name.length > 50) {
        showToast("Tên không được quá 50 ký tự", "warning");
        $("#pf-name").focus();
        return;
      }
      
      const updated = { ...user, name };
      saveCurrentUser(updated);
      showToast("Đã cập nhật thông tin thành công", "success");
    });
  });
})();

