(function () {
  const { API } = window.APP_CONFIG;
  const { http, showToast, formatPrice } = window.APP_UTILS;

  let tours = [];
  let editingId = null;

  async function loadTours() {
    try {
      tours = await http.get(API.tours);
      renderTable();
    } catch (err) {
      showToast("Không tải được tours", "danger");
    }
  }

  function renderTable() {
    const tbody = $("#tours-tbody");
    if (!tbody.length) return;

    if (!tours.length) {
      tbody.html('<tr><td colspan="6" class="text-center text-muted">Chưa có tour nào</td></tr>');
      return;
    }

    const html = tours
      .map(
        (t) => `
      <tr>
        <td>${t.id}</td>
        <td>${t.title || ""}</td>
        <td>${t.destination || ""}</td>
        <td>${formatPrice(t.price || 0)}</td>
        <td>${t.duration || 0} ngày</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="editTour(${t.id})">Sửa</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTour(${t.id})">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
    tbody.html(html);
  }

  // Load danh sách ảnh có sẵn
  async function loadAvailableImages() {
    try {
      // Giả lập danh sách ảnh - trong thực tế cần scan thư mục
      const images = [
        '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
        'da-nang.jpg', 'sapa.jpg', 'phu-quoc.jpg', 'ha-long.jpg', 'nha-trang.jpg', 'da-lat.jpg'
      ];
      
      const $select = $("#tour-form-image-select");
      $select.html('<option value="">-- Chọn ảnh từ danh sách --</option>');
      images.forEach(img => {
        $select.append(`<option value="assets/img/tours/${img}">${img}</option>`);
      });
    } catch (err) {
      console.warn("Không load được danh sách ảnh", err);
    }
  }

  // Load image mapping để hiển thị ảnh đã chọn
  async function loadImageMapping() {
    try {
      const response = await fetch('data/image-mapping.json');
      const data = await response.json();
      return data.mapping || {};
    } catch (err) {
      return {};
    }
  }

  window.editTour = async function (id) {
    const tour = tours.find((t) => t.id === id);
    if (!tour) return;
    editingId = id;
    
    await loadAvailableImages();
    const mapping = await loadImageMapping();
    const mappedImage = mapping[String(id)];
    
    $("#tour-form-title").val(tour.title || "");
    $("#tour-form-destination").val(tour.destination || "");
    $("#tour-form-price").val(tour.price || "");
    $("#tour-form-duration").val(tour.duration || "");
    
    // Nếu có mapping, set vào select
    if (mappedImage) {
      $("#tour-form-image-select").val(`assets/img/tours/${mappedImage}`);
      $("#tour-form-image").val(`assets/img/tours/${mappedImage}`);
    } else {
      $("#tour-form-image").val(tour.image || "");
    }
    
    $("#tour-form-description").val(tour.description || "");
    
    // Bind event cho select
    $("#tour-form-image-select").off('change').on('change', function() {
      $("#tour-form-image").val($(this).val());
    });
    
    new bootstrap.Modal(document.getElementById("tour-modal")).show();
  };

  window.deleteTour = async function (id) {
    if (!confirm("Xác nhận xóa tour này?")) return;
    try {
      await http.delete(`${API.tours}/${id}`);
      showToast("Đã xóa tour", "success");
      loadTours();
    } catch (err) {
      showToast("Xóa thất bại", "danger");
    }
  };

  $("#tour-form").on("submit", async (e) => {
    e.preventDefault();
    const data = {
      title: $("#tour-form-title").val().trim(),
      destination: $("#tour-form-destination").val().trim(),
      price: Number($("#tour-form-price").val()) || 0,
      duration: Number($("#tour-form-duration").val()) || 0,
      image: $("#tour-form-image").val().trim() || undefined,
      description: $("#tour-form-description").val().trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingId) {
        await http.put(`${API.tours}/${editingId}`, data);
        showToast("Đã cập nhật tour", "success");
      } else {
        await http.post(API.tours, data);
        showToast("Đã thêm tour", "success");
      }
      bootstrap.Modal.getInstance(document.getElementById("tour-modal")).hide();
      editingId = null;
      $("#tour-form")[0].reset();
      loadTours();
    } catch (err) {
      showToast("Thao tác thất bại", "danger");
    }
  });

  $("#btn-add-tour").on("click", () => {
    editingId = null;
    $("#tour-form")[0].reset();
    new bootstrap.Modal(document.getElementById("tour-modal")).show();
  });

  $(function () {
    loadTours();
    loadAvailableImages();
  });
})();


