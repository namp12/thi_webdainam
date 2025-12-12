// Common initialization: load header/footer components and re-init settings
$(async function () {
  // Only load client header/footer if not admin page
  if (!window.location.pathname.includes("admin-")) {
    const $header = $("#header-placeholder");
    const $footer = $("#footer-placeholder");
    try {
      if ($header.length) {
        await $header.load("components/header.html", function () {
          if (window.APP_SETTINGS) window.APP_SETTINGS.init();
          // Load client header handler để hiển thị user info
          const script = document.createElement('script');
          script.src = 'assets/js/header-client.js';
          document.body.appendChild(script);
        });
      }
      if ($footer.length) {
        await $footer.load("components/footer.html", function () {
          // Load footer CSS if not already loaded
          if (!$('link[href*="footer.css"]').length) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/footer.css';
            document.head.appendChild(link);
          }
          // Load footer JS if not already loaded
          if (!$('script[src*="footer.js"]').length) {
            const script = document.createElement('script');
            script.src = 'assets/js/footer.js';
            document.body.appendChild(script);
          }
        });
      }
    } catch (err) {
      console.warn("Load component fail", err);
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    const intervalTime = 3000; // 3 giây

    function showSlide(index) {
        // Ẩn tất cả slides
        slides.forEach((slide) => {
            slide.classList.remove('active');
        });
        
        // Hiển thị slide hiện tại
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Khởi tạo slider
    showSlide(currentSlide);

    // Bắt đầu chế độ tự động chuyển đổi
    setInterval(nextSlide, intervalTime);
});
