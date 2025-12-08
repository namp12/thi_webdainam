/**
 * Index Page Animations
 * Handles scroll-triggered animations and interactive effects
 */
(function () {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Initialize scroll reveal animations
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    reveals.forEach(el => {
      observer.observe(el);
    });
  }

  // Animate numbers with counter effect
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  // Animate stat cards when visible
  function animateStats() {
    const statValues = document.querySelectorAll('#stat-total, #stat-dest, #stat-price');
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated', 'counter-animate');
          const text = entry.target.textContent;
          const number = parseInt(text.replace(/\D/g, ''));
          if (number) {
            animateCounter(entry.target, number);
          }
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(stat => {
      statObserver.observe(stat);
    });
  }

  // Parallax effect for hero section
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = hero.querySelector('.hero-visual');
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    });
  }

  // Floating animation for cards
  function initFloatingCards() {
    const cards = document.querySelectorAll('.feature-card, .stat-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('animate-fade-in-up');
    });
  }

  // Stagger animation for tour cards
  function staggerTourCards() {
    const tourCards = document.querySelectorAll('#hot-tour-list .card, #category-tour-list .card, #tour-list .card');
    tourCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('reveal');
      observer.observe(card);
    });
  }

  // Animate search dock on load
  function animateSearchDock() {
    const searchDock = document.querySelector('.search-dock');
    if (searchDock) {
      searchDock.classList.add('animate-slide-in-up');
    }
  }

  // Animate hero content
  function animateHeroContent() {
    const heroBadge = document.querySelector('.hero .badge');
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.hero .lead');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroBadge) {
      setTimeout(() => heroBadge.classList.add('animate-fade-in-down'), 100);
    }
    if (heroTitle) {
      setTimeout(() => heroTitle.classList.add('animate-fade-in-left'), 200);
    }
    if (heroSubtitle) {
      setTimeout(() => heroSubtitle.classList.add('animate-fade-in-left'), 300);
    }
    if (heroVisual) {
      setTimeout(() => heroVisual.classList.add('animate-fade-in-right'), 400);
    }
    if (document.querySelector('.search-dock')) {
      setTimeout(() => animateSearchDock(), 500);
    }
  }

  // Animate trust cards
  function animateTrustCards() {
    const trustCards = document.querySelectorAll('#trust .feature-card');
    trustCards.forEach((card, index) => {
      card.classList.add('reveal');
      card.style.animationDelay = `${index * 0.15}s`;
      observer.observe(card);
    });
  }

  // Animate destination cards
  function animateDestinationCards() {
    const destCards = document.querySelectorAll('.dest-card');
    destCards.forEach((card, index) => {
      card.classList.add('reveal-scale');
      card.style.animationDelay = `${index * 0.1}s`;
      observer.observe(card);
    });
  }

  // Animate deal cards
  function animateDealCards() {
    const dealCards = document.querySelectorAll('.deal-card');
    dealCards.forEach((card, index) => {
      card.classList.add('reveal');
      card.style.animationDelay = `${index * 0.15}s`;
      observer.observe(card);
    });
  }

  // Animate testimonial cards
  function animateTestimonials() {
    const testiCards = document.querySelectorAll('.testi-card');
    testiCards.forEach((card, index) => {
      card.classList.add('reveal-scale');
      card.style.animationDelay = `${index * 0.2}s`;
      observer.observe(card);
    });
  }

  // Animate partners
  function animatePartners() {
    const partners = document.querySelectorAll('.partners .badge');
    partners.forEach((badge, index) => {
      badge.classList.add('reveal');
      badge.style.animationDelay = `${index * 0.1}s`;
      observer.observe(badge);
    });
  }

  // Animate blog cards
  function animateBlogCards() {
    const blogCards = document.querySelectorAll('#blog .card');
    blogCards.forEach((card, index) => {
      card.classList.add('reveal');
      card.style.animationDelay = `${index * 0.15}s`;
      observer.observe(card);
    });
  }

  // Animate newsletter section
  function animateNewsletter() {
    const newsletter = document.querySelector('.newsletter');
    if (newsletter) {
      newsletter.classList.add('reveal-scale');
      observer.observe(newsletter);
    }
  }

  // Add hover effects to buttons
  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-accent');
    buttons.forEach(btn => {
      btn.classList.add('ripple');
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  // Initialize all animations
  $(function () {
    // Initial animations
    animateHeroContent();
    initFloatingCards();
    animateSearchDock();

    // Scroll-triggered animations
    initScrollReveal();
    animateStats();
    animateTrustCards();
    animateDestinationCards();
    animateDealCards();
    animateTestimonials();
    animatePartners();
    animateBlogCards();
    animateNewsletter();

    // Interactive effects
    initParallax();
    initButtonEffects();
    initSmoothScroll();

    // Re-animate tour cards when loaded
    setTimeout(() => {
      staggerTourCards();
    }, 1000);

    // Watch for dynamically loaded content
    const contentObserver = new MutationObserver(() => {
      staggerTourCards();
    });

    const tourList = document.getElementById('tour-list');
    const hotTourList = document.getElementById('hot-tour-list');
    const categoryTourList = document.getElementById('category-tour-list');

    if (tourList) contentObserver.observe(tourList, { childList: true });
    if (hotTourList) contentObserver.observe(hotTourList, { childList: true });
    if (categoryTourList) contentObserver.observe(categoryTourList, { childList: true });
  });
})();








