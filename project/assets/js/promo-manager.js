/**
 * Promo Code and Tier Discount Manager
 * Quản lý mã giảm giá và giảm giá theo ngưỡng
 */
(function () {
  const { storage, formatPrice } = window.APP_UTILS;

  // Tier discount configuration
  const TIER_DISCOUNTS = [
    { threshold: 40000000, discount: 500000, label: '40 triệu → Giảm 500k' },
    { threshold: 30000000, discount: 300000, label: '30 triệu → Giảm 300k' },
    { threshold: 20000000, discount: 200000, label: '20 triệu → Giảm 200k' },
    { threshold: 10000000, discount: 100000, label: '10 triệu → Giảm 100k' }
  ];

  // Promo codes configuration
  const PROMO_CODES = {
    'SUMMER2024': {
      code: 'SUMMER2024',
      title: 'Mã giảm giá mùa hè 2024',
      description: 'Giảm 200k cho đơn hàng từ 5 triệu',
      discountType: 'fixed',
      discountValue: 200000,
      minOrder: 5000000,
      maxDiscount: 200000,
      expiresAt: '2024-12-31',
      maxUses: 1000,
      usedCount: 0,
      active: true,
      userType: null // null = all users
    },
    'NEWUSER': {
      code: 'NEWUSER',
      title: 'Khách hàng mới',
      description: 'Giảm 150k cho khách hàng mới',
      discountType: 'fixed',
      discountValue: 150000,
      minOrder: 0,
      maxDiscount: 150000,
      expiresAt: '2024-12-31',
      maxUses: 5000,
      usedCount: 0,
      active: true,
      userType: 'new'
    },
    'FAMILY': {
      code: 'FAMILY',
      title: 'Ưu đãi gia đình',
      description: 'Giảm 300k cho đơn từ 15 triệu',
      discountType: 'fixed',
      discountValue: 300000,
      minOrder: 15000000,
      maxDiscount: 300000,
      expiresAt: '2024-12-31',
      maxUses: 500,
      usedCount: 0,
      active: true,
      userType: null
    },
    'FLASH50': {
      code: 'FLASH50',
      title: 'Flash Sale 50k',
      description: 'Giảm 50k không điều kiện',
      discountType: 'fixed',
      discountValue: 50000,
      minOrder: 0,
      maxDiscount: 50000,
      expiresAt: '2024-12-31',
      maxUses: 10000,
      usedCount: 0,
      active: true,
      userType: null
    }
  };

  /**
   * Initialize promo codes in localStorage if not exists
   */
  function initPromoCodes() {
    const existingCodes = storage.get('travel_discounts', []);
    
    // If no codes exist, initialize with default codes
    if (existingCodes.length === 0) {
      const codes = Object.values(PROMO_CODES);
      storage.set('travel_discounts', codes);
      console.log('✅ Initialized promo codes:', codes.length);
    }
  }

  /**
   * Get promo code details
   */
  function getPromoCode(code) {
    const codes = storage.get('travel_discounts', []);
    return codes.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  }

  /**
   * Validate promo code
   */
  function validatePromoCode(code, orderTotal = 0, userType = null) {
    if (!code) {
      return {
        valid: false,
        error: 'Vui lòng nhập mã giảm giá'
      };
    }

    const promoCode = getPromoCode(code);
    
    if (!promoCode) {
      return {
        valid: false,
        error: 'Mã giảm giá không tồn tại hoặc đã hết hạn'
      };
    }

    // Check if active
    if (!promoCode.active) {
      return {
        valid: false,
        error: 'Mã giảm giá không còn khả dụng'
      };
    }

    // Check expiration
    if (promoCode.expiresAt) {
      const expiryDate = new Date(promoCode.expiresAt);
      if (expiryDate < new Date()) {
        return {
          valid: false,
          error: 'Mã giảm giá đã hết hạn'
        };
      }
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return {
        valid: false,
        error: 'Mã giảm giá đã hết lượt sử dụng'
      };
    }

    // Check minimum order
    if (promoCode.minOrder && orderTotal < promoCode.minOrder) {
      return {
        valid: false,
        error: `Đơn hàng tối thiểu ${formatPrice(promoCode.minOrder)}đ để sử dụng mã này`
      };
    }

    // Check user type
    if (promoCode.userType === 'new') {
      // Check if user is new (has no previous bookings)
      const bookings = storage.get('travel_bookings', []);
      const currentUser = storage.get('travel_user', null);
      
      if (currentUser) {
        const userBookings = bookings.filter(b => 
          b.customer && b.customer.email === currentUser.email
        );
        
        if (userBookings.length > 0) {
          return {
            valid: false,
            error: 'Mã này chỉ dành cho khách hàng mới'
          };
        }
      }
    }

    return {
      valid: true,
      promoCode
    };
  }

  /**
   * Calculate tier discount based on order total
   */
  function calculateTierDiscount(orderTotal) {
    // Find the highest tier that the order qualifies for
    for (const tier of TIER_DISCOUNTS) {
      if (orderTotal >= tier.threshold) {
        return {
          tier: tier.threshold,
          discount: tier.discount,
          label: tier.label
        };
      }
    }
    
    return {
      tier: 0,
      discount: 0,
      label: 'Chưa đạt ngưỡng giảm giá'
    };
  }

  /**
   * Get next tier information
   */
  function getNextTier(orderTotal) {
    for (let i = TIER_DISCOUNTS.length - 1; i >= 0; i--) {
      const tier = TIER_DISCOUNTS[i];
      if (orderTotal < tier.threshold) {
        const remaining = tier.threshold - orderTotal;
        return {
          threshold: tier.threshold,
          discount: tier.discount,
          remaining: remaining,
          label: tier.label,
          message: `Mua thêm ${formatPrice(remaining)}đ để được giảm ${formatPrice(tier.discount)}đ`
        };
      }
    }
    
    return null; // Already at highest tier
  }

  /**
   * Calculate total discount (promo code + tier discount)
   * Strategy: Apply promo code first, then tier discount
   */
  function calculateTotalDiscount(orderTotal, promoCode = null) {
    let promoDiscount = 0;
    let tierDiscount = 0;
    let appliedPromoCode = null;

    // 1. Apply promo code discount
    if (promoCode) {
      const validation = validatePromoCode(promoCode, orderTotal);
      if (validation.valid) {
        appliedPromoCode = validation.promoCode;
        
        if (appliedPromoCode.discountType === 'percent') {
          promoDiscount = Math.min(
            (orderTotal * appliedPromoCode.discountValue) / 100,
            appliedPromoCode.maxDiscount || Infinity
          );
        } else {
          promoDiscount = appliedPromoCode.discountValue;
        }
      }
    }

    // 2. Calculate tier discount (on original order total)
    const tierInfo = calculateTierDiscount(orderTotal);
    tierDiscount = tierInfo.discount;

    // 3. Calculate final total
    const totalDiscount = promoDiscount + tierDiscount;
    const finalTotal = Math.max(0, orderTotal - totalDiscount);

    return {
      orderTotal,
      promoDiscount,
      tierDiscount,
      totalDiscount,
      finalTotal,
      appliedPromoCode,
      tierInfo,
      breakdown: {
        subtotal: orderTotal,
        promoCode: promoDiscount > 0 ? {
          code: appliedPromoCode?.code,
          amount: promoDiscount
        } : null,
        tier: tierDiscount > 0 ? {
          threshold: tierInfo.tier,
          amount: tierDiscount
        } : null,
        total: finalTotal
      }
    };
  }

  /**
   * Apply promo code (mark as used)
   */
  function applyPromoCode(code) {
    const codes = storage.get('travel_discounts', []);
    const promoCode = codes.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (promoCode) {
      promoCode.usedCount = (promoCode.usedCount || 0) + 1;
      storage.set('travel_discounts', codes);
      return true;
    }
    
    return false;
  }

  /**
   * Get all active promo codes
   */
  function getAllPromoCodes() {
    const codes = storage.get('travel_discounts', []);
    return codes.filter(c => c.active);
  }

  /**
   * Get tier discount configuration
   */
  function getTierDiscounts() {
    return TIER_DISCOUNTS;
  }

  // Initialize on load
  $(function() {
    initPromoCodes();
  });

  // Expose API
  window.PROMO_MANAGER = {
    getPromoCode,
    validatePromoCode,
    calculateTierDiscount,
    getNextTier,
    calculateTotalDiscount,
    applyPromoCode,
    getAllPromoCodes,
    getTierDiscounts,
    TIER_DISCOUNTS
  };

  console.log('✅ Promo Manager initialized');
})();
