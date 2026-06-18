/* Bijamrit store — shared data + cart/wishlist state + promo codes + UI helpers.
   Loaded first on every page. Exposes window.Store. */
(function () {
  var IMG = 'assets/img/';
  var PRODUCTS = [
    { id: 'classic', name: 'Classic Makhana',     price: 199,  old: 249,  rating: 4.8, reviews: 214, weight: '100g',     img: IMG + 'img-2.webp', badge: '20% OFF', cat: 'Roasted'  },
    { id: 'raw',     name: 'Raw Makhana',         price: 179,  old: 219,  rating: 4.6, reviews: 121, weight: '250g',     img: IMG + 'img-5.webp', badge: 'Raw',     cat: 'Raw'      },
    { id: 'peri',    name: 'Peri Peri Makhana',   price: 219,  old: 279,  rating: 4.7, reviews: 186, weight: '100g',     img: IMG + 'img-0.webp', badge: '22% OFF', cat: 'Flavoured'},
    { id: 'pudina',  name: 'Pudina Makhana',      price: 209,  old: 269,  rating: 4.6, reviews: 142, weight: '100g',     img: IMG + 'img-3.webp', badge: '22% OFF', cat: 'Flavoured'},
    { id: 'cheese',  name: 'Cheese Makhana',      price: 229,  old: 299,  rating: 4.7, reviews: 168, weight: '100g',     img: IMG + 'img-1.webp', badge: 'New',     cat: 'Flavoured'},
    { id: 'combo',   name: 'Roasted Combo Pack',  price: 749,  old: 999,  rating: 4.9, reviews: 96,  weight: '4 × 100g', img: IMG + 'img-2.webp', badge: '25% OFF', cat: 'Combo'    },
    { id: 'festive', name: 'Festive Gift Box',    price: 1299, old: 1699, rating: 5.0, reviews: 58,  weight: '500g',     img: IMG + 'img-4.webp', badge: 'New',     cat: 'Combo'    },
    { id: 'mint',    name: 'Mint Magic Makhana',  price: 199,  old: 0,    rating: 4.5, reviews: 74,  weight: '100g',     img: IMG + 'img-3.webp', badge: '',        cat: 'Flavoured'},
    { id: 'cream',   name: 'Cream & Onion Makhana',price: 229, old: 0,    rating: 4.8, reviews: 133, weight: '100g',     img: IMG + 'img-1.webp', badge: '',        cat: 'Flavoured'},
    { id: 'tangy',   name: 'Tangy Tomato Makhana',price: 209,  old: 255,  rating: 4.6, reviews: 88,  weight: '100g',     img: IMG + 'img-0.webp', badge: '18% OFF', cat: 'Flavoured'}
  ];
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  var PROMOS = {
    WELCOME10: { type: 'percent', value: 10,  min: 399, label: '10% off' },
    SAVE150:   { type: 'flat',    value: 150, min: 999, label: '₹150 off' },
    FREESHIP:  { type: 'ship',    value: 0,   min: 0,   label: 'Free shipping' }
  };

  var CK = 'bij_cart', WK = 'bij_wish', PK = 'bij_promo', SEED = 'bij_seeded';

  function read(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // Seed once so first visit matches the design (cart + wishlist populated)
  if (!localStorage.getItem(SEED)) {
    write(CK, { classic: 2, peri: 1, festive: 1 });
    write(WK, ['classic', 'cheese', 'festive', 'pudina']);
    localStorage.setItem(SEED, '1');
  }

  function getCart() { return read(CK, {}); }
  function getWish() { return read(WK, []); }
  function getPromo() { var p = localStorage.getItem(PK); return p && PROMOS[p] ? p : null; }

  function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

  // weight variants: price scales from the listed (100g) price; key = "id" or "id__250g"
  var WEIGHTS = [{ label: '100g', mult: 1 }, { label: '250g', mult: 2.3 }, { label: '500g', mult: 4.2 }];
  function weightMult(w) { for (var i = 0; i < WEIGHTS.length; i++) if (WEIGHTS[i].label === w) return WEIGHTS[i].mult; return 1; }
  function splitKey(key) { var i = String(key).indexOf('__'); return i === -1 ? { id: key, weight: null } : { id: key.slice(0, i), weight: key.slice(i + 2) }; }
  function lineKey(id, weight) { return weight ? id + '__' + weight : id; }
  function priceOf(key) { var s = splitKey(key), p = byId[s.id]; if (!p) return 0; return s.weight ? Math.round(p.price * weightMult(s.weight) / weightMult(p.weight) / 5) * 5 : p.price; }
  function weightOf(key) { var s = splitKey(key), p = byId[s.id]; return s.weight || (p ? p.weight : ''); }

  var Store = {
    PRODUCTS: PRODUCTS,
    PROMOS: PROMOS,
    get: function (id) { return byId[id]; },
    cart: getCart,
    wish: getWish,
    promo: getPromo,
    fmt: fmt,

    WEIGHTS: WEIGHTS,
    key: lineKey,
    lineId: function (key) { return splitKey(key).id; },
    lineWeight: weightOf,
    linePrice: priceOf,

    cartCount: function () {
      var c = getCart(), n = 0; for (var k in c) n += c[k]; return n;
    },
    addToCart: function (id, qty, weight) {
      qty = qty || 1; var key = lineKey(id, weight); var c = getCart(); c[key] = (c[key] || 0) + qty; write(CK, c);
      this.updateBadge();
      this.toast((byId[id] ? byId[id].name : 'Item') + (weight ? ' (' + weight + ')' : '') + ' added to cart');
    },
    setQty: function (key, qty) {
      var c = getCart(); if (qty <= 0) delete c[key]; else c[key] = qty; write(CK, c); this.updateBadge();
    },
    removeFromCart: function (key) { var c = getCart(); delete c[key]; write(CK, c); this.updateBadge(); },
    clearCart: function () { write(CK, {}); this.updateBadge(); },

    inWish: function (id) { return getWish().indexOf(id) !== -1; },
    toggleWish: function (id) {
      var w = getWish(), i = w.indexOf(id);
      if (i === -1) { w.push(id); this.toast('Saved to wishlist'); }
      else { w.splice(i, 1); this.toast('Removed from wishlist'); }
      write(WK, w); return i === -1;
    },

    setPromo: function (code) {
      code = (code || '').trim().toUpperCase();
      if (!PROMOS[code]) return { ok: false, msg: 'Invalid code "' + code + '"' };
      var sub = this.subtotal();
      if (sub < PROMOS[code].min) return { ok: false, msg: 'Spend ' + fmt(PROMOS[code].min) + ' to use ' + code };
      localStorage.setItem(PK, code);
      return { ok: true, msg: code + ' applied — ' + PROMOS[code].label + '!' };
    },
    clearPromo: function () { localStorage.removeItem(PK); },

    subtotal: function () {
      var c = getCart(), s = 0; for (var k in c) s += priceOf(k) * c[k]; return s;
    },
    totals: function () {
      var sub = this.subtotal();
      var code = getPromo(), promo = code ? PROMOS[code] : null;
      var shipping = sub === 0 ? 0 : (sub >= 599 ? 0 : 49);
      var discount = 0;
      if (promo) {
        if (promo.type === 'percent') discount = Math.round(sub * promo.value / 100);
        else if (promo.type === 'flat') discount = promo.value;
        else if (promo.type === 'ship') shipping = 0;
      }
      discount = Math.min(discount, sub);
      return { subtotal: sub, shipping: shipping, discount: discount, code: code,
               total: Math.max(0, sub - discount + shipping) };
    },

    /* cart-count bubble on the 🛒 header icon */
    updateBadge: function () {
      var n = this.cartCount();
      document.querySelectorAll('[data-ico="cart.html"]').forEach(function (el) {
        el.style.position = 'relative';
        var b = el.querySelector('.bij-badge');
        if (!n) { if (b) b.remove(); return; }
        if (!b) {
          b = document.createElement('span'); b.className = 'bij-badge';
          b.style.cssText = 'position:absolute;top:-8px;right:-10px;min-width:16px;height:16px;padding:0 4px;'
            + 'background:#c0392b;color:#fff;font-size:10px;font-weight:800;border-radius:999px;'
            + 'display:grid;place-items:center;line-height:1;font-family:Plus Jakarta Sans,sans-serif';
          el.appendChild(b);
        }
        b.textContent = n;
      });
    },

    toast: function (msg) {
      var t = document.createElement('div');
      t.className = 'bij-toast';
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(function () { t.classList.add('show'); });
      setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2200);
    }
  };

  // shared CSS: toast, animations, hover lift, heart states
  var css = document.createElement('style');
  css.textContent =
    '.bij-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#21303a;color:#fff;'
    + 'font:600 13px/1 "Plus Jakarta Sans",sans-serif;padding:13px 20px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.22);'
    + 'opacity:0;transition:.3s;z-index:9999;pointer-events:none}'
    + '.bij-toast.show{opacity:1;transform:translate(-50%,0)}'
    + '@keyframes bijUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
    + '@keyframes bijPop{0%{transform:scale(1)}45%{transform:scale(1.32)}100%{transform:scale(1)}}'
    + 'section.screen{animation:bijUp .5s ease both}'
    + '.bij-card{transition:transform .18s ease,box-shadow .18s ease}'
    + '.bij-card:hover{transform:translateY(-4px);box-shadow:0 10px 26px rgba(33,48,58,.14)}'
    + '.bij-pop{animation:bijPop .35s ease}'
    + '.bij-btn{transition:transform .12s ease,opacity .15s ease}'
    + '.bij-btn:active{transform:scale(.96)}'
    + 'input,textarea,select{font-family:"Plus Jakarta Sans",sans-serif}'
    + 'input:focus,textarea:focus,select:focus{outline:none;border-color:#355a6e !important;box-shadow:0 0 0 3px rgba(53,90,110,.12)}'
    + '.bij-marquee{overflow:hidden;white-space:nowrap}'
    + '.bij-marquee-track{display:inline-block;white-space:nowrap;animation:bijMarquee 26s linear infinite;will-change:transform}'
    + '.bij-marquee:hover .bij-marquee-track{animation-play-state:paused}'
    + '@keyframes bijMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
    + '.bij-fade{animation:bijUp .35s ease both}';
  document.head.appendChild(css);

  window.Store = Store;
})();
