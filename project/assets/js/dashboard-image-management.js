/**
 * Dashboard Image Management
 * Tích hợp quản lý ảnh tours và điểm đến nổi bật vào dashboard
 */

(function() {
  const { API } = window.APP_CONFIG;
  const { http, showToast } = window.APP_UTILS;

  // ========== TOURS IMAGES MANAGEMENT ==========
  let tours = [];
  let imageMapping = {};
  let availableImages = [];

  // Load tours từ API - Đảm bảo load tất cả tours mới nhất từ API
  async function loadTours() {
    try {
      // Load tours từ API - LUÔN LUÔN load mới nhất
      tours = await http.get(API.tours);
      console.log(`✅ Đã load ${tours.length} tours từ API (bao gồm tours mới)`);
      
      // Load image mapping từ tours (lấy từ tour.image trong API)
      await loadImageMapping();
      
      // Load danh sách ảnh có sẵn
      await loadAvailableImages();
      
      // Render danh sách
      renderToursList();
      
      console.log(`✅ Đã render ${tours.length} tours với ảnh từ API`);
    } catch (err) {
      showToast("Không tải được tours từ API: " + err.message, "danger");
      console.error("❌ Lỗi khi load tours:", err);
    }
  }

  // Load image mapping từ API tours (lấy từ tour.image)
  async function loadImageMapping() {
    try {
      // Lấy image từ tour.image trong API
      if (tours && tours.length) {
        tours.forEach(tour => {
          const tourId = String(tour.id);
          // Nếu tour có image trong API, lưu vào mapping
          if (tour.image) {
            // Nếu là local path (assets/img/tours/...), lấy tên file
            if (tour.image.includes('assets/img/tours/')) {
              const imageName = tour.image.replace('assets/img/tours/', '');
              imageMapping[tourId] = imageName;
            } else if (tour.image.includes('/tours/')) {
              // Nếu có /tours/ trong path, lấy phần sau
              const parts = tour.image.split('/tours/');
              if (parts.length > 1) {
                imageMapping[tourId] = parts[1];
              }
            }
          }
        });
      }
      console.log("✅ Đã load image mapping từ API:", imageMapping);
    } catch (err) {
      console.warn("Không tải được image mapping từ API", err);
      imageMapping = {};
    }
  }

  // Load danh sách ảnh có sẵn
  async function loadAvailableImages() {
    availableImages = [
      '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
      '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      'da-nang.jpg', 'sapa.jpg', 'phu-quoc.jpg', 'ha-long.jpg', 'nha-trang.jpg', 'da-lat.jpg',
      'hue.jpg', 'hoi-an.jpg', 'mai-chau.jpg', 'moc-chau.jpg'
    ];
  }

  // Render danh sách tours với dropdown chọn ảnh
  function renderToursList() {
    const $list = $("#dashboard-tours-image-list");
    if (!$list.length) return;

    if (!tours.length) {
      $list.html('<div class="col-12 text-center py-4 text-muted">Không có tour nào</div>');
      return;
    }

    const html = tours.map(tour => {
      const tourId = String(tour.id);
      // Ưu tiên lấy từ imageMapping (đã load từ API), sau đó từ tour.image, cuối cùng là auto
      let currentImage = imageMapping[tourId];
      
      if (!currentImage && tour.image) {
        // Nếu tour.image có trong API, extract tên file
        if (tour.image.includes('assets/img/tours/')) {
          currentImage = tour.image.replace('assets/img/tours/', '');
        } else if (tour.image.includes('/tours/')) {
          const parts = tour.image.split('/tours/');
          if (parts.length > 1) {
            currentImage = parts[1];
          }
        }
      }
      
      // Nếu vẫn không có, dùng auto
      if (!currentImage) {
        currentImage = `${tour.id}.jpg`;
      }
      
      const imagePath = `assets/img/tours/${currentImage}`;

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card border h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-start gap-3">
                <div class="flex-shrink-0">
                  <img src="${imagePath}" 
                       alt="${tour.title}" 
                       class="rounded" 
                       style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;"
                       onerror="this.onerror=null; this.src='assets/img/banners/placeholder.jpg';"
                       onclick="window.open('${imagePath}', '_blank')">
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-1 small fw-bold">${tour.title || 'Tour #' + tour.id}</h6>
                  <p class="mb-1 text-muted small" style="font-size: 0.7rem;">
                    <i class="bi bi-geo-alt"></i> ${tour.destination || 'Chưa có'}
                  </p>
                  <p class="mb-2 text-muted small" style="font-size: 0.65rem;">ID: ${tour.id}</p>
                  <select class="form-select form-select-sm image-select" data-tour-id="${tourId}">
                    <option value="">-- Tự động (${tour.id}.jpg) --</option>
                    ${availableImages.map(img => 
                      `<option value="${img}" ${currentImage === img ? 'selected' : ''}>${img}</option>`
                    ).join('')}
                  </select>
                  <small class="text-muted d-block mt-1" style="font-size: 0.65rem;">
                    <i class="bi bi-image"></i> ${currentImage}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $list.html(html);

    // Event handler cho dropdown
    $list.on('change', '.image-select', async function() {
      const tourId = $(this).data('tour-id');
      const selectedImage = $(this).val();
      const $card = $(this).closest('.card');
      const $img = $card.find('img');
      const $small = $card.find('small');
      
      // Tìm tour object
      const tour = tours.find(t => String(t.id) === String(tourId));
      if (!tour) {
        showToast("Không tìm thấy tour", "danger");
        return;
      }
      
      try {
        // Cập nhật image trong tour object
        if (selectedImage) {
          tour.image = `assets/img/tours/${selectedImage}`;
          imageMapping[tourId] = selectedImage;
        } else {
          // Nếu chọn "Tự động", xóa image mapping (để dùng auto-detect)
          delete tour.image;
          delete imageMapping[tourId];
        }
        
        // Update vào API - ĐẢM BẢO API CÓ DỮ LIỆU MỚI
        await http.put(`${API.tours}/${tourId}`, tour);
        
        // Reload tour từ API để đảm bảo đồng bộ
        const updatedTour = await http.get(`${API.tours}/${tourId}`);
        const tourIndex = tours.findIndex(t => String(t.id) === String(tourId));
        if (tourIndex >= 0) {
          tours[tourIndex] = updatedTour;
        }
        
        // Cập nhật preview UI
        const imagePath = selectedImage 
          ? `assets/img/tours/${selectedImage}` 
          : `assets/img/tours/${tourId}.jpg`;
        $img.attr('src', imagePath);
        $small.html(`<i class="bi bi-image"></i> ${selectedImage || `${tourId}.jpg`}`);
        
        showToast(`Đã cập nhật ảnh cho tour #${tourId}. Index.html sẽ hiển thị ảnh mới khi reload.`, "success");
        console.log(`✅ Đã cập nhật tour ${tourId} image trong API:`, updatedTour.image);
        
        // Trigger event để các trang khác biết có thay đổi
        $(document).trigger('tourImageUpdated', { tourId, image: updatedTour.image });
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật tour image:", err);
        showToast("Lỗi khi cập nhật ảnh: " + err.message, "danger");
      }
    });
  }

  // Save image mapping - Cập nhật tất cả tours vào API
  async function saveImageMapping() {
    try {
      if (!tours.length) {
        showToast("Không có tour nào để lưu", "warning");
        return;
      }
      
      showToast("Đang cập nhật ảnh cho tất cả tours vào API...", "info");
      
      // Cập nhật tất cả tours có image mapping
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const [tourId, imageName] of Object.entries(imageMapping)) {
        try {
          const tour = tours.find(t => String(t.id) === String(tourId));
          if (tour) {
            tour.image = `assets/img/tours/${imageName}`;
            // Update vào API
            await http.put(`${API.tours}/${tourId}`, tour);
            
            // Reload từ API để đảm bảo đồng bộ
            const updatedTour = await http.get(`${API.tours}/${tourId}`);
            const tourIndex = tours.findIndex(t => String(t.id) === String(tourId));
            if (tourIndex >= 0) {
              tours[tourIndex] = updatedTour;
            }
            
            updatedCount++;
            console.log(`✅ Đã cập nhật tour ${tourId} với ảnh: ${imageName}`, updatedTour.image);
          }
        } catch (err) {
          errorCount++;
          console.error(`❌ Lỗi khi cập nhật tour ${tourId}:`, err);
        }
      }
      
      // Reload danh sách tours để đảm bảo đồng bộ
      await loadTours();
      
      if (updatedCount > 0) {
        showToast(`Đã cập nhật ${updatedCount} tour${updatedCount > 1 ? 's' : ''} vào API. Index.html sẽ hiển thị ảnh mới khi reload.${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`, "success");
        
        // Trigger event để các trang khác biết có thay đổi
        $(document).trigger('toursImagesUpdated', { updatedCount });
      } else {
        showToast("Không có thay đổi nào để lưu", "info");
      }
    } catch (err) {
      showToast("Lỗi khi lưu mapping: " + err.message, "danger");
      console.error(err);
    }
  }

  // ========== DESTINATIONS MANAGEMENT ==========
  let destinations = [];
  let editingIndex = -1;

  // Load danh sách ảnh có sẵn cho destinations
  async function loadDestinationsImages() {
    const availableImages = [
      '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
      '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      'da-nang.jpg', 'sapa.jpg', 'phu-quoc.jpg', 'ha-long.jpg', 'nha-trang.jpg', 'da-lat.jpg',
      'hue.jpg', 'hoi-an.jpg', 'mai-chau.jpg', 'moc-chau.jpg'
    ];
    
    const $select = $("#dashboard-dest-image-select");
    $select.html('<option value="">-- Chọn ảnh từ danh sách --</option>');
    availableImages.forEach(img => {
      $select.append(`<option value="assets/img/tours/${img}">${img}</option>`);
    });
  }

  // Load destinations từ file JSON
  async function loadDestinations() {
    try {
      const response = await fetch('data/destinations-custom.json');
      const data = await response.json();
      destinations = data.destinations || [];
      renderDestinationsList();
    } catch (err) {
      console.warn("Không tải được destinations-custom.json", err);
      destinations = [];
      renderDestinationsList();
    }
  }

  // Render danh sách destinations
  function renderDestinationsList() {
    const $list = $("#dashboard-destinations-list");
    if (!$list.length) return;

    if (!destinations.length) {
      $list.html('<div class="col-12 text-center py-4 text-muted">Chưa có điểm đến nào. Hãy thêm điểm đến mới!</div>');
      return;
    }

    const html = destinations.map((dest, index) => {
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card border h-100">
            <div class="card-body p-3">
              <img src="${dest.image}" 
                   alt="${dest.name}" 
                   class="img-fluid rounded mb-2" 
                   style="height: 120px; width: 100%; object-fit: cover; cursor: pointer;"
                   onerror="this.onerror=null; this.src='${dest.fallbackImage || 'assets/img/banners/placeholder.jpg'}';"
                   onclick="window.open('${dest.image}', '_blank')">
              <h6 class="mb-1 small fw-bold">${dest.name}</h6>
              <p class="mb-1 text-muted small">${dest.theme || 'Du lịch'}</p>
              <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-outline-primary flex-fill" onclick="dashboardEditDestination(${index})">
                  <i class="bi bi-pencil"></i> Sửa
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="dashboardDeleteDestination(${index})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $list.html(html);
  }

  // Edit destination
  window.dashboardEditDestination = function(index) {
    editingIndex = index;
    const dest = destinations[index];
    
    $("#dashboard-dest-edit-index").val(index);
    $("#dashboard-dest-name").val(dest.name);
    $("#dashboard-dest-theme").val(dest.theme || 'Du lịch');
    $("#dashboard-dest-image").val(dest.image);
    $("#dashboard-dest-fallback").val(dest.fallbackImage || '');
    $("#dashboard-dest-link").val(dest.link || '');
    
    // Preview image
    updateDestinationPreview(dest.image);
    
    // Show form
    $("#dashboard-dest-form-card").slideDown();
    $("#dashboard-form-title").text("Sửa Điểm Đến");
    
    // Scroll to form
    $('html, body').animate({
      scrollTop: $("#dashboard-dest-form-card").offset().top - 100
    }, 300);
  };

  // Delete destination
  window.dashboardDeleteDestination = function(index) {
    if (!confirm("Bạn có chắc muốn xóa điểm đến này?")) return;
    
    destinations.splice(index, 1);
    renderDestinationsList();
    showToast("Đã xóa điểm đến", "success");
  };

  // Update destination preview
  function updateDestinationPreview(imagePath) {
    const $preview = $("#dashboard-dest-preview");
    const $placeholder = $("#dashboard-dest-preview-placeholder");
    
    if (imagePath) {
      $preview.attr('src', imagePath);
      $preview.show();
      $placeholder.hide();
    } else {
      $preview.hide();
      $placeholder.show();
    }
  }

  // Save destinations
  async function saveDestinations() {
    try {
      if (destinations.length > 6) {
        showToast("Tối đa 6 điểm đến", "warning");
        return;
      }

      const data = {
        description: "Danh sách điểm đến nổi bật - HOÀN TOÀN ĐỘC LẬP, chỉ sử dụng ảnh local từ thư mục img, KHÔNG phụ thuộc vào API",
        destinations: destinations,
        instructions: {
          note: "Phần này HOÀN TOÀN ĐỘC LẬP, chỉ sử dụng ảnh local từ assets/img/tours/ và assets/img/banners/, KHÔNG phụ thuộc vào API",
          how_to_use: "1. Thêm/sửa/xóa destinations trong mảng này qua Admin Panel (admin-destinations.html)",
          image_path: "Ảnh phải đặt trong assets/img/tours/ hoặc assets/img/banners/",
          update: "Sau khi sửa, refresh trang index.html để thấy thay đổi",
          admin: "Quản lý tại: admin-destinations.html hoặc dashboard"
        }
      };

      // Trong thực tế, cần gửi lên server để lưu
      console.log("Destinations to save:", data);
      showToast("Đã lưu destinations (trong thực tế cần backend để lưu file)", "success");
      
      // Giả lập: lưu vào localStorage để demo
      localStorage.setItem('destinations_custom_demo', JSON.stringify(data));
    } catch (err) {
      showToast("Lỗi khi lưu destinations: " + err.message, "danger");
      console.error(err);
    }
  }

  // Initialize
  $(function() {
    // Load tours images khi tab được click
    $("#tab-tours-images").on('shown.bs.tab', function() {
      if (tours.length === 0) {
        loadTours();
      }
    });

    // Load destinations khi tab được click
    $("#tab-destinations").on('shown.bs.tab', function() {
      if (destinations.length === 0) {
        loadDestinations();
        loadDestinationsImages();
      }
    });

    // Load ngay lập tức nếu tab đầu tiên active
    if ($("#tab-tours-images").hasClass('active')) {
      loadTours();
    }

    // Save tours mapping
    $("#btn-save-tours-mapping").on('click', saveImageMapping);

    // Destinations form handlers
    $("#dashboard-dest-image-select").on('change', function() {
      const selected = $(this).val();
      if (selected) {
        $("#dashboard-dest-image").val(selected);
        updateDestinationPreview(selected);
      }
    });

    $("#dashboard-dest-image").on('input', function() {
      const imagePath = $(this).val();
      if (imagePath) {
        updateDestinationPreview(imagePath);
      }
    });

    // Add destination
    $("#btn-dashboard-add-dest").on('click', function() {
      editingIndex = -1;
      $("#dashboard-dest-form")[0].reset();
      $("#dashboard-dest-edit-index").val('');
      $("#dashboard-dest-preview").hide();
      $("#dashboard-dest-preview-placeholder").show();
      $("#dashboard-form-title").text("Thêm Điểm Đến Mới");
      $("#dashboard-dest-form-card").slideDown();
    });

    // Cancel form
    $("#btn-dashboard-cancel-form").on('click', function() {
      $("#dashboard-dest-form-card").slideUp();
      $("#dashboard-dest-form")[0].reset();
    });

    // Submit form
    $("#dashboard-dest-form").on('submit', function(e) {
      e.preventDefault();
      
      const name = $("#dashboard-dest-name").val().trim();
      const theme = $("#dashboard-dest-theme").val();
      const image = $("#dashboard-dest-image").val().trim();
      const fallback = $("#dashboard-dest-fallback").val().trim();
      const link = $("#dashboard-dest-link").val().trim();

      if (!name || !image) {
        showToast("Vui lòng điền đầy đủ thông tin", "warning");
        return;
      }

      if (destinations.length >= 6 && editingIndex === -1) {
        showToast("Tối đa 6 điểm đến", "warning");
        return;
      }

      const destData = {
        name: name,
        image: image,
        fallbackImage: fallback || 'assets/img/banners/banner.jpg',
        theme: theme,
        link: link || `tours.html?destination=${encodeURIComponent(name)}`
      };

      if (editingIndex >= 0) {
        destinations[editingIndex] = destData;
        showToast("Đã cập nhật điểm đến", "success");
      } else {
        destinations.push(destData);
        showToast("Đã thêm điểm đến", "success");
      }

      renderDestinationsList();
      $("#dashboard-dest-form-card").slideUp();
      $("#dashboard-dest-form")[0].reset();
    });

    // Save destinations
    $("#btn-dashboard-save-destinations").on('click', saveDestinations);
  });
})();

