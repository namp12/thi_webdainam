(async function () {
  const { showToast } = window.APP_UTILS;

  function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

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

  function render(blog, allBlogs) {
    if (!blog) {
      showToast("Không tìm thấy bài viết", "danger");
      setTimeout(() => window.location.href = "blog.html", 2000);
      return;
    }

    // Update page title
    document.title = blog.title + " - Blog Du Lịch";

    // Breadcrumb
    $("#blog-breadcrumb").text(blog.category || "Blog");

    // Title
    $("#blog-title").text(blog.title);

    // Meta info
    $("#blog-author").text(blog.author || "Admin");
    $("#blog-date").text(formatDate(blog.date || new Date().toISOString()));
    $("#blog-category").text(blog.category || "Du lịch");

    // Featured image
    if (blog.image) {
      $("#blog-image").attr("src", blog.image).attr("alt", blog.title).show();
    } else {
      $("#blog-featured-image").hide();
    }

    // Tags
    if (blog.tags && blog.tags.length > 0) {
      const tagsHtml = blog.tags.map(tag => 
        `<span class="badge bg-primary me-2 mb-2">${tag}</span>`
      ).join("");
      $("#blog-tags").html(`<div class="d-flex flex-wrap">${tagsHtml}</div>`);
    }

    // Content
    const content = blog.content || blog.excerpt || "";
    $("#blog-content").html(content);

    // Related posts
    renderRelatedPosts(blog, allBlogs);
  }

  function renderRelatedPosts(currentBlog, allBlogs) {
    const related = allBlogs
      .filter(b => b.id !== currentBlog.id && 
              (b.category === currentBlog.category || 
               (b.tags && b.tags.some(t => currentBlog.tags && currentBlog.tags.includes(t)))))
      .slice(0, 3);

    if (related.length === 0) {
      $("#related-posts").html("<p class='text-muted mb-0'>Chưa có bài viết liên quan</p>");
      return;
    }

    const html = related.map(b => `
      <div class="d-flex gap-3 mb-3 pb-3 border-bottom">
        <img src="${b.image || "assets/img/banners/placeholder.jpg"}" 
             alt="${b.title}" 
             class="rounded" 
             style="width: 80px; height: 80px; object-fit: cover;">
        <div class="flex-grow-1">
          <h6 class="mb-1">
            <a href="blog-detail.html?id=${b.id}" class="text-decoration-none text-dark">
              ${b.title.length > 60 ? b.title.substring(0, 60) + "..." : b.title}
            </a>
          </h6>
          <small class="text-muted">${formatDate(b.date || new Date().toISOString())}</small>
        </div>
      </div>
    `).join("");

    $("#related-posts").html(html);
  }

  try {
    const blogs = await loadBlogs();
    const id = getId();
    const blog = id ? blogs.find((b) => String(b.id) === String(id)) : blogs[0];
    render(blog, blogs);
  } catch (err) {
    showToast("Không tải được bài viết", "danger");
    console.error(err);
  }
})();
