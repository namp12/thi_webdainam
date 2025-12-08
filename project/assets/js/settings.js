(function () {
  const { storage } = window.APP_UTILS;
  const THEME_KEY = "travel_theme";
  const LANG_KEY = "travel_lang";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme === "dark" ? "dark" : "light");
  }

  async function loadLang(lang) {
    try {
      const res = await fetch(`assets/lang/${lang}.json`);
      const dict = await res.json();
      // Lưu từ điển toàn cục để truy cập từ JS
      window.APP_LANG = dict;
      
      $("[data-i18n]").each(function () {
        const key = $(this).data("i18n");
        if (dict[key]) {
          // Nếu là button với text riêng, chỉ cập nhật text không có icon
          if ($(this).is('button') && $(this).children('i').length > 0) {
            $(this).contents().filter(function() {
              return this.nodeType === 3; // Text node
            }).replaceWith(dict[key]);
          } else {
            $(this).text(dict[key]);
          }
        }
      });
      $("[data-i18n-placeholder]").each(function () {
        const key = $(this).data("i18n-placeholder");
        if (dict[key]) $(this).attr("placeholder", dict[key]);
      });
      // Cập nhật các button có data-i18n nhưng có icon
      $("button[data-i18n], .btn[data-i18n]").each(function() {
        const key = $(this).data("i18n");
        if (dict[key] && $(this).children('i').length > 0) {
          const icon = $(this).children('i').first();
          $(this).html(icon.prop('outerHTML') + ' ' + dict[key]);
        }
      });
      
      // Kích hoạt sự kiện tùy chỉnh cho các script khác
      $(document).trigger('langChanged', [lang, dict]);
    } catch (err) {
      console.warn("Lang load fail", err);
    }
  }

  function bindEvents() {
    $(document).off("change", "#toggle-dark");
    $(document).off("change", "#lang-select");

    $(document).on("change", "#toggle-dark", function () {
      const theme = $(this).is(":checked") ? "dark" : "light";
      storage.set(THEME_KEY, theme);
      applyTheme(theme);
    });

    $(document).on("change", "#lang-select", function () {
      const lang = $(this).val();
      storage.set(LANG_KEY, lang);
      loadLang(lang);
    });
  }

  function initTheme() {
    const saved = storage.get(THEME_KEY, "light");
    applyTheme(saved);
    $("#toggle-dark").prop("checked", saved === "dark");
  }

  function initLang() {
    const saved = storage.get(LANG_KEY, "vi");
    $("#lang-select").val(saved);
    loadLang(saved);
  }

  function init() {
    initTheme();
    initLang();
    bindEvents();
  }

  $(function () {
    init();
  });

  window.APP_SETTINGS = { init };
})();
