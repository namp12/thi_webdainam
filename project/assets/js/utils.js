// Simple helpers for fetch, notifications, debounce, storage
(function () {
  const toastContainerId = "app-toast-container";

  function ensureToastContainer() {
    if (document.getElementById(toastContainerId)) return;
    const container = document.createElement("div");
    container.id = toastContainerId;
    container.className =
      "position-fixed top-0 end-0 p-3 d-flex flex-column gap-2";
    container.style.zIndex = 1080;
    document.body.appendChild(container);
  }

  function showToast(message, type = "info", delay = 2500) {
    ensureToastContainer();
    const id = `toast-${Date.now()}`;
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.id = id;
    toast.role = "alert";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
    document.getElementById(toastContainerId).appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay });
    bsToast.show();
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  }

  async function request(url, options = {}) {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  const http = {
    get: (url) => request(url),
    post: (url, data) =>
      request(url, { method: "POST", body: JSON.stringify(data) }),
    put: (url, data) =>
      request(url, { method: "PUT", body: JSON.stringify(data) }),
    delete: (url) => request(url, { method: "DELETE" }),
  };

  function debounce(fn, delay = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    },
  };

  /**
   * Parse price from various formats to number
   * Handles: "21,664,750 VND", "21664750", 21664750, "21.664.750 VND", etc.
   */
  function parsePrice(price) {
    if (!price) return 0;
    
    // If already a number, return it
    if (typeof price === 'number') {
      return isNaN(price) ? 0 : price;
    }
    
    // If string, remove all non-digit characters except decimal point
    const str = String(price).trim();
    
    // Remove currency symbols and text (VND, đ, etc.)
    let cleaned = str
      .replace(/VND/gi, '')
      .replace(/đ/gi, '')
      .replace(/d/gi, '')
      .replace(/,/g, '')  // Remove commas
      .replace(/\./g, '') // Remove dots (if used as thousands separator)
      .replace(/\s+/g, '') // Remove spaces
      .trim();
    
    // Parse to number
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  function formatPrice(num) {
    // Parse first in case it's a string
    const parsed = parsePrice(num);
    if (parsed === 0 && num !== 0) return "";
    // Format with ₫ symbol instead of VND
    const formatted = parsed.toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    });
    return `${formatted} ₫`;
  }

  function formatDuration(duration) {
    return `${duration} ngày`;
  }

  window.APP_UTILS = {
    http,
    showToast,
    debounce,
    storage,
    parsePrice,
    formatPrice,
    formatDuration,
  };
})();







