(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast, storage } = window.APP_UTILS;
  const SESSION_KEY = "travel_user";

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function login(email, password) {
    let users = [];
    try {
      users = await http.get(`${API.users}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      throw new Error("Không kết nối được máy chủ (users)");
    }
    const user = Array.isArray(users)
      ? users.find((u) => u.email === email && u.password === password)
      : null;
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");
    const role = user.role || (user.email?.includes("admin") ? "admin" : "user");
    const sessionUser = { ...user, role };
    storage.set(SESSION_KEY, sessionUser);
    return sessionUser;
  }

  async function register(name, email, password) {
    let exists = [];
    try {
      exists = await http.get(`${API.users}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      throw new Error("Không kết nối được máy chủ (users)");
    }
    if (Array.isArray(exists) && exists.some((u) => u.email === email)) {
      throw new Error("Email đã tồn tại");
    }
    const user = await http.post(API.users, {
      name,
      email,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
    });
    storage.set(SESSION_KEY, user);
    return user;
  }

  function logout() {
    storage.remove(SESSION_KEY);
  }

  function getCurrentUser() {
    return storage.get(SESSION_KEY, null);
  }

  // Bind forms if present
  $(function () {
    const $loginForm = $("#login-form");
    if ($loginForm.length) {
      $loginForm.on("submit", async (e) => {
        e.preventDefault();
        const email = $("#login-email").val().trim();
        const password = $("#login-password").val().trim();
        if (!email || !password) return showToast("Vui lòng nhập đủ thông tin", "warning");
        if (!isValidEmail(email)) return showToast("Email không hợp lệ", "warning");
        try {
          $("#login-form button[type='submit']").prop("disabled", true);
          const user = await login(email, password);
          showToast("Đăng nhập thành công", "success");
          window.location.href = user.role === "admin" ? "admin-dashboard.html" : "index.html";
        } catch (err) {
          showToast(err.message, "danger");
        } finally {
          $("#login-form button[type='submit']").prop("disabled", false);
        }
      });
    }

    const $registerForm = $("#register-form");
    if ($registerForm.length) {
      $registerForm.on("submit", async (e) => {
        e.preventDefault();
        const name = $("#register-name").val().trim();
        const email = $("#register-email").val().trim();
        const password = $("#register-password").val().trim();
        const confirm = $("#register-confirm").val()?.trim();
        if (!name || !email || !password || !confirm) return showToast("Vui lòng nhập đủ thông tin", "warning");
        if (!isValidEmail(email)) return showToast("Email không hợp lệ", "warning");
        if (password.length < 6) return showToast("Mật khẩu tối thiểu 6 ký tự", "warning");
        if (password !== confirm) return showToast("Mật khẩu nhập lại không khớp", "warning");
        try {
          $("#register-form button[type='submit']").prop("disabled", true);
          await register(name, email, password);
          showToast("Tạo tài khoản thành công", "success");
          window.location.href = "index.html";
        } catch (err) {
          showToast(err.message, "danger");
        } finally {
          $("#register-form button[type='submit']").prop("disabled", false);
        }
      });
    }
  });

  window.APP_AUTH = { login, register, logout, getCurrentUser };
})();
