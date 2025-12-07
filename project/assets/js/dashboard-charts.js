/**
 * Dashboard Charts & CSV Export
 * Tạo biểu đồ thống kê và chức năng xuất CSV
 */

(function() {
  const { formatPrice, parsePrice } = window.APP_UTILS;
  const { API } = window.APP_CONFIG;
  const { http } = window.APP_UTILS;

  let chartInstances = {};

  // Initialize Chart.js
  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return false;
    }
    return true;
  }

  // Get data for charts
  async function getChartData() {
    try {
      const [users, tours] = await Promise.all([
        http.get(API.users).catch(() => []),
        http.get(API.tours).catch(() => []),
      ]);

      const bookings = JSON.parse(localStorage.getItem("travel_bookings") || "[]");
      const reviews = JSON.parse(localStorage.getItem("travel_reviews") || "[]");
      const cart = JSON.parse(localStorage.getItem("travel_cart") || "[]");
      const favorites = JSON.parse(localStorage.getItem("travel_favorites") || "[]");
      const tracking = JSON.parse(localStorage.getItem("travel_tracking") || "[]");

      return { users, tours, bookings, reviews, cart, favorites, tracking };
    } catch (err) {
      console.error('Error loading chart data:', err);
      return { users: [], tours: [], bookings: [], reviews: [], cart: [], favorites: [], tracking: [] };
    }
  }

  // Prepare revenue data by time period
  function prepareRevenueData(bookings, period = '7d') {
    const completedBookings = bookings.filter(b => 
      b.status === "confirmed" || b.status === "paid" || b.status === "completed"
    );

    const now = new Date();
    let labels = [];
    let data = [];
    let days = 7;

    if (period === '30d') days = 30;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    // Generate labels
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      if (period === '1y') {
        labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }));
      } else {
        labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
      }
    }

    // Group bookings by date
    const revenueByDate = {};
    labels.forEach(label => {
      revenueByDate[label] = 0;
    });

    completedBookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt || booking.date || Date.now());
      let dateKey;
      
      if (period === '1y') {
        dateKey = bookingDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      } else {
        dateKey = bookingDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      }

      if (revenueByDate.hasOwnProperty(dateKey)) {
        const price = parsePrice(booking.total) || Number(booking.total || 0);
        revenueByDate[dateKey] += price;
      }
    });

    data = labels.map(label => revenueByDate[label] || 0);

    return { labels, data };
  }

  // Prepare bookings data by time period
  function prepareBookingsData(bookings, period = '7d') {
    const now = new Date();
    let labels = [];
    let confirmedData = [];
    let pendingData = [];
    let cancelledData = [];
    let days = 7;

    if (period === '30d') days = 30;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    // Generate labels
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      if (period === '1y') {
        labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }));
      } else {
        labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
      }
    }

    // Group bookings by date and status
    const bookingsByDate = {};
    labels.forEach(label => {
      bookingsByDate[label] = { confirmed: 0, pending: 0, cancelled: 0 };
    });

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt || booking.date || Date.now());
      let dateKey;
      
      if (period === '1y') {
        dateKey = bookingDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      } else {
        dateKey = bookingDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      }

      if (bookingsByDate.hasOwnProperty(dateKey)) {
        if (booking.status === 'confirmed' || booking.status === 'paid' || booking.status === 'completed') {
          bookingsByDate[dateKey].confirmed++;
        } else if (booking.status === 'pending') {
          bookingsByDate[dateKey].pending++;
        } else if (booking.status === 'cancelled') {
          bookingsByDate[dateKey].cancelled++;
        }
      }
    });

    confirmedData = labels.map(label => bookingsByDate[label].confirmed);
    pendingData = labels.map(label => bookingsByDate[label].pending);
    cancelledData = labels.map(label => bookingsByDate[label].cancelled);

    return { labels, confirmedData, pendingData, cancelledData };
  }

  // Prepare top tours data
  function prepareTopToursData(bookings, tours) {
    const tourCounts = {};
    
    bookings.forEach(booking => {
      const tourId = booking.tourId || booking.tour?.id;
      if (tourId) {
        tourCounts[tourId] = (tourCounts[tourId] || 0) + 1;
      }
    });

    const sortedTours = Object.entries(tourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedTours.map(([tourId]) => {
      const tour = tours.find(t => String(t.id) === tourId);
      return tour ? (tour.title.length > 30 ? tour.title.substring(0, 30) + '...' : tour.title) : `Tour ${tourId}`;
    });

    const data = sortedTours.map(([, count]) => count);

    return { labels, data };
  }

  // Prepare conversion funnel data
  function prepareFunnelData(tracking, cart, favorites, bookings) {
    const stats = {
      views: tracking.filter(t => t.event === 'pageView').length || 1000,
      addToCart: tracking.filter(t => t.event === 'addToCart').length || cart.length,
      addToFavorites: tracking.filter(t => t.event === 'addToFavorites').length || favorites.length,
      checkoutStarted: tracking.filter(t => t.event === 'checkoutStarted').length || 0,
      checkoutCompleted: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid' || b.status === 'completed').length
    };

    return {
      labels: ['Xem trang', 'Thêm giỏ hàng', 'Yêu thích', 'Bắt đầu thanh toán', 'Hoàn tất'],
      data: [
        stats.views,
        stats.addToCart,
        stats.addToFavorites,
        stats.checkoutStarted,
        stats.checkoutCompleted
      ]
    };
  }

  // Render Revenue Chart
  function renderRevenueChart(bookings, period = '7d') {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (chartInstances.revenue) {
      chartInstances.revenue.destroy();
    }

    const { labels, data } = prepareRevenueData(bookings, period);

    chartInstances.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu (₫)',
          data: data,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Doanh thu: ' + formatPrice(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatPrice(value);
              }
            }
          }
        }
      }
    });
  }

  // Render Bookings Chart
  function renderBookingsChart(bookings, period = '7d') {
    const ctx = document.getElementById('bookingsChart');
    if (!ctx) return;

    if (chartInstances.bookings) {
      chartInstances.bookings.destroy();
    }

    const { labels, confirmedData, pendingData, cancelledData } = prepareBookingsData(bookings, period);

    chartInstances.bookings = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Đã xác nhận',
            data: confirmedData,
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgb(40, 167, 69)',
            borderWidth: 1
          },
          {
            label: 'Chờ duyệt',
            data: pendingData,
            backgroundColor: 'rgba(255, 193, 7, 0.8)',
            borderColor: 'rgb(255, 193, 7)',
            borderWidth: 1
          },
          {
            label: 'Đã hủy',
            data: cancelledData,
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
            borderColor: 'rgb(220, 53, 69)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // Render Top Tours Chart
  function renderTopToursChart(bookings, tours) {
    const ctx = document.getElementById('topToursChart');
    if (!ctx) return;

    if (chartInstances.topTours) {
      chartInstances.topTours.destroy();
    }

    const { labels, data } = prepareTopToursData(bookings, tours);

    chartInstances.topTours = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(23, 162, 184, 0.8)',
            'rgba(255, 107, 107, 0.8)',
            'rgba(52, 152, 219, 0.8)',
            'rgba(155, 89, 182, 0.8)',
            'rgba(241, 196, 15, 0.8)'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    });
  }

  // Render Conversion Funnel Chart
  function renderFunnelChart(tracking, cart, favorites, bookings) {
    const ctx = document.getElementById('funnelChart');
    if (!ctx) return;

    if (chartInstances.funnel) {
      chartInstances.funnel.destroy();
    }

    const { labels, data } = prepareFunnelData(tracking, cart, favorites, bookings);

    chartInstances.funnel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số lượng',
          data: data,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgb(102, 126, 234)',
          borderWidth: 2
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Export to CSV
  function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      window.APP_UTILS.showToast('Không có dữ liệu để xuất', 'warning');
      return;
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.APP_UTILS.showToast('Xuất CSV thành công!', 'success');
  }

  // Export Revenue Data
  function exportRevenueCSV(bookings, period = '7d') {
    const { labels, data } = prepareRevenueData(bookings, period);
    const csvData = labels.map((label, index) => ({
      'Ngày': label,
      'Doanh thu (₫)': data[index],
      'Doanh thu (VND)': data[index].toLocaleString('vi-VN')
    }));

    const periodName = {
      '7d': '7-ngay',
      '30d': '30-ngay',
      '90d': '90-ngay',
      '1y': '1-nam'
    };

    exportToCSV(csvData, `doanh-thu-${periodName[period]}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Export Bookings Data
  function exportBookingsCSV(bookings) {
    const csvData = bookings.map(booking => ({
      'Mã đặt chỗ': booking.id || '',
      'Khách hàng': booking.customerName || '',
      'Email': booking.customerEmail || '',
      'Tour': booking.tourTitle || booking.tour?.title || '',
      'Ngày đặt': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : '',
      'Trạng thái': booking.status || '',
      'Tổng tiền (₫)': parsePrice(booking.total) || Number(booking.total || 0),
      'Giảm giá (₫)': Number(booking.discount || 0),
      'Phương thức thanh toán': booking.paymentMethod || ''
    }));

    exportToCSV(csvData, `danh-sach-booking-${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Export All Statistics
  async function exportAllStats() {
    const data = await getChartData();
    const { users, tours, bookings, reviews, cart, favorites } = data;

    // Create comprehensive CSV
    const csvData = [{
      'Loại thống kê': 'Tổng quan',
      'Giá trị': '',
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số users',
      'Giá trị': users.length,
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số tours',
      'Giá trị': tours.length,
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số bookings',
      'Giá trị': bookings.length,
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số reviews',
      'Giá trị': reviews.length,
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số sản phẩm trong giỏ',
      'Giá trị': cart.length,
      'Chi tiết': ''
    }, {
      'Loại thống kê': 'Tổng số yêu thích',
      'Giá trị': favorites.length,
      'Chi tiết': ''
    }];

    const completedBookings = bookings.filter(b => 
      b.status === "confirmed" || b.status === "paid" || b.status === "completed"
    );
    const grossRevenue = completedBookings.reduce((sum, b) => {
      return sum + (parsePrice(b.total) || Number(b.total || 0));
    }, 0);

    csvData.push({
      'Loại thống kê': 'Tổng doanh thu (Gross Revenue)',
      'Giá trị': grossRevenue,
      'Chi tiết': formatPrice(grossRevenue)
    });

    exportToCSV(csvData, `thong-ke-tong-quan-${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Initialize all charts
  async function initAllCharts() {
    if (!initCharts()) return;

    const data = await getChartData();
    const { bookings, tours, tracking, cart, favorites } = data;

    // Render charts
    renderRevenueChart(bookings, '7d');
    renderBookingsChart(bookings, '7d');
    renderTopToursChart(bookings, tours);
    renderFunnelChart(tracking, cart, favorites, bookings);

    // Setup period filters
    $('.chart-filter-btn').on('click', function() {
      const period = $(this).data('period');
      $('.chart-filter-btn').removeClass('active');
      $(this).addClass('active');

      // Update revenue chart
      renderRevenueChart(bookings, period);
      renderBookingsChart(bookings, period);
    });

    // Setup export buttons
    $('#export-revenue-csv').on('click', function() {
      const period = $('.chart-filter-btn.active').data('period') || '7d';
      exportRevenueCSV(bookings, period);
    });

    $('#export-bookings-csv').on('click', function() {
      exportBookingsCSV(bookings);
    });

    $('#export-all-stats').on('click', function() {
      exportAllStats();
    });
  }

  // Expose functions globally
  window.DASHBOARD_CHARTS = {
    init: initAllCharts,
    exportRevenue: exportRevenueCSV,
    exportBookings: exportBookingsCSV,
    exportAll: exportAllStats
  };

  // Initialize when DOM is ready
  $(function() {
    if (window.location.pathname.includes('admin-dashboard')) {
      // Wait for Chart.js to load
      if (typeof Chart !== 'undefined') {
        initAllCharts();
      } else {
        // Retry after a delay
        setTimeout(() => {
          if (typeof Chart !== 'undefined') {
            initAllCharts();
          }
        }, 1000);
      }
    }
  });
})();

