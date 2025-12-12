/**
 * Admin Destinations Manager
 * Quản lý danh sách "Điểm đến nổi bật" với ảnh tùy chỉnh
 */

(function() {
  const { showToast } = window.APP_UTILS;

  let destinations = [];
  let availableImages = [];
  let editingIndex = -1;

  // Load danh sách ảnh có sẵn - kiểm tra tồn tại trước khi thêm
  async function loadAvailableImages() {
    try {
      // Danh sách ảnh thực tế có trong thư mục (từ 4-52, bỏ các số không có)
      const imageList = [
        '4.jpg', '5.jpg', '6.jpg', '7.jpg', '9.jpg', '10.jpg',
        '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', 
        '20.jpg', '21.jpg', '22.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', 
        '29.jpg', '30.jpg', '31.jpg', '32.jpg', '33.jpg', '34.jpg', '35.jpg', '36.jpg', 
        '37.jpg', '38.jpg', '39.jpg', '40.jpg', '41.jpg', '42.jpg', '43.jpg', '44.jpg', 
        '45.jpg', '46.jpg', '47.jpg', '48.jpg', '49.jpg', '50.jpg', '51.jpg', '52.jpg'
      ];
      
      // Thêm ảnh từ banners
      const bannerImages = ['banner.jpg'];
      
      // Kiểm tra và thêm chỉ những ảnh tồn tại
      availableImages = [];
      const $select = $("#dest-image-select");
      $select.html('<option value="">-- Chọn ảnh từ danh sách --</option>');
      
      // Thêm tất cả ảnh vào dropdown ngay (không cần kiểm tra từng cái - sẽ kiểm tra khi preview)
      // Điều này giúp dropdown load nhanh hơn
      imageList.forEach(img => {
        const imagePath = `assets/img/tours/${img}`;
        availableImages.push(img);
        $select.append(`<option value="${imagePath}">${img}</option>`);
      });
      
      // Thêm ảnh từ banners
      bannerImages.forEach(img => {
        const imagePath = `assets/img/banners/${img}`;
        availableImages.push(`banners/${img}`);
        $select.append(`<option value="${imagePath}">${img} (banner)</option>`);
      });
      
      // Thêm option để nhập thủ công
      $select.append(`<option value="__manual__">-- Nhập đường dẫn thủ công --</option>`);
      
      console.log(`✅ Đã load ${availableImages.length} ảnh có sẵn`);
    } catch (err) {
      console.warn("Không load được danh sách ảnh", err);
      // Fallback: thêm ít nhất một số ảnh cơ bản
      const $select = $("#dest-image-select");
      $select.html('<option value="">-- Chọn ảnh từ danh sách --</option>');
      ['10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg'].forEach(img => {
        $select.append(`<option value="assets/img/tours/${img}">${img}</option>`);
      });
      $select.append(`<option value="__manual__">-- Nhập đường dẫn thủ công --</option>`);
    }
  }

  // Load destinations từ file JSON
  async function loadDestinations() {
    try {
      const response = await fetch('data/destinations-custom.json');
      const data = await response.json();
      destinations = data.destinations || [];
      renderDestinationsList();
    } catch (err) {
      console.warn("Không tải được destinations-custom.json, tạo mới", err);
      destinations = [];
      renderDestinationsList();
    }
  }

  // Render danh sách destinations
  function renderDestinationsList() {
    const $list = $("#destinations-list");
    
    if (!destinations.length) {
      $list.html(`
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-inbox" style="font-size: 3rem;"></i>
          <p class="mt-3">Chưa có điểm đến nào. Click "Thêm Điểm Đến" để bắt đầu.</p>
        </div>
      `);
      return;
    }

    const html = destinations.map((dest, index) => {
      const imageUrl = dest.image || dest.fallbackImage || 'assets/img/banners/placeholder.jpg';
      
      return `
        <div class="col-md-6 col-lg-4">
          <div class="dest-card-admin" data-index="${index}">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="fw-bold mb-1">${dest.name}</h6>
                <span class="badge bg-primary">${dest.theme || 'Du lịch'}</span>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editDestination(${index})" title="Sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="deleteDestination(${index})" title="Xóa">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="mb-2">
              <img src="${imageUrl}" 
                   alt="${dest.name}" 
                   class="dest-preview w-100"
                   onclick="previewImage('${imageUrl}')"
                   onerror="this.src='assets/img/banners/placeholder.jpg'">
            </div>
            
            <div class="small text-muted">
              <div><i class="bi bi-image"></i> ${dest.image || 'Chưa có ảnh'}</div>
              ${dest.link ? `<div><i class="bi bi-link-45deg"></i> ${dest.link}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    $list.html(html);
  }

  // Thêm destination mới
  window.addDestination = function() {
    editingIndex = -1;
    resetForm();
    $("#form-title").text("Thêm Điểm Đến Mới");
    $("#dest-form-card").slideDown();
    $("#dest-form")[0].scrollIntoView({ behavior: 'smooth' });
  };

  // Sửa destination
  window.editDestination = function(index) {
    if (index < 0 || index >= destinations.length) return;
    
    editingIndex = index;
    const dest = destinations[index];
    
    $("#dest-edit-index").val(index);
    $("#dest-name").val(dest.name || '');
    $("#dest-theme").val(dest.theme || 'Du lịch');
    $("#dest-image").val(dest.image || '');
    $("#dest-image-select").val(dest.image || '');
    $("#dest-fallback").val(dest.fallbackImage || '');
    $("#dest-link").val(dest.link || '');
    
    updatePreview(dest.image || dest.fallbackImage);
    
    $("#form-title").text(`Sửa: ${dest.name}`);
    $("#dest-form-card").slideDown();
    $("#dest-form")[0].scrollIntoView({ behavior: 'smooth' });
  };

  // Xóa destination
  window.deleteDestination = function(index) {
    if (index < 0 || index >= destinations.length) return;
    
    if (!confirm(`Bạn có chắc muốn xóa "${destinations[index].name}"?`)) return;
    
    destinations.splice(index, 1);
    renderDestinationsList();
    showToast("Đã xóa điểm đến", "success");
  };

  // Reset form
  function resetForm() {
    $("#dest-form")[0].reset();
    $("#dest-edit-index").val('');
    $("#dest-preview").hide();
    $("#dest-preview-placeholder").show();
    editingIndex = -1;
  }

  // Update preview ảnh với xử lý lỗi
  function updatePreview(imageUrl) {
    if (!imageUrl) {
      $("#dest-preview").hide();
      $("#dest-preview-placeholder").show();
      return;
    }
    
    const $preview = $("#dest-preview");
    const $placeholder = $("#dest-preview-placeholder");
    
    // Hiển thị preview và ẩn placeholder
    $preview.show();
    $placeholder.hide();
    
    // Tạo ảnh mới để kiểm tra tồn tại
    const img = new Image();
    
    img.onload = function() {
      // Ảnh tồn tại, cập nhật src
      $preview.attr('src', imageUrl);
      $preview.css('opacity', '1');
      $preview.off('error');
    };
    
    img.onerror = function() {
      // Ảnh không tồn tại, hiển thị placeholder và cảnh báo
      $preview.hide();
      $placeholder.show();
      $placeholder.html(`
        <div class="text-center text-muted p-4">
          <i class="bi bi-image" style="font-size: 3rem;"></i>
          <p class="mt-2 mb-0">Ảnh không tìm thấy</p>
          <small>Vui lòng kiểm tra lại đường dẫn</small>
        </div>
      `);
      showToast("Ảnh không tồn tại, vui lòng kiểm tra đường dẫn", "warning", 3000);
    };
    
    // Bắt đầu load ảnh
    img.src = imageUrl;
    
    // Cập nhật src ngay để hiển thị (sẽ được thay thế khi load xong)
    $preview.attr('src', imageUrl);
    $preview.css('opacity', '0.5'); // Mờ đi khi đang load
  }

  // Preview ảnh lớn
  window.previewImage = function(imageUrl) {
    $('#preview-image').attr('src', imageUrl);
    new bootstrap.Modal(document.getElementById('imagePreviewModal')).show();
  };

  // Submit form
  $("#dest-form").on('submit', function(e) {
    e.preventDefault();
    
    const name = $("#dest-name").val().trim();
    const image = $("#dest-image").val().trim();
    const theme = $("#dest-theme").val();
    const fallback = $("#dest-fallback").val().trim();
    const link = $("#dest-link").val().trim();
    
    if (!name || !image) {
      showToast("Vui lòng điền đầy đủ tên và ảnh", "warning");
      return;
    }

    // Kiểm tra số lượng (tối đa 6)
    if (editingIndex === -1 && destinations.length >= 6) {
      showToast("Chỉ được thêm tối đa 6 điểm đến", "warning");
      return;
    }

    const destData = {
      name: name,
      image: image,
      fallbackImage: fallback || image,
      theme: theme,
      tourId: null,
      link: link || `tours.html?destination=${encodeURIComponent(name)}`
    };

    if (editingIndex >= 0) {
      // Sửa
      destinations[editingIndex] = destData;
      showToast(`Đã cập nhật "${name}"`, "success");
    } else {
      // Thêm mới
      destinations.push(destData);
      showToast(`Đã thêm "${name}"`, "success");
    }

    renderDestinationsList();
    resetForm();
    $("#dest-form-card").slideUp();
  });

  // Bind events
  $("#btn-add-dest").on('click', addDestination);
  $("#btn-cancel-form").on('click', function() {
    resetForm();
    $("#dest-form-card").slideUp();
  });

  // Khi chọn ảnh từ dropdown
  $("#dest-image-select").on('change', function() {
    const selected = $(this).val();
    if (selected === '__manual__') {
      // Cho phép nhập thủ công
      $("#dest-image").val('').focus();
      $("#dest-image").attr('placeholder', 'Nhập đường dẫn ảnh, ví dụ: assets/img/tours/10.jpg');
      showToast("Bạn có thể nhập đường dẫn ảnh thủ công", "info", 2000);
    } else if (selected) {
      $("#dest-image").val(selected);
      $("#dest-image").attr('placeholder', 'assets/img/tours/da-nang.jpg');
      updatePreview(selected);
    } else {
      $("#dest-image").val('');
      $("#dest-image").attr('placeholder', 'assets/img/tours/da-nang.jpg');
    }
  });

  // Khi nhập đường dẫn ảnh thủ công - với debounce
  let previewTimeout;
  $("#dest-image").on('input', function() {
    const imageUrl = $(this).val().trim();
    
    // Clear timeout trước đó
    clearTimeout(previewTimeout);
    
    if (!imageUrl) {
      $("#dest-preview").hide();
      $("#dest-preview-placeholder").show();
      return;
    }
    
    // Debounce: đợi 500ms sau khi người dùng ngừng gõ
    previewTimeout = setTimeout(() => {
      updatePreview(imageUrl);
    }, 500);
  });
  
  // Khi blur (rời khỏi input), kiểm tra ngay
  $("#dest-image").on('blur', function() {
    clearTimeout(previewTimeout);
    const imageUrl = $(this).val().trim();
    if (imageUrl) {
      updatePreview(imageUrl);
    }
  });

  // Lưu tất cả destinations
  $("#btn-save-destinations").on('click', function() {
    if (destinations.length === 0) {
      showToast("Chưa có điểm đến nào để lưu", "warning");
      return;
    }

    // Tạo object data
    const data = {
      description: "Danh sách điểm đến nổi bật tùy chỉnh - Cho phép tự chọn ảnh và thông tin cho từng destination",
      destinations: destinations,
      instructions: {
        how_to_use: "1. Thêm/sửa/xóa destinations trong mảng này",
        image_path: "Ảnh nên đặt trong assets/img/tours/ hoặc assets/img/banners/",
        update: "Sau khi sửa, refresh trang index.html để thấy thay đổi"
      }
    };

    // Download file JSON
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'destinations-custom.json';
    a.click();
    URL.revokeObjectURL(url);

    showToast("Đã tải file destinations-custom.json. Vui lòng copy vào thư mục data/", "success");
    
    setTimeout(() => {
      alert(`Hướng dẫn:\n\n1. File destinations-custom.json đã được tải về\n2. Copy file vào: project/data/destinations-custom.json\n3. Refresh trang index.html để thấy thay đổi`);
    }, 500);
  });

  // Load data khi trang sẵn sàng
  $(function() {
    loadAvailableImages();
    loadDestinations();
  });
})();

