(function () {
  function getBookingCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("code") || "";
  }

  $(function () {
    const code = getBookingCode();
    if (code) {
      $("#bk-code").text(code);
    } else {
      $("#bk-code").text("Không tìm thấy mã đặt chỗ");
    }
  });
})();









