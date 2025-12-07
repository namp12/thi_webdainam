/**
 * User Interaction Tracking
 * Track user interactions for analytics and dashboard
 */
(function () {
  const { storage } = window.APP_UTILS;
  const TRACKING_KEY = "travel_tracking";

  // Get tracking data
  function getTrackingData() {
    try {
      return storage.get(TRACKING_KEY, {
        addToCart: [],
        addToFavorites: [],
        checkoutStarted: [],
        checkoutCompleted: [],
        discountCodesUsed: [],
        pageViews: [],
        lastUpdated: new Date().toISOString()
      });
    } catch {
      return {
        addToCart: [],
        addToFavorites: [],
        checkoutStarted: [],
        checkoutCompleted: [],
        discountCodesUsed: [],
        pageViews: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Save tracking data
  function saveTrackingData(data) {
    data.lastUpdated = new Date().toISOString();
    storage.set(TRACKING_KEY, data);
    
    // Trigger event for dashboard updates
    $(document).trigger('trackingUpdated', [data]);
  }

  // Track Add to Cart
  function trackAddToCart(tourId, tourData, quantity = 1) {
    const tracking = getTrackingData();
    tracking.addToCart.push({
      tourId: String(tourId),
      tourTitle: tourData?.title || 'Tour',
      quantity,
      timestamp: new Date().toISOString(),
      price: tourData?.price || 0
    });
    saveTrackingData(tracking);
  }

  // Track Add to Favorites
  function trackAddToFavorites(tourId, tourData) {
    const tracking = getTrackingData();
    tracking.addToFavorites.push({
      tourId: String(tourId),
      tourTitle: tourData?.title || 'Tour',
      timestamp: new Date().toISOString()
    });
    saveTrackingData(tracking);
  }

  // Track Checkout Started
  function trackCheckoutStarted(cartData, total) {
    const tracking = getTrackingData();
    tracking.checkoutStarted.push({
      items: cartData.map(item => ({
        tourId: item.tourId,
        quantity: item.quantity,
        price: item.tour?.price || 0
      })),
      total,
      timestamp: new Date().toISOString()
    });
    saveTrackingData(tracking);
  }

  // Track Checkout Completed
  function trackCheckoutCompleted(bookingData) {
    const tracking = getTrackingData();
    tracking.checkoutCompleted.push({
      bookingCode: bookingData.code,
      total: bookingData.total,
      discount: bookingData.discount || 0,
      discountCode: bookingData.discountCode,
      timestamp: new Date().toISOString()
    });
    saveTrackingData(tracking);
  }

  // Track Discount Code Used
  function trackDiscountCodeUsed(code, discountAmount, orderTotal) {
    const tracking = getTrackingData();
    tracking.discountCodesUsed.push({
      code,
      discountAmount,
      orderTotal,
      timestamp: new Date().toISOString()
    });
    saveTrackingData(tracking);
  }

  // Get statistics
  function getStats(timeRange = 'all') {
    const tracking = getTrackingData();
    const now = new Date();
    let startDate = null;

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    function filterByDate(items) {
      if (!startDate) return items;
      return items.filter(item => new Date(item.timestamp) >= startDate);
    }

    const addToCart = filterByDate(tracking.addToCart);
    const addToFavorites = filterByDate(tracking.addToFavorites);
    const checkoutStarted = filterByDate(tracking.checkoutStarted);
    const checkoutCompleted = filterByDate(tracking.checkoutCompleted);
    const discountCodesUsed = filterByDate(tracking.discountCodesUsed);

    // Calculate conversion rate
    const conversionRate = checkoutStarted.length > 0
      ? (checkoutCompleted.length / checkoutStarted.length) * 100
      : 0;

    // Calculate discount code usage rate
    const discountUsageRate = checkoutStarted.length > 0
      ? (discountCodesUsed.length / checkoutStarted.length) * 100
      : 0;

    // Calculate total discount given
    const totalDiscountGiven = discountCodesUsed.reduce((sum, item) => sum + (item.discountAmount || 0), 0);

    // Calculate net revenue (total - discounts)
    const totalRevenue = checkoutCompleted.reduce((sum, item) => sum + (item.total || 0), 0);
    const netRevenue = totalRevenue - totalDiscountGiven;

    // Group discount codes by code
    const discountCodeStats = {};
    discountCodesUsed.forEach(item => {
      if (!discountCodeStats[item.code]) {
        discountCodeStats[item.code] = {
          code: item.code,
          usageCount: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          orders: []
        };
      }
      discountCodeStats[item.code].usageCount++;
      discountCodeStats[item.code].totalDiscount += item.discountAmount || 0;
      discountCodeStats[item.code].totalRevenue += item.orderTotal || 0;
    });

    return {
      addToCart: {
        count: addToCart.length,
        items: addToCart
      },
      addToFavorites: {
        count: addToFavorites.length,
        items: addToFavorites
      },
      checkoutStarted: {
        count: checkoutStarted.length,
        items: checkoutStarted
      },
      checkoutCompleted: {
        count: checkoutCompleted.length,
        items: checkoutCompleted
      },
      conversionRate: Math.round(conversionRate * 100) / 100,
      discountCodesUsed: {
        count: discountCodesUsed.length,
        items: discountCodesUsed,
        stats: discountCodeStats
      },
      discountUsageRate: Math.round(discountUsageRate * 100) / 100,
      totalDiscountGiven,
      totalRevenue,
      netRevenue,
      timeRange
    };
  }

  // Get discount code analysis
  function getDiscountCodeAnalysis(code) {
    const tracking = getTrackingData();
    const codeUsages = tracking.discountCodesUsed.filter(item => item.code === code);
    
    if (codeUsages.length === 0) {
      return {
        code,
        usageCount: 0,
        totalDiscount: 0,
        totalRevenue: 0,
        averageDiscount: 0,
        conversionRate: 0,
        customers: []
      };
    }

    const totalDiscount = codeUsages.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalRevenue = codeUsages.reduce((sum, item) => sum + (item.orderTotal || 0), 0);
    const averageDiscount = totalDiscount / codeUsages.length;

    // Get unique customers (from bookings)
    const bookings = storage.get("travel_bookings", []);
    const codeBookings = bookings.filter(b => b.discountCode === code);
    const customers = codeBookings.map(b => ({
      email: b.customer?.email,
      name: b.customer?.name,
      bookingCode: b.code,
      total: b.total,
      discount: b.discount || 0,
      timestamp: b.createdAt
    }));

    // Calculate conversion rate (code entered vs code used successfully)
    const checkoutStarted = tracking.checkoutStarted.length;
    const conversionRate = checkoutStarted > 0
      ? (codeUsages.length / checkoutStarted) * 100
      : 0;

    return {
      code,
      usageCount: codeUsages.length,
      totalDiscount,
      totalRevenue,
      averageDiscount: Math.round(averageDiscount),
      conversionRate: Math.round(conversionRate * 100) / 100,
      customers
    };
  }

  // Expose API
  window.TRACKING = {
    trackAddToCart,
    trackAddToFavorites,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    trackDiscountCodeUsed,
    getStats,
    getDiscountCodeAnalysis,
    getTrackingData
  };
})();

