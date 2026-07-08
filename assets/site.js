(function(){
  "use strict";

  /* ---------- nav toggle ---------- */
  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle && header) {
    navToggle.addEventListener('click', function(){
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.nav-links a').forEach(function(a){
      a.addEventListener('click', function(){ header.classList.remove('nav-open'); navToggle.setAttribute('aria-expanded','false'); });
    });
  }

  /* ---------- chat launcher ---------- */
  var launcher = document.getElementById('chat-launcher');
  var chatToggle = document.getElementById('chat-toggle');
  if (chatToggle && launcher) {
    chatToggle.addEventListener('click', function(){
      var open = launcher.classList.toggle('is-open');
      chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function(el){ el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---------- mini cart (localStorage, no payment backend) ---------- */
  var CART_KEY = 'tlg_cart_v1';
  function readCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
  function writeCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); renderCart(); }
  function addToCart(id, name, price){
    var items = readCart();
    var found = items.find(function(i){ return i.id === id; });
    if (found) { found.qty += 1; } else { items.push({ id: id, name: name, price: price, qty: 1 }); }
    writeCart(items);
    openCart();
  }
  function removeFromCart(id){
    writeCart(readCart().filter(function(i){ return i.id !== id; }));
  }
  function cartTotal(items){ return items.reduce(function(sum, i){ return sum + i.price * i.qty; }, 0); }
  function formatVND(n){ return n.toLocaleString('vi-VN') + '₫'; }

  var cartDrawer = document.getElementById('cart-drawer');
  var cartItemsEl = document.getElementById('cart-items');
  var cartCountEls = document.querySelectorAll('.cart-count');
  var cartTotalEl = document.getElementById('cart-total');

  function renderCart(){
    var items = readCart();
    var count = items.reduce(function(s,i){ return s + i.qty; }, 0);
    cartCountEls.forEach(function(el){ el.textContent = count; el.style.display = count ? 'flex' : 'none'; });
    if (!cartItemsEl) return;
    if (!items.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống. Chọn một dòng trà để bắt đầu.</p>';
    } else {
      cartItemsEl.innerHTML = items.map(function(i){
        return '<div class="cart-item">' +
          '<div class="cart-item-swatch"></div>' +
          '<div class="cart-item-info">' + i.name + ' × ' + i.qty + '<br><strong>' + formatVND(i.price * i.qty) + '</strong></div>' +
          '<button class="cart-item-remove" data-remove="' + i.id + '">Xoá</button>' +
        '</div>';
      }).join('');
      cartItemsEl.querySelectorAll('[data-remove]').forEach(function(btn){
        btn.addEventListener('click', function(){ removeFromCart(btn.getAttribute('data-remove')); });
      });
    }
    if (cartTotalEl) cartTotalEl.textContent = formatVND(cartTotal(items));
  }

  function openCart(){ if (cartDrawer) cartDrawer.classList.add('is-open'); }
  function closeCart(){ if (cartDrawer) cartDrawer.classList.remove('is-open'); }

  document.querySelectorAll('[data-add-cart]').forEach(function(btn){
    btn.addEventListener('click', function(){
      addToCart(btn.getAttribute('data-id'), btn.getAttribute('data-name'), parseInt(btn.getAttribute('data-price'), 10));
    });
  });
  document.querySelectorAll('[data-open-cart]').forEach(function(btn){ btn.addEventListener('click', openCart); });
  document.querySelectorAll('[data-close-cart]').forEach(function(btn){ btn.addEventListener('click', closeCart); });
  if (cartDrawer) {
    cartDrawer.addEventListener('click', function(e){ if (e.target === cartDrawer) closeCart(); });
  }
  renderCart();

  /* ---------- sticky mobile CTA (PDP only) ---------- */
  var mainCta = document.getElementById('pdp-main-cta');
  var stickyCta = document.getElementById('sticky-cta');
  if (mainCta && stickyCta && 'IntersectionObserver' in window) {
    var ctaIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        stickyCta.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    ctaIo.observe(mainCta);
  }

  /* ---------- exit-intent / 15s popup (once per session) ---------- */
  var popup = document.getElementById('exit-popup');
  if (popup) {
    var shown = sessionStorage.getItem('tlg_popup_shown');
    var triggerOnce = function(){
      if (sessionStorage.getItem('tlg_popup_shown')) return;
      sessionStorage.setItem('tlg_popup_shown', '1');
      popup.classList.add('is-open');
    };
    if (!shown) {
      var timer = setTimeout(triggerOnce, 15000);
      document.addEventListener('mouseleave', function(e){
        if (e.clientY <= 0) { clearTimeout(timer); triggerOnce(); }
      });
    }
    popup.querySelectorAll('[data-close-popup]').forEach(function(btn){
      btn.addEventListener('click', function(){ popup.classList.remove('is-open'); });
    });
    popup.addEventListener('click', function(e){ if (e.target === popup) popup.classList.remove('is-open'); });
  }

  /* ---------- footer signup form (no backend — friendly local confirmation) ---------- */
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e){
      e.preventDefault();
      var note = signupForm.querySelector('.signup-note');
      if (note) note.textContent = 'Cảm ơn bạn — Lão Lưu đã ghi nhận email này.';
      signupForm.reset();
    });
  }
})();
