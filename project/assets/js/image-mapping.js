/**
 * Image Mapping Manager
 * Quản lý mapping ảnh cho tours - Cho phép chọn ảnh cụ thể cho từng tour
 */

(function() {
  let imageMapping = {};
  let mappingLoaded = false;

  /**
   * Load image mapping từ file JSON
   */
  async function loadImageMapping() {
    if (mappingLoaded) return imageMapping;
    
    try {
      const response = await fetch('data/image-mapping.json');
      const data = await response.json();
      imageMapping = data.mapping || {};
      mappingLoaded = true;
      console.log('Image mapping loaded:', imageMapping);
    } catch (err) {
      console.warn("Không tải được image-mapping.json, sử dụng mapping mặc định", err);
      imageMapping = {};
      mappingLoaded = true;
    }
    
    return imageMapping;
  }

  /**
   * Lấy ảnh cho tour - ƯU TIÊN tour.image từ API, sau đó mới đến mapping file
   * @param {Object} tour - Tour object có id và image
   * @returns {string} Đường dẫn ảnh
   */
  function getTourImage(tour) {
    const tourId = String(tour.id);
    
    // 1. ƯU TIÊN NHẤT: Ảnh từ API (tour.image) - đảm bảo đồng bộ với quản lý hình ảnh
    if (tour.image && tour.image.startsWith('assets/img/')) {
      return tour.image;
    }
    
    // 2. Fallback: Ảnh từ mapping file JSON (nếu có)
    if (imageMapping[tourId]) {
      return `assets/img/tours/${imageMapping[tourId]}`;
    }
    
    // 3. Fallback: Auto-detect theo ID (1.jpg, 2.jpg...)
    return `assets/img/tours/${tour.id}.jpg`;
  }

  /**
   * Lấy fallback image khi ảnh chính không load được
   * @param {Object} tour - Tour object có image
   * @returns {string} Đường dẫn ảnh fallback
   */
  function getTourFallbackImage(tour) {
    // Nếu có ảnh từ JSON (URL external), dùng nó
    if (tour.image && !tour.image.startsWith('assets/img/')) {
      return tour.image;
    }
    // Nếu không, dùng placeholder
    return 'assets/img/banners/placeholder.jpg';
  }

  /**
   * Cập nhật mapping cho một tour
   * @param {string|number} tourId - ID của tour
   * @param {string} imageName - Tên file ảnh (ví dụ: "da-nang.jpg")
   */
  function setTourImageMapping(tourId, imageName) {
    imageMapping[String(tourId)] = imageName;
  }

  /**
   * Lấy mapping hiện tại
   * @returns {Object} Mapping object
   */
  function getImageMapping() {
    return { ...imageMapping };
  }

  // Export to global
  window.IMAGE_MAPPING = {
    load: loadImageMapping,
    getTourImage: getTourImage,
    getTourFallbackImage: getTourFallbackImage,
    setTourImageMapping: setTourImageMapping,
    getImageMapping: getImageMapping
  };
})();


