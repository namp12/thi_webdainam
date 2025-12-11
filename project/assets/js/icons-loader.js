/**
 * Icons Loader
 * Tự động load Iconify và các icon packs miễn phí
 */

(function() {
  // Tải script Iconify
  if (!window.Iconify) {
    const script = document.createElement('script');
    script.src = 'https://code.iconify.design/3/iconify.min.js';
    script.async = true;
    document.head.appendChild(script);
  }

  // Icon packs miễn phí từ Iconify
  // Có thể sử dụng các packs sau:
  // - mdi: Material Design Icons (hơn 7000 icons)
  // - heroicons: Heroicons (hơn 400 icons)
  // - carbon: Carbon Design System (hơn 1000 icons)
  // - tabler: Tabler Icons (hơn 2000 icons)
  // - feather: Feather Icons (hơn 280 icons)
  // - fontisto: Fontisto (hơn 600 icons)
  // - remix: Remix Icon (hơn 2000 icons)
  // - bx: Boxicons (hơn 1500 icons)
  // - fa: Font Awesome (free icons)
  // - jam: Jam Icons (hơn 900 icons)
  
  // Hàm helper để sử dụng icon
  window.APP_ICONS = {
    /**
     * Render icon từ Iconify
     * @param {string} icon - Tên icon (định dạng: "pack:icon-name")
     * @param {object} options - Tùy chọn (width, height, color, class)
     * @returns {string} Chuỗi HTML
     */
    render: function(icon, options = {}) {
      const width = options.width || options.size || '1em';
      const height = options.height || options.size || '1em';
      const color = options.color || 'currentColor';
      const className = options.class || '';
      const style = options.style || '';
      
      return `<iconify-icon icon="${icon}" width="${width}" height="${height}" style="color: ${color}; ${style}" class="${className}"></iconify-icon>`;
    },
    
    /**
     * Các icon phổ biến (shortcuts)
     */
    icons: {
      // Du lịch & Du lịch
      airplane: 'mdi:airplane',
      hotel: 'mdi:hotel',
      map: 'mdi:map',
      mapMarker: 'mdi:map-marker',
      compass: 'mdi:compass',
      suitcase: 'mdi:suitcase',
      camera: 'mdi:camera',
      beach: 'mdi:beach',
      mountain: 'mdi:terrain',
      
      // Hành động
      heart: 'mdi:heart',
      heartOutline: 'mdi:heart-outline',
      cart: 'mdi:cart',
      cartPlus: 'mdi:cart-plus',
      eye: 'mdi:eye',
      search: 'mdi:magnify',
      star: 'mdi:star',
      starOutline: 'mdi:star-outline',
      
      // Giao tiếp
      phone: 'mdi:phone',
      email: 'mdi:email',
      message: 'mdi:message',
      chat: 'mdi:chat',
      
      // Phần tử UI
      menu: 'mdi:menu',
      close: 'mdi:close',
      check: 'mdi:check',
      plus: 'mdi:plus',
      minus: 'mdi:minus',
      arrowRight: 'mdi:arrow-right',
      arrowLeft: 'mdi:arrow-left',
      arrowUp: 'mdi:arrow-up',
      arrowDown: 'mdi:arrow-down',
      
      // Mạng xã hội
      facebook: 'mdi:facebook',
      twitter: 'mdi:twitter',
      instagram: 'mdi:instagram',
      youtube: 'mdi:youtube',
      linkedin: 'mdi:linkedin',
      
      // Thanh toán & Tiền
      creditCard: 'mdi:credit-card',
      cash: 'mdi:cash',
      wallet: 'mdi:wallet',
      
      // Thời gian & Ngày
      clock: 'mdi:clock',
      calendar: 'mdi:calendar',
      calendarCheck: 'mdi:calendar-check',
      
      // Người dùng & Tài khoản
      user: 'mdi:account',
      userCircle: 'mdi:account-circle',
      login: 'mdi:login',
      logout: 'mdi:logout',
      settings: 'mdi:cog',
      
      // Trạng thái & Thông tin
      info: 'mdi:information',
      warning: 'mdi:alert',
      error: 'mdi:alert-circle',
      success: 'mdi:check-circle',
      
      // Điều hướng
      home: 'mdi:home',
      bookmark: 'mdi:bookmark',
      bookmarkOutline: 'mdi:bookmark-outline',
      filter: 'mdi:filter',
      sort: 'mdi:sort',
    }
  };
  
  // Chờ Iconify load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initIcons, 100);
    });
  } else {
    setTimeout(initIcons, 100);
  }
  
  function initIcons() {
    // Iconify đã sẵn sàng
    if (window.Iconify) {
      console.log('Iconify đã load thành công');
    }
  }
})();

