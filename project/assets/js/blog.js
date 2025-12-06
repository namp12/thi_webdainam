(async function () {
  const { showToast } = window.APP_UTILS;
  const $list = $("#blog-list");
  const $empty = $("#blog-empty");
  const $search = $("#blog-search");
  const $categoryBtns = $(".blog-categories button");

  let allBlogs = [];
  let filteredBlogs = [];

  async function loadBlogs() {
    const res = await fetch("data/sample-blogs.json");
    if (!res.ok) throw new Error("Cannot load blogs");
    return res.json();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function render(items) {
    if (!$list.length) return;
    
    if (!items.length) {
      $list.addClass("d-none");
      $empty.removeClass("d-none");
      return;
    }

    $list.removeClass("d-none");
    $empty.addClass("d-none");

    const html = items
      .map(
        (b) => `
        <div class="col-md-6 col-lg-4">
          <article class="card h-100 shadow-sm blog-card">
            <div class="blog-card-image">
              <img src="${b.image || "assets/img/banners/placeholder.jpg"}" 
                   class="card-img-top" 
                   alt="${b.title}"
                   loading="lazy">
              <div class="blog-card-category">${b.category || "Du lịch"}</div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="blog-card-meta mb-2">
                <span class="text-muted small">
                  <i class="bi bi-calendar3"></i> ${formatDate(b.date || new Date().toISOString())}
                </span>
                <span class="text-muted small ms-3">
                  <i class="bi bi-person"></i> ${b.author || "Admin"}
                </span>
              </div>
              <h3 class="card-title h5 fw-bold mb-3">
                <a href="blog-detail.html?id=${b.id}" class="text-decoration-none text-dark">
                  ${b.title}
                </a>
              </h3>
              <p class="card-text text-muted flex-grow-1 mb-3">
                ${b.excerpt || ""}
              </p>
              <div class="blog-card-tags mb-3">
                ${(b.tags || []).slice(0, 3).map(tag => 
                  `<span class="badge bg-light text-dark me-1">${tag}</span>`
                ).join("")}
              </div>
              <a href="blog-detail.html?id=${b.id}" class="btn btn-outline-primary btn-sm align-self-start">
                Đọc thêm <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </article>
        </div>`
      )
      .join("");
    $list.html(html);
  }

  function filterBlogs() {
    const searchTerm = $search.val().toLowerCase();
    const activeCategory = $(".blog-categories button.active").data("category");

    filteredBlogs = allBlogs.filter(blog => {
      const matchSearch = !searchTerm || 
        blog.title.toLowerCase().includes(searchTerm) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm)) ||
        (blog.content && blog.content.toLowerCase().includes(searchTerm));
      
      const matchCategory = !activeCategory || activeCategory === "all" || 
        blog.category === activeCategory;

      return matchSearch && matchCategory;
    });

    render(filteredBlogs);
  }

  // Category filter
  $categoryBtns.on("click", function() {
    $categoryBtns.removeClass("active");
    $(this).addClass("active");
    filterBlogs();
  });

  // Search
  $search.on("input", function() {
    filterBlogs();
  });

  // Load URL category param
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");
  if (categoryParam) {
    $categoryBtns.each(function() {
      if ($(this).data("category") === categoryParam || 
          (categoryParam === "Du lịch trong nước" && $(this).text().includes("Trong nước"))) {
        $(this).click();
      }
    });
  }

  try {
    allBlogs = await loadBlogs();
    filteredBlogs = allBlogs;
    render(allBlogs);
  } catch (err) {
    showToast("Không tải được blog", "danger");
    console.error(err);
  }
})();
