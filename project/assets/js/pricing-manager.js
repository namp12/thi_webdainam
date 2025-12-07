/**
 * Pricing Manager
 * Quản lý giá và khuyến mãi cho tours
 */
(function () {
  const { storage, formatPrice } = window.APP_UTILS;

  // Get active promotions for a tour
  function getTourPromotions(tourId) {
    try {
      const promotions = storage.get("travel_promotions", []);
      const now = new Date();
      
      return promotions.filter(promo => {
        // Check if promotion applies to this tour
        if (promo.tourIds && !promo.tourIds.includes(String(tourId))) {
          return false;
        }
        
        // Check date validity
        if (promo.validFrom && new Date(promo.validFrom) > now) {
          return false;
        }
        if (promo.validTo && new Date(promo.validTo) < now) {
          return false;
        }
        
        // Check if active
        if (!promo.active) {
          return false;
        }
        
        return true;
      });
    } catch {
      return [];
    }
  }

  // Calculate final price with promotions
  function calculateFinalPrice(tour, promotions = null) {
    if (!tour || !tour.price) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discount: 0,
        discountPercent: 0,
        promotion: null
      };
    }

    // Parse price from string format like "21,664,750 VND" to number
    const originalPrice = window.APP_UTILS?.parsePrice(tour.price) || Number(tour.price) || 0;
    
    if (!promotions) {
      promotions = getTourPromotions(tour.id);
    }

    if (promotions.length === 0) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discount: 0,
        discountPercent: 0,
        promotion: null
      };
    }

    // Get the best promotion (highest discount)
    let bestPromo = null;
    let maxDiscount = 0;

    promotions.forEach(promo => {
      let discount = 0;
      
      if (promo.type === 'percent') {
        discount = originalPrice * (promo.value / 100);
        if (promo.maxDiscount) {
          discount = Math.min(discount, promo.maxDiscount);
        }
      } else if (promo.type === 'fixed') {
        discount = promo.value;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromo = promo;
      }
    });

    const finalPrice = Math.max(0, originalPrice - maxDiscount);
    const discountPercent = originalPrice > 0 ? Math.round((maxDiscount / originalPrice) * 100) : 0;

    return {
      originalPrice,
      finalPrice,
      discount: maxDiscount,
      discountPercent,
      promotion: bestPromo
    };
  }

  // Get promotion badge text
  function getPromotionBadge(promotion) {
    if (!promotion) return null;

    if (promotion.type === 'percent') {
      return `-${promotion.value}%`;
    } else if (promotion.type === 'fixed') {
      return `-${formatPrice(promotion.value)}`;
    } else if (promotion.code) {
      return `Mã ${promotion.code}`;
    }

    return 'Khuyến mãi';
  }

  // Initialize sample promotions
  function initSamplePromotions() {
    const existing = storage.get("travel_promotions", []);
    if (existing.length > 0) return;

    const samplePromotions = [
      {
        id: 'promo-summer-2024',
        title: 'Khuyến mãi mùa hè 2024',
        type: 'percent',
        value: 15,
        maxDiscount: 1000000,
        tourIds: null, // Apply to all tours
        validFrom: '2024-06-01',
        validTo: '2024-08-31',
        active: true,
        code: null
      },
      {
        id: 'promo-flash-sale',
        title: 'Flash Sale',
        type: 'percent',
        value: 30,
        maxDiscount: 2000000,
        tourIds: null,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        active: true,
        code: null
      },
      {
        id: 'promo-new-year',
        title: 'Khuyến mãi năm mới',
        type: 'fixed',
        value: 500000,
        tourIds: null,
        validFrom: '2024-01-01',
        validTo: '2024-03-31',
        active: true,
        code: null
      }
    ];

    storage.set("travel_promotions", samplePromotions);
  }

  // Initialize
  $(function () {
    initSamplePromotions();
  });

  // Expose API
  window.PRICING_MANAGER = {
    getTourPromotions,
    calculateFinalPrice,
    getPromotionBadge
  };
})();

