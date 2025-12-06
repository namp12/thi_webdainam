(async function () {
  const { API } = window.APP_CONFIG;
  const { http, storage, showToast } = window.APP_UTILS;
  const REVIEWS_KEY = "travel_reviews";

  const $select = $("#review-tour");

  function getReviews() {
    return storage.get(REVIEWS_KEY, []);
  }
  function saveReviews(list) {
    storage.set(REVIEWS_KEY, list);
  }

  async function loadTours() {
    const tours = await http.get(API.tours);
    const options = tours
      .map((t) => `<option value="${t.id}">${t.title}</option>`)
      .join("");
    $select.html(options);
  }

  $(function () {
    loadTours().catch(() => {});

    $("#review-form").on("submit", function (e) {
      e.preventDefault();
      const tourId = $select.val();
      const score = Number($("#review-score").val());
      const content = $("#review-content").val().trim();
      
      // Validation
      if (!tourId) {
        showToast("Vui lòng chọn tour", "warning");
        $select.focus();
        return;
      }
      if (!score || score < 1 || score > 5) {
        showToast("Vui lòng chọn điểm từ 1-5 sao", "warning");
        $("#review-score").focus();
        return;
      }
      if (!content || content.length < 10) {
        showToast("Nội dung đánh giá phải có ít nhất 10 ký tự", "warning");
        $("#review-content").focus();
        return;
      }
      if (content.length > 500) {
        showToast("Nội dung đánh giá không được quá 500 ký tự", "warning");
        $("#review-content").focus();
        return;
      }
      const toursCache = $select.find("option").toArray();
      const tourName = toursCache.find((o) => o.value === tourId)?.text || "Tour";
      const reviews = getReviews();
      reviews.push({
        id: Date.now().toString(),
        tourId,
        tourName,
        score,
        content,
        user: "Khách",
        createdAt: new Date().toISOString(),
      });
      saveReviews(reviews);
      showToast("Đã gửi đánh giá", "success");
      window.location.href = "reviews.html";
    });
  });
})();

