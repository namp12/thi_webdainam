/**
 * Admin Image Manager
 * Quản lý và chọn ảnh cho từng tour
 */

(function() {
  const { API } = window.APP_CONFIG;
  const { http, showToast } = window.APP_UTILS;

  let tours = [];
  let imageMapping = {};
  let availableImages = [];

  // Load tours từ API
  async function loadTours() {
    try {
      tours = await http.get(API.tours);
      await loadImageMapping();
      await loadAvailableImages();
      renderToursList();
    } catch (err) {
      showToast("Không tải được tours", "danger");
      console.error(err);
    }
  }

  // Load image mapping từ file JSON
  async function loadImageMapping() {
    try {
      const response = await fetch('data/image-mapping.json');
      const data = await response.json();
      imageMapping = data.mapping || {};
    } catch (err) {
      console.warn("Không tải được image-mapping.json", err);
      imageMapping = {};
    }
  }

  // Load danh sách ảnh có sẵn (giả lập - trong thực tế cần backend)
  async function loadAvailableImages() {
    // Danh sách ảnh mẫu - trong thực tế sẽ scan thư mục assets/img/tours/
    availableImages = [
      '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
      '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      'da-nang.jpg', 'sapa.jpg', 'phu-quoc.jpg', 'ha-long.jpg', 'nha-trang.jpg', 'da-lat.jpg',
      'hue.jpg', 'hoi-an.jpg', 'mai-chau.jpg', 'moc-chau.jpg'
    ];
  }

  // Render danh sách tours với dropdown chọn ảnh
  function renderToursList() {
    const $list = $("#tours-image-list");
    if (!tours.length) {
      $list.html('<div class="col-12 text-center text-muted py-5">Chưa có tour nào</div>');
      return;
    }

    const html = tours.map(tour => {
      const tourId = String(tour.id);
      const currentImage = imageMapping[tourId] || `${tour.id}.jpg`;
      const imageUrl = `assets/img/tours/${currentImage}`;

      // Tạo options cho dropdown
      const imageOptions = availableImages.map(img => {
        const selected = img === currentImage ? 'selected' : '';
        return `<option value="${img}" ${selected}>${img}</option>`;
      }).join('');

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 class="fw-bold mb-1">Tour #${tour.id}</h6>
                  <p class="text-muted small mb-0">${tour.title || 'Chưa có tên'}</p>
                  <p class="text-muted small mb-0">
                    <i class="bi bi-geo-alt"></i> ${tour.destination || 'Chưa có'}
                  </p>
                </div>
              </div>
              
              <!-- Preview ảnh hiện tại -->
              <div class="mb-3">
                <div class="position-relative" style="height: 150px; overflow: hidden; border-radius: 8px; background: #f5f5f5;">
                  <img src="${imageUrl}" 
                       alt="Tour ${tour.id}" 
                       class="w-100 h-100" 
                       style="object-fit: cover; cursor: pointer;"
                       onclick="previewImage('${imageUrl}')"
                       onerror="this.src='assets/img/banners/placeholder.jpg'">
                  <div class="position-absolute top-0 end-0 m-2">
                    <button class="btn btn-sm btn-light" onclick="previewImage('${imageUrl}')" title="Xem lớn">
                      <i class="bi bi-zoom-in"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Dropdown chọn ảnh -->
              <div class="mb-2">
                <label class="form-label small">Chọn ảnh:</label>
                <select class="form-select form-select-sm image-selector" data-tour-id="${tour.id}">
                  <option value="">-- Tự động (${tour.id}.jpg) --</option>
                  ${imageOptions}
                </select>
              </div>

              <!-- Thông tin ảnh -->
              <div class="small text-muted">
                <i class="bi bi-image"></i> 
                <span class="current-image-name">${currentImage}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $list.html(html);

    // Bind event cho dropdown
    $('.image-selector').on('change', function() {
      const tourId = $(this).data('tour-id');
      const selectedImage = $(this).val();
      
      if (selectedImage) {
        imageMapping[String(tourId)] = selectedImage;
      } else {
        delete imageMapping[String(tourId)];
      }

      // Update preview
      const $card = $(this).closest('.card');
      const imageUrl = selectedImage 
        ? `assets/img/tours/${selectedImage}` 
        : `assets/img/tours/${tourId}.jpg`;
      
      $card.find('img').attr('src', imageUrl);
      $card.find('.current-image-name').text(selectedImage || `${tourId}.jpg`);
      
      showToast(`Đã chọn ảnh cho tour #${tourId}`, "success");
    });
  }

  // Preview ảnh lớn
  window.previewImage = function(imageUrl) {
    $('#preview-image').attr('src', imageUrl);
    new bootstrap.Modal(document.getElementById('imagePreviewModal')).show();
  };

  // Lưu mapping vào file JSON
  async function saveMapping() {
    try {
      // Tạo object mapping mới
      const mappingData = {
        description: "Mapping ảnh cho tours - Cho phép chọn ảnh cụ thể cho từng tour thay vì tự động theo ID",
        mapping: imageMapping,
        instructions: {
          how_to_use: "1. Đặt ảnh vào thư mục assets/img/tours/ với tên file như trong mapping",
          example: "Tour ID 1 → da-nang.jpg → assets/img/tours/da-nang.jpg",
          update_mapping: "Sửa file này để thay đổi ảnh cho tour. Ví dụ: '1': 'my-custom-image.jpg'"
        }
      };

      // Trong môi trường thực tế, cần gửi lên server để lưu file
      // Ở đây chúng ta sẽ download file JSON để user copy vào thư mục
      const jsonStr = JSON.stringify(mappingData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-mapping.json';
      a.click();
      URL.revokeObjectURL(url);

      showToast("Đã tải file mapping.json. Vui lòng copy vào thư mục data/", "success");
      
      // Hướng dẫn
      setTimeout(() => {
        alert(`Hướng dẫn:\n\n1. File image-mapping.json đã được tải về\n2. Copy file vào: project/data/image-mapping.json\n3. Refresh trang để áp dụng thay đổi`);
      }, 500);

    } catch (err) {
      showToast("Lưu mapping thất bại", "danger");
      console.error(err);
    }
  }

  // Upload ảnh (giả lập - trong thực tế cần backend)
  function handleUpload() {
    const fileInput = document.getElementById('image-upload');
    const files = fileInput.files;
    
    if (!files.length) {
      showToast("Vui lòng chọn file ảnh", "warning");
      return;
    }

    // Trong môi trường thực tế, cần upload lên server
    // Ở đây chỉ hiển thị hướng dẫn
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    showToast(`Đã chọn ${files.length} file: ${fileNames}`, "info");
    
    alert(`Hướng dẫn upload ảnh:\n\n1. Copy các file ảnh vào thư mục:\n   project/assets/img/tours/\n\n2. Tên file: ${fileNames}\n\n3. Sau khi copy xong, refresh trang này để thấy ảnh mới trong danh sách`);
    
    fileInput.value = '';
  }

  // Event handlers
  $('#btn-save-mapping').on('click', saveMapping);
  $('#btn-upload').on('click', handleUpload);

  // Load data khi trang sẵn sàng
  $(function() {
    loadTours();
  });
})();


