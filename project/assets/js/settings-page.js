(function () {
  const APP_SETTINGS = window.APP_SETTINGS;

  $(function () {
    // Initialize dark mode toggle
    const darkMode = APP_SETTINGS.getTheme() === "dark";
    $("#toggle-dark").prop("checked", darkMode);

    $("#toggle-dark").on("change", function () {
      APP_SETTINGS.setTheme(this.checked ? "dark" : "light");
    });

    // Initialize language select
    const lang = APP_SETTINGS.getLang() || "vi";
    $("#lang-select").val(lang);

    $("#lang-select").on("change", function () {
      APP_SETTINGS.setLang(this.value);
    });
  });
})();







