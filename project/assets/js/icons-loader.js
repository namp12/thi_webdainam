/**
 * Icons Loader
 * Tự động load Iconify và các icon packs miễn phí
 */

(function() {
  // Load Iconify script
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
  
  // Helper function để sử dụng icon
  window.APP_ICONS = {
    /**
     * Render icon từ Iconify
     * @param {string} icon - Icon name (format: "pack:icon-name")
     * @param {object} options - Options (width, height, color, class)
     * @returns {string} HTML string
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
     * Popular icon shortcuts
     */
    icons: {
      // Travel & Tourism
      airplane: 'mdi:airplane',
      hotel: 'mdi:hotel',
      map: 'mdi:map',
      mapMarker: 'mdi:map-marker',
      compass: 'mdi:compass',
      suitcase: 'mdi:suitcase',
      camera: 'mdi:camera',
      beach: 'mdi:beach',
      mountain: 'mdi:terrain',
      
      // Actions
      heart: 'mdi:heart',
      heartOutline: 'mdi:heart-outline',
      cart: 'mdi:cart',
      cartPlus: 'mdi:cart-plus',
      eye: 'mdi:eye',
      search: 'mdi:magnify',
      star: 'mdi:star',
      starOutline: 'mdi:star-outline',
      
      // Communication
      phone: 'mdi:phone',
      email: 'mdi:email',
      message: 'mdi:message',
      chat: 'mdi:chat',
      
      // UI Elements
      menu: 'mdi:menu',
      close: 'mdi:close',
      check: 'mdi:check',
      plus: 'mdi:plus',
      minus: 'mdi:minus',
      arrowRight: 'mdi:arrow-right',
      arrowLeft: 'mdi:arrow-left',
      arrowUp: 'mdi:arrow-up',
      arrowDown: 'mdi:arrow-down',
      
      // Social Media
      facebook: 'mdi:facebook',
      twitter: 'mdi:twitter',
      instagram: 'mdi:instagram',
      youtube: 'mdi:youtube',
      linkedin: 'mdi:linkedin',
      
      // Payment & Money
      creditCard: 'mdi:credit-card',
      cash: 'mdi:cash',
      wallet: 'mdi:wallet',
      
      // Time & Date
      clock: 'mdi:clock',
      calendar: 'mdi:calendar',
      calendarCheck: 'mdi:calendar-check',
      
      // User & Account
      user: 'mdi:account',
      userCircle: 'mdi:account-circle',
      login: 'mdi:login',
      logout: 'mdi:logout',
      settings: 'mdi:cog',
      
      // Status & Info
      info: 'mdi:information',
      warning: 'mdi:alert',
      error: 'mdi:alert-circle',
      success: 'mdi:check-circle',
      
      // Navigation
      home: 'mdi:home',
      bookmark: 'mdi:bookmark',
      bookmarkOutline: 'mdi:bookmark-outline',
      filter: 'mdi:filter',
      sort: 'mdi:sort',
    }
  };
  
  // Wait for Iconify to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initIcons, 100);
    });
  } else {
    setTimeout(initIcons, 100);
  }
  
  function initIcons() {
    // Iconify is ready
    if (window.Iconify) {
      console.log('Iconify loaded successfully');
    }
  }
})();

