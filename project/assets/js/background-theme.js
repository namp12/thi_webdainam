/**
 * Background Theme Switcher
 * Cho phép chuyển đổi giữa các kiểu background khác nhau trong dark mode
 */
(function () {
  const { storage } = window.APP_UTILS;
  const BG_THEME_KEY = "dark_bg_theme";

  const themes = [
    { name: "default", label: "Mặc định" },
    { name: "gradient", label: "Gradient" },
    { name: "pattern", label: "Pattern Dots" },
    { name: "grid", label: "Grid" },
    { name: "mesh", label: "Mesh" },
    { name: "stars", label: "Stars" },
  ];

  function getCurrentTheme() {
    return storage.get(BG_THEME_KEY, "default");
  }

  function setTheme(themeName) {
    const body = document.body;
    
    // Remove all theme classes
    themes.forEach(t => {
      body.classList.remove(`bg-style-${t.name}`);
    });
    
    // Add new theme class
    if (themeName !== "default") {
      body.classList.add(`bg-style-${themeName}`);
    }
    
    storage.set(BG_THEME_KEY, themeName);
  }

  function initTheme() {
    const currentTheme = getCurrentTheme();
    const html = document.documentElement;
    
    // Only apply if dark mode is active
    if (html.getAttribute("data-bs-theme") === "dark") {
      setTheme(currentTheme);
    }
  }

  // Watch for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === "attributes" && mutation.attributeName === "data-bs-theme") {
        const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
        if (isDark) {
          initTheme();
        } else {
          // Remove all bg classes when switching to light mode
          themes.forEach(t => {
            document.body.classList.remove(`bg-style-${t.name}`);
          });
        }
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"]
  });

  // Initialize on load
  $(function() {
    initTheme();
  });

  // Expose API
  window.BG_THEME = {
    themes,
    getCurrentTheme,
    setTheme,
    initTheme,
  };
})();


