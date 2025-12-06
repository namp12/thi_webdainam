(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast } = window.APP_UTILS;

  let users = [];
  let editingId = null;

  async function loadUsers() {
    try {
      users = await http.get(API.users);
      renderTable();
    } catch (err) {
      showToast("Không tải được users", "danger");
    }
  }

  function renderTable() {
    const tbody = $("#users-tbody");
    if (!tbody.length) return;

    if (!users.length) {
      tbody.html('<tr><td colspan="6" class="text-center text-muted">Chưa có user nào</td></tr>');
      return;
    }

    const html = users
      .map(
        (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${u.name || ""}</td>
        <td>${u.email || ""}</td>
        <td><span class="badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}">${u.role || "user"}</span></td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editUser(${u.id})">Sửa</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
    tbody.html(html);
  }

  window.editUser = function (id) {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    editingId = id;
    $("#user-name").val(user.name || "");
    $("#user-email").val(user.email || "");
    $("#user-password").val("");
    $("#user-role").val(user.role || "user");
    new bootstrap.Modal(document.getElementById("user-modal")).show();
  };

  window.deleteUser = async function (id) {
    if (!confirm("Xác nhận xóa user này?")) return;
    try {
      await http.delete(`${API.users}/${id}`);
      showToast("Đã xóa user", "success");
      loadUsers();
    } catch (err) {
      showToast("Xóa thất bại", "danger");
    }
  };

  $("#user-form").on("submit", async (e) => {
    e.preventDefault();
    const name = $("#user-name").val().trim();
    const email = $("#user-email").val().trim();
    const password = $("#user-password").val().trim();
    const role = $("#user-role").val();

    if (!name || !email) {
      showToast("Vui lòng nhập đủ thông tin", "warning");
      return;
    }

    const data = {
      name,
      email,
      role: role || "user",
      createdAt: new Date().toISOString(),
    };

    // Chỉ thêm password nếu có nhập (khi tạo mới hoặc đổi mật khẩu)
    if (password) {
      data.password = password;
    }

    try {
      if (editingId) {
        // Update user
        await http.put(`${API.users}/${editingId}`, data);
        showToast("Đã cập nhật user", "success");
      } else {
        // Create new user
        if (!password) {
          showToast("Vui lòng nhập mật khẩu cho user mới", "warning");
          return;
        }
        await http.post(API.users, data);
        showToast("Đã thêm user", "success");
      }
      bootstrap.Modal.getInstance(document.getElementById("user-modal")).hide();
      editingId = null;
      $("#user-form")[0].reset();
      loadUsers();
    } catch (err) {
      showToast("Thao tác thất bại: " + (err.message || ""), "danger");
    }
  });

  $("#btn-add-user").on("click", () => {
    editingId = null;
    $("#user-form")[0].reset();
    $("#user-role").val("user");
    new bootstrap.Modal(document.getElementById("user-modal")).show();
  });

  $(function () {
    loadUsers();
  });
})();


