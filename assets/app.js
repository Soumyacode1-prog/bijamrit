/* Bijamrit — page controllers. Renders dynamic regions from window.Store. */
(function () {
  var S = window.Store;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var section = $('section.screen');
  var page = section ? section.getAttribute('data-screen-label') : '';

  function fmt(n) { return S.fmt(n); }
  function qs(name) { return new URLSearchParams(location.search).get(name); }

  /* ---------- reusable card markup ---------- */
  function heartSpan(p) {
    var on = S.inWish(p.id);
    return '<span class="wish bij-btn" data-id="' + p.id + '" title="Wishlist" '
      + 'style="position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#fff;'
      + 'display:grid;place-items:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.1);cursor:pointer;'
      + 'color:' + (on ? '#c0392b' : '#1b1b16') + '">' + (on ? '♥' : '♡') + '</span>';
  }
  function priceHtml(p, size) {
    size = size || 14;
    return '<div style="font-size:' + size + 'px;font-weight:800">' + fmt(p.price)
      + (p.old ? ' <span style="font-size:11px;color:#a8a496;text-decoration:line-through;font-weight:500">' + fmt(p.old) + '</span>' : '')
      + '</div>';
  }
  function shopCard(p) {
    return '<div class="bij-card prod" data-id="' + p.id + '" style="border:1px solid #e4ebec;border-radius:18px;overflow:hidden;cursor:pointer">'
      + '<div style="position:relative"><img src="' + p.img + '" style="width:100%;height:170px;object-fit:cover">'
      + (p.badge ? '<span style="position:absolute;top:10px;left:10px;background:' + (p.badge === 'New' ? '#c98a3a' : '#355a6e') + ';color:#fff;font-size:10px;font-weight:700;padding:4px 9px;border-radius:999px">' + p.badge + '</span>' : '')
      + heartSpan(p) + '</div>'
      + '<div style="padding:14px"><div style="font-size:11px;color:#d4a017;font-weight:700">★ ' + p.rating.toFixed(1) + ' (' + p.reviews + ')</div>'
      + '<div style="font-size:14px;font-weight:700;margin-top:5px">' + p.name + '</div>'
      + '<div style="font-size:11px;color:#8a8678">' + p.weight + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">' + priceHtml(p)
      + '<span class="add bij-btn" data-id="' + p.id + '" title="Add to cart" style="width:30px;height:30px;border-radius:50%;background:#355a6e;color:#fff;display:grid;place-items:center;font-size:16px;cursor:pointer">+</span>'
      + '</div></div></div>';
  }

  /* delegate clicks on a product grid: card -> product, +/heart -> action */
  function bindGrid(root) {
    root.addEventListener('click', function (e) {
      var add = e.target.closest('.add');
      if (add) { e.stopPropagation(); S.addToCart(add.dataset.id); add.classList.remove('bij-pop'); void add.offsetWidth; add.classList.add('bij-pop'); return; }
      var w = e.target.closest('.wish');
      if (w) {
        e.stopPropagation();
        var on = S.toggleWish(w.dataset.id);
        w.textContent = on ? '♥' : '♡'; w.style.color = on ? '#c0392b' : '#1b1b16';
        w.classList.remove('bij-pop'); void w.offsetWidth; w.classList.add('bij-pop');
        return;
      }
      var card = e.target.closest('.prod');
      if (card) location.href = 'product.html?id=' + card.dataset.id;
    });
  }

  /* ===================== SHOP ===================== */
  function initShop() {
    var host = $('#shop-app'); if (!host) return;
    var state = { cats: [], minP: 99, maxP: 1699, minR: 0, sort: 'featured' };

    function filtered() {
      var list = S.PRODUCTS.filter(function (p) {
        if (state.cats.length && state.cats.indexOf(p.cat) === -1) return false;
        if (p.price < state.minP || p.price > state.maxP) return false;
        if (p.rating < state.minR) return false;
        return true;
      });
      var s = state.sort;
      if (s === 'low') list.sort(function (a, b) { return a.price - b.price; });
      else if (s === 'high') list.sort(function (a, b) { return b.price - a.price; });
      else if (s === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
      return list;
    }

    function box(checked) {
      return '<span class="cbox" style="width:16px;height:16px;border-radius:5px;flex:none;border:1.5px solid '
        + (checked ? '#355a6e;background:#355a6e' : '#c2d3d6') + ';display:inline-block"></span>';
    }

    function render() {
      var list = filtered();
      var cats = ['Raw', 'Roasted', 'Flavoured', 'Combo'];
      host.innerHTML =
        '<div style="display:grid;grid-template-columns:250px 1fr;gap:32px;padding:32px 40px 48px">'
        // ---- filters ----
        + '<div><div style="font-weight:800;font-size:14px;margin-bottom:14px">Filters</div>'
        + '<div style="border-bottom:1px solid #e4ebec;padding-bottom:18px;margin-bottom:18px">'
        + '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a8678;margin-bottom:12px">Category</div>'
        + '<div style="display:flex;flex-direction:column;gap:11px;font-size:13px;color:#4c4c45">'
        + '<label class="cat" data-cat="" style="display:flex;gap:9px;align-items:center;cursor:pointer">' + box(state.cats.length === 0) + 'All Makhana</label>'
        + cats.map(function (c) { return '<label class="cat" data-cat="' + c + '" style="display:flex;gap:9px;align-items:center;cursor:pointer">' + box(state.cats.indexOf(c) !== -1) + c + '</label>'; }).join('')
        + '</div></div>'
        // price
        + '<div style="border-bottom:1px solid #e4ebec;padding-bottom:18px;margin-bottom:18px">'
        + '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a8678;margin-bottom:12px">Price</div>'
        + '<div class="rangewrap" style="position:relative;height:26px;margin:6px 4px">'
        + '<div style="position:absolute;top:11px;left:0;right:0;height:4px;background:#e4e3da;border-radius:999px"></div>'
        + '<div id="pfill" style="position:absolute;top:11px;height:4px;background:#355a6e;border-radius:999px"></div>'
        + '<input id="pmin" type="range" min="99" max="1699" step="10" value="' + state.minP + '">'
        + '<input id="pmax" type="range" min="99" max="1699" step="10" value="' + state.maxP + '"></div>'
        + '<div style="display:flex;justify-content:space-between;font-size:12px;color:#6b6b62;font-weight:600"><span id="plmin">' + fmt(state.minP) + '</span><span id="plmax">' + fmt(state.maxP) + '</span></div></div>'
        // rating
        + '<div><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a8678;margin-bottom:12px">Rating</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:#4c4c45">'
        + '<label class="rate" data-r="4.5" style="display:flex;gap:9px;align-items:center;cursor:pointer">' + box(state.minR === 4.5) + '<span style="color:#d4a017">★★★★★</span> &amp; up</label>'
        + '<label class="rate" data-r="4" style="display:flex;gap:9px;align-items:center;cursor:pointer">' + box(state.minR === 4) + '<span style="color:#d4a017">★★★★</span>☆ &amp; up</label>'
        + '</div></div></div>'
        // ---- grid ----
        + '<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
        + '<div style="font-size:13px;color:#8a8678">Showing ' + list.length + ' of ' + S.PRODUCTS.length + '</div>'
        + '<select id="sort" style="border:1px solid #e4e3da;border-radius:999px;font-size:13px;font-weight:600;padding:9px 16px;color:#4c4c45;background:#fff;cursor:pointer">'
        + '<option value="featured">Sort: Featured</option><option value="low">Price: Low → High</option><option value="high">Price: High → Low</option><option value="rating">Top rated</option></select></div>'
        + (list.length
            ? '<div id="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">' + list.map(shopCard).join('') + '</div>'
            : '<div style="text-align:center;padding:60px 20px;color:#8a8678"><div style="font-size:40px">🪶</div><div style="margin-top:10px;font-weight:600">No snacks match these filters yet.</div></div>')
        + '</div></div>';

      $('#sort').value = state.sort;
      bindControls();
      var grid = $('#grid'); if (grid) bindGrid(grid);
    }

    function bindControls() {
      host.querySelectorAll('.cat').forEach(function (l) {
        l.onclick = function () {
          var c = l.dataset.cat;
          if (!c) state.cats = [];
          else { var i = state.cats.indexOf(c); if (i === -1) state.cats.push(c); else state.cats.splice(i, 1); }
          render();
        };
      });
      host.querySelectorAll('.rate').forEach(function (l) {
        l.onclick = function () { var r = parseFloat(l.dataset.r); state.minR = (state.minR === r ? 0 : r); render(); };
      });
      var pmin = $('#pmin'), pmax = $('#pmax'), fill = $('#pfill');
      function paint() {
        var lo = Math.min(+pmin.value, +pmax.value), hi = Math.max(+pmin.value, +pmax.value);
        var span = 1699 - 99;
        fill.style.left = ((lo - 99) / span * 100) + '%';
        fill.style.right = ((1699 - hi) / span * 100) + '%';
        $('#plmin').textContent = fmt(lo); $('#plmax').textContent = fmt(hi);
      }
      function commit() { state.minP = Math.min(+pmin.value, +pmax.value); state.maxP = Math.max(+pmin.value, +pmax.value); render(); }
      pmin.oninput = pmax.oninput = paint;
      pmin.onchange = pmax.onchange = commit;
      paint();
      $('#sort').onchange = function () { state.sort = this.value; render(); };
    }

    // range slider styling
    var st = document.createElement('style');
    st.textContent = '.rangewrap input[type=range]{-webkit-appearance:none;appearance:none;position:absolute;top:8px;left:0;width:100%;height:10px;background:none;pointer-events:none;margin:0}'
      + '.rangewrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #355a6e;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.2)}'
      + '.rangewrap input[type=range]::-moz-range-thumb{pointer-events:auto;width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #355a6e;cursor:pointer}';
    document.head.appendChild(st);
    render();
  }

  /* ===================== CART ===================== */
  function initCart() {
    var host = $('#cart-app'); if (!host) return;
    var head = $('#cart-count');
    function render() {
      var c = S.cart(), keys = Object.keys(c).filter(function (k) { return S.get(S.lineId(k)); });
      var t = S.totals();
      if (head) head.textContent = S.cartCount() + ' item' + (S.cartCount() === 1 ? '' : 's');
      if (!keys.length) {
        host.innerHTML = '<div style="padding:20px 0 60px;text-align:center;color:#8a8678">'
          + '<div style="font-size:46px">🛒</div><div style="margin-top:12px;font-weight:600">Your cart is empty.</div>'
          + '<div data-go="shop.html" class="bij-btn" style="display:inline-block;margin-top:18px;background:#355a6e;color:#fff;font-weight:700;font-size:14px;padding:13px 26px;border-radius:999px;cursor:pointer">Shop now</div></div>';
        wireGo(); return;
      }
      var rows = keys.map(function (key, i) {
        var p = S.get(S.lineId(key)), q = c[key], unit = S.linePrice(key), w = S.lineWeight(key);
        return '<div style="display:flex;gap:16px;align-items:center;padding:18px 0;border-top:1px solid #e4ebec' + (i === keys.length - 1 ? ';border-bottom:1px solid #e4ebec' : '') + '">'
          + '<img src="' + p.img + '" style="width:90px;height:90px;object-fit:cover;border-radius:14px">'
          + '<div style="flex:1"><div style="font-size:15px;font-weight:700">' + p.name + '</div>'
          + '<div style="font-size:12px;color:#8a8678;margin-top:2px">' + w + ' · ' + fmt(unit) + ' each</div>'
          + '<div style="display:flex;align-items:center;border:1px solid #e4e3da;border-radius:10px;width:fit-content;margin-top:10px">'
          + '<span class="qmin bij-btn" data-id="' + key + '" style="padding:7px 12px;font-size:14px;color:#6b6b62;cursor:pointer">−</span>'
          + '<span style="padding:7px 12px;font-size:13px;font-weight:700">' + q + '</span>'
          + '<span class="qplus bij-btn" data-id="' + key + '" style="padding:7px 12px;font-size:14px;color:#6b6b62;cursor:pointer">+</span></div></div>'
          + '<div style="text-align:right"><div style="font-size:16px;font-weight:800">' + fmt(unit * q) + '</div>'
          + '<div class="rem bij-btn" data-id="' + key + '" style="font-size:12px;color:#a8a496;margin-top:8px;cursor:pointer">Remove</div></div></div>';
      }).join('');

      var promoNote = t.code ? '<div style="font-size:12px;color:#355a6e;font-weight:700;margin-top:8px">✓ ' + t.code + ' applied · <span id="rmpromo" style="cursor:pointer;text-decoration:underline">remove</span></div>' : '';
      host.innerHTML =
        '<div style="display:grid;grid-template-columns:1fr 360px;gap:32px"><div>' + rows
        + '<div style="display:flex;gap:10px;margin-top:22px"><input id="promo" placeholder="Discount code" value="" '
        + 'style="flex:1;border:1px solid #e4e3da;border-radius:12px;font-size:13px;padding:14px 16px"/>'
        + '<div id="applypromo" class="bij-btn" style="background:#2c2c28;color:#fff;font-size:13px;font-weight:700;padding:14px 24px;border-radius:12px;cursor:pointer">Apply</div></div>'
        + promoNote + '<div style="font-size:11px;color:#8a8678;margin-top:10px">Try '
        + '<b data-copy="WELCOME10" style="color:#355a6e">WELCOME10</b>, '
        + '<b data-copy="SAVE150" style="color:#355a6e">SAVE150</b> or '
        + '<b data-copy="FREESHIP" style="color:#355a6e">FREESHIP</b></div></div>'
        // summary
        + '<div style="background:#eef4f4;border-radius:18px;padding:26px;height:fit-content">'
        + '<div style="font-size:16px;font-weight:800;margin-bottom:18px">Order summary</div>'
        + sumRow('Subtotal', fmt(t.subtotal))
        + sumRow('Shipping', t.shipping === 0 ? '<span style="color:#355a6e">Free</span>' : fmt(t.shipping))
        + sumRow('Discount', t.discount ? '−' + fmt(t.discount) : '₹0')
        + '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;padding-top:14px;border-top:1px solid #e0e0d6;margin-top:6px"><span>Total</span><span>' + fmt(t.total) + '</span></div>'
        + '<div data-go="checkout.html" class="bij-btn" style="background:#355a6e;color:#fff;font-size:15px;font-weight:700;padding:15px;border-radius:12px;text-align:center;margin-top:20px;cursor:pointer">Checkout</div>'
        + '<div style="text-align:center;font-size:12px;color:#8a8678;margin-top:14px">🔒 Secure checkout · Taxes included</div></div></div>';

      host.querySelectorAll('.qplus').forEach(function (b) { b.onclick = function () { S.setQty(b.dataset.id, (S.cart()[b.dataset.id] || 0) + 1); render(); }; });
      host.querySelectorAll('.qmin').forEach(function (b) { b.onclick = function () { S.setQty(b.dataset.id, (S.cart()[b.dataset.id] || 0) - 1); render(); }; });
      host.querySelectorAll('.rem').forEach(function (b) { b.onclick = function () { S.removeFromCart(b.dataset.id); render(); }; });
      var ap = $('#applypromo'); if (ap) ap.onclick = function () { var r = S.setPromo($('#promo').value); S.toast(r.msg); if (r.ok) render(); };
      var rp = $('#rmpromo'); if (rp) rp.onclick = function () { S.clearPromo(); render(); };
      wireGo(); wireCopy();
    }
    function sumRow(l, v) { return '<div style="display:flex;justify-content:space-between;font-size:13px;color:#4c4c45;margin-bottom:12px"><span>' + l + '</span><span style="font-weight:700">' + v + '</span></div>'; }
    render();
  }

  /* ===================== CHECKOUT ===================== */
  function initCheckout() {
    var host = $('#checkout-app'); if (!host) return;
    var c = S.cart(), ids = Object.keys(c).filter(function (k) { return S.get(S.lineId(k)); }), t = S.totals();
    var inp = function (id, ph, type) { return '<input id="' + id + '" type="' + (type || 'text') + '" placeholder="' + ph + '" style="border:1px solid #e4e3da;border-radius:12px;padding:14px 16px;font-size:13px;width:100%"/>'; };
    var pay = function (sel, label, on) {
      return '<label style="border:' + (on ? '1.5px solid #355a6e' : '1px solid #e4e3da') + ';border-radius:12px;padding:16px;margin-bottom:10px;display:flex;align-items:center;gap:10px;cursor:pointer">'
        + '<input type="radio" name="pay" value="' + sel + '"' + (on ? ' checked' : '') + ' style="accent-color:#355a6e">'
        + '<span style="font-size:14px;font-weight:' + (on ? '700' : '600') + ';color:' + (on ? '#1b1b16' : '#6b6b62') + '">' + label + '</span></label>';
    };
    var summaryItems = ids.length ? ids.map(function (key) {
      var p = S.get(S.lineId(key)), q = c[key], unit = S.linePrice(key), w = S.lineWeight(key);
      return '<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px"><img src="' + p.img + '" style="width:54px;height:54px;object-fit:cover;border-radius:10px">'
        + '<div style="flex:1;font-size:13px;font-weight:700">' + p.name + ' <span style="color:#8a8678;font-weight:500">' + w + ' ×' + q + '</span></div>'
        + '<div style="font-size:13px;font-weight:700">' + fmt(unit * q) + '</div></div>';
    }).join('') : '<div style="font-size:13px;color:#8a8678;margin-bottom:14px">Your cart is empty.</div>';

    host.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 400px;gap:0"><div style="padding:36px 40px">'
      + '<div style="font-size:12px;color:#8a8678;margin-bottom:24px"><span data-go="cart.html" style="color:#355a6e;font-weight:700;cursor:pointer">Cart</span> › <span style="color:#355a6e;font-weight:700">Information</span> › Shipping › Payment</div>'
      + '<div style="font-size:18px;font-weight:800;margin-bottom:16px">Contact</div>' + inp('co-email', 'Email address', 'email')
      + '<div style="font-size:18px;font-weight:800;margin:26px 0 16px">Shipping address</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' + inp('co-first', 'First name') + inp('co-last', 'Last name') + '</div>'
      + inp('co-addr', 'Address') + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0 26px">' + inp('co-city', 'City') + inp('co-state', 'State') + inp('co-pin', 'PIN') + '</div>'
      + '<div style="font-size:18px;font-weight:800;margin-bottom:16px">Payment</div>'
      + pay('upi', 'UPI / GPay / PhonePe', true) + pay('card', 'Credit / Debit card', false) + pay('cod', 'Cash on delivery', false)
      + '<div id="paybtn" class="bij-btn" style="background:#355a6e;color:#fff;font-size:15px;font-weight:700;padding:16px;border-radius:12px;text-align:center;margin-top:26px;cursor:pointer">Pay ' + fmt(t.total) + '</div></div>'
      // summary
      + '<div style="background:#eef4f4;padding:36px 32px"><div style="font-size:16px;font-weight:800;margin-bottom:18px">Order summary</div>'
      + summaryItems + '<div style="border-top:1px solid #e0e0d6;padding-top:16px"></div>'
      + crow('Subtotal', fmt(t.subtotal)) + crow('Shipping', t.shipping === 0 ? '<span style="color:#355a6e">Free</span>' : fmt(t.shipping)) + crow('Discount', t.discount ? '−' + fmt(t.discount) : '₹0')
      + '<div style="display:flex;justify-content:space-between;font-size:17px;font-weight:800;padding-top:14px;border-top:1px solid #e0e0d6;margin-top:6px"><span>Total</span><span>' + fmt(t.total) + '</span></div></div></div>';

    function crow(l, v) { return '<div style="display:flex;justify-content:space-between;font-size:13px;color:#4c4c45;margin-bottom:10px"><span>' + l + '</span><span style="font-weight:700">' + v + '</span></div>'; }

    $('#paybtn').onclick = function () {
      if (!ids.length) { S.toast('Your cart is empty'); return; }
      var email = $('#co-email').value.trim();
      if (!email || email.indexOf('@') === -1) { S.toast('Please enter a valid email'); $('#co-email').focus(); return; }
      if (!$('#co-first').value.trim() || !$('#co-addr').value.trim()) { S.toast('Please complete your shipping address'); return; }
      S.clearCart(); S.clearPromo();
      document.body.insertAdjacentHTML('beforeend',
        '<div id="ok" style="position:fixed;inset:0;background:rgba(33,48,58,.6);display:grid;place-items:center;z-index:9999;animation:bijUp .3s both">'
        + '<div style="background:#fff;border-radius:20px;padding:46px 40px;text-align:center;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,.3)">'
        + '<div style="font-size:54px">🎉</div><h2 style="font-family:Instrument Serif,serif;font-size:30px;margin:14px 0 6px">Order placed!</h2>'
        + '<p style="font-size:14px;color:#6b6b62;line-height:1.6">Thank you for shopping with Bijamrit 🪶<br>A confirmation is on its way to ' + email + '.</p>'
        + '<div data-go="index.html" class="bij-btn" style="background:#355a6e;color:#fff;font-weight:700;font-size:14px;padding:13px 28px;border-radius:999px;margin-top:22px;display:inline-block;cursor:pointer">Back to home</div></div></div>');
      wireGo();
    };
    wireGo();
  }

  /* ===================== WISHLIST ===================== */
  function initWishlist() {
    var host = $('#wishlist-app'); if (!host) return;
    var head = $('#wish-count');
    function render() {
      var w = S.wish().filter(function (id) { return S.get(id); });
      if (head) head.textContent = w.length + ' saved item' + (w.length === 1 ? '' : 's');
      if (!w.length) {
        host.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 0 60px;color:#8a8678">'
          + '<div style="font-size:46px">♡</div><div style="margin-top:12px;font-weight:600">No saved items yet.</div>'
          + '<div data-go="shop.html" class="bij-btn" style="display:inline-block;margin-top:18px;background:#355a6e;color:#fff;font-weight:700;font-size:14px;padding:13px 26px;border-radius:999px;cursor:pointer">Browse shop</div></div>';
        wireGo(); return;
      }
      host.innerHTML = w.map(function (id) {
        var p = S.get(id);
        return '<div class="bij-card prod" data-id="' + id + '" style="border:1px solid #e4ebec;border-radius:18px;overflow:hidden;cursor:pointer">'
          + '<div style="position:relative"><img src="' + p.img + '" style="width:100%;height:170px;object-fit:cover">'
          + '<span class="wish bij-btn" data-id="' + id + '" style="position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.1);color:#c0392b;cursor:pointer">♥</span></div>'
          + '<div style="padding:14px"><div style="font-size:14px;font-weight:700">' + p.name + '</div>' + priceHtml(p)
          + '<div class="add bij-btn" data-id="' + id + '" style="background:#355a6e;color:#fff;font-size:12px;font-weight:700;padding:10px;border-radius:10px;text-align:center;margin-top:12px;cursor:pointer">Add to cart</div></div></div>';
      }).join('');
      // bind: remove from wishlist re-renders
      host.querySelectorAll('.wish').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); S.toggleWish(b.dataset.id); render(); }; });
      host.querySelectorAll('.add').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); S.addToCart(b.dataset.id); }; });
      host.querySelectorAll('.prod').forEach(function (c) { c.onclick = function () { location.href = 'product.html?id=' + c.dataset.id; }; });
    }
    render();
  }

  /* ===================== SEARCH ===================== */
  function initSearch() {
    var host = $('#search-app'); if (!host) return;
    var old = $('#search-old'); if (old) old.remove();
    var POP = ['Classic', 'Gift hampers', 'Cheese', 'Under ₹250'];
    function results(qstr) {
      var q = qstr.trim().toLowerCase();
      if (!q) return S.PRODUCTS.slice();
      if (q === 'under ₹250' || q === 'under 250') return S.PRODUCTS.filter(function (p) { return p.price < 250; });
      if (q === 'gift hampers') return S.PRODUCTS.filter(function (p) { return p.cat === 'Combo'; });
      return S.PRODUCTS.filter(function (p) { return (p.name + ' ' + p.cat).toLowerCase().indexOf(q) !== -1; });
    }
    function draw(qstr) {
      var list = results(qstr);
      host.innerHTML =
        '<div style="padding:40px 40px 24px">'
        + '<div style="display:flex;align-items:center;gap:12px;border:1.5px solid #355a6e;border-radius:14px;padding:14px 20px">'
        + '<span style="font-size:18px;color:#8a8678">🔍</span>'
        + '<input id="sq" value="' + qstr.replace(/"/g, '&quot;') + '" placeholder="Search makhana…" style="border:none;font-size:16px;color:#2c2c28;font-weight:600;flex:1;background:none">'
        + '<span id="sclear" style="font-size:18px;color:#a8a496;cursor:pointer">✕</span></div>'
        + '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><span style="font-size:12px;color:#8a8678;font-weight:600">Popular:</span>'
        + POP.map(function (t) { return '<span class="pop bij-btn" style="background:#eef4f4;font-size:12px;font-weight:600;padding:6px 13px;border-radius:999px;cursor:pointer">' + t + '</span>'; }).join('') + '</div></div>'
        + '<div style="padding:8px 40px 48px"><div style="font-size:13px;color:#8a8678;margin-bottom:18px">' + list.length + ' result' + (list.length === 1 ? '' : 's') + (qstr.trim() ? ' for "<span style="color:#2c2c28;font-weight:700">' + qstr.trim() + '</span>"' : '') + '</div>'
        + (list.length ? '<div id="sgrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px">' + list.map(shopCard).join('') + '</div>'
                       : '<div style="text-align:center;padding:40px;color:#8a8678">No matches — try “classic”, “cheese” or “gift”.</div>') + '</div>';
      var sq = $('#sq'); sq.oninput = function () { var v = this.value, p = this.selectionStart; draw(v); var n = $('#sq'); n.focus(); try { n.setSelectionRange(p, p); } catch (e) {} };
      $('#sclear').onclick = function () { draw(''); $('#sq').focus(); };
      host.querySelectorAll('.pop').forEach(function (b) { b.onclick = function () { draw(b.textContent); }; });
      var g = $('#sgrid'); if (g) bindGrid(g);
    }
    draw('peri peri');
  }

  /* ===================== PRODUCT ===================== */
  function initProduct() {
    if (page !== 'Product Detail') return;
    var p = S.get(qs('id')) || S.get('classic');
    var qty = 1;
    // populate fields
    var crumb = $('#pd-crumb'); if (crumb) crumb.textContent = 'Home / Shop / ' + p.name;
    var tag = $('#pd-tag'); if (tag) tag.textContent = p.name;
    var title = $('#pd-title'); if (title) title.textContent = p.name;
    var rate = $('#pd-rate'); if (rate) rate.textContent = p.rating.toFixed(1) + ' · ' + p.reviews + ' reviews';
    document.querySelectorAll('.pd-img').forEach(function (im) { im.src = p.img; });

    // --- weight / size selection ---
    var SIZES = S.WEIGHTS.map(function (w) { return w.label; });   // ['100g','250g','500g']
    var selected = SIZES.indexOf(p.weight) !== -1 ? p.weight : '100g';
    var priceEl = $('#pd-price'), oldEl = $('#pd-old'), save = $('#pd-save'), sizes = $('#pd-sizes');
    // a weight is a "variant" (cart suffix) only when it differs from the product's listed weight
    function keyFor(w) { return S.key(p.id, w === p.weight ? null : w); }
    function unitFor(w) { return S.linePrice(keyFor(w)); }

    function paintPrice() {
      var price = unitFor(selected);
      if (priceEl) priceEl.textContent = fmt(price);
      var ratio = p.price ? price / p.price : 1;
      var oldScaled = p.old ? Math.round(p.old * ratio / 5) * 5 : 0;
      if (oldEl) { oldEl.style.display = oldScaled ? '' : 'none'; oldEl.textContent = oldScaled ? fmt(oldScaled) : ''; }
      if (save) { var pct = oldScaled ? Math.round((1 - price / oldScaled) * 100) : 0; save.style.display = pct ? '' : 'none'; save.textContent = 'Save ' + pct + '%'; }
    }
    if (sizes) {
      sizes.innerHTML = SIZES.map(function (w) {
        var on = w === selected;
        return '<span class="pd-size bij-btn" data-w="' + w + '" style="cursor:pointer;border:1.5px solid ' + (on ? '#355a6e' : '#e4e3da')
          + ';color:' + (on ? '#355a6e' : '#6b6b62') + ';font-size:13px;font-weight:' + (on ? '700' : '600') + ';padding:9px 18px;border-radius:10px">' + w + '</span>';
      }).join('');
      sizes.querySelectorAll('.pd-size').forEach(function (s) {
        s.onclick = function () {
          selected = s.dataset.w;
          sizes.querySelectorAll('.pd-size').forEach(function (x) {
            var on = x.dataset.w === selected;
            x.style.border = '1.5px solid ' + (on ? '#355a6e' : '#e4e3da');
            x.style.color = on ? '#355a6e' : '#6b6b62'; x.style.fontWeight = on ? '700' : '600';
          });
          paintPrice();
        };
      });
    }
    paintPrice();

    var qEl = $('#pd-qty');
    var minus = $('#pd-minus'), plus = $('#pd-plus');
    if (minus) minus.onclick = function () { qty = Math.max(1, qty - 1); if (qEl) qEl.textContent = qty; };
    if (plus) plus.onclick = function () { qty = qty + 1; if (qEl) qEl.textContent = qty; };
    var add = $('#pd-add'); if (add) add.onclick = function () { S.addToCart(p.id, qty, selected === p.weight ? null : selected); };
    var wish = $('#pd-wish');
    if (wish) {
      var sync = function () { var on = S.inWish(p.id); wish.textContent = on ? '♥' : '♡'; wish.style.color = on ? '#c0392b' : '#1b1b16'; };
      sync(); wish.onclick = function () { S.toggleWish(p.id); sync(); wish.classList.remove('bij-pop'); void wish.offsetWidth; wish.classList.add('bij-pop'); };
    }
  }

  /* ===================== HOME ===================== */
  /* Real makhana videos (YouTube), matched to the card titles in DOM order:
     1) harvesting  2) flavour/roasting kitchen  3) makhana superfood story */
  var VIDEOS = ['8DTlI5-VPRI', 'mSIMEVy3TSo', 'EhLDeKS96DI'];
  function initHome() {
    if (page !== 'Home') return;
    var byName = {}; S.PRODUCTS.forEach(function (p) { byName[p.name] = p; });

    // 1) featured product "+" add-to-cart (matched by the card's product name)
    document.querySelectorAll('span').forEach(function (span) {
      if (span.textContent.trim() !== '+' || !/background:#355a6e/.test(span.getAttribute('style') || '')) return;
      var card = span.closest('div[style*="border-radius:18px"]'); if (!card) return;
      var name = ''; card.querySelectorAll('div').forEach(function (d) { var t = d.textContent.trim(); if (byName[t]) name = t; });
      var p = byName[name]; if (!p) return;
      span.classList.add('bij-btn'); span.style.cursor = 'pointer';
      span.addEventListener('click', function (e) {
        e.stopPropagation(); S.addToCart(p.id);
        span.classList.remove('bij-pop'); void span.offsetWidth; span.classList.add('bij-pop');
      });
    });

    // 2) video cards (cards containing a ▶ play overlay) -> modal player
    var vi = 0;
    document.querySelectorAll('span').forEach(function (sp) {
      if (sp.textContent.trim() !== '▶') return;
      var card = sp.closest('div[style*="height:200px"]') || sp.parentElement;
      if (!card) return;
      var titleEl = card.querySelector('div[style*="font-weight:700"]');
      var title = titleEl ? titleEl.textContent.trim() : 'Bijamrit';
      var src = VIDEOS[vi % VIDEOS.length]; vi++;
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () { openVideo(src, title); });
    });
  }
  function openVideo(ytid, title) {
    var watch = 'https://www.youtube.com/watch?v=' + ytid;
    var m = document.createElement('div');
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.82);display:grid;place-items:center;z-index:9999;padding:20px;animation:bijUp .25s both';
    m.innerHTML = '<div style="width:min(900px,100%);background:#000;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#21303a;color:#fff;font:700 14px Plus Jakarta Sans,sans-serif">'
      + '<span>' + title + '</span>'
      + '<span style="display:flex;align-items:center;gap:14px"><a href="' + watch + '" target="_blank" rel="noopener" style="color:#a9cdd6;font-size:12px;font-weight:700;text-decoration:none">Watch on YouTube ↗</a>'
      + '<span id="vx" style="cursor:pointer;font-size:20px">✕</span></span></div>'
      + '<div style="position:relative;width:100%;padding-top:56.25%;background:#000">'
      + '<iframe src="https://www.youtube-nocookie.com/embed/' + ytid + '?autoplay=1&rel=0&modestbranding=1" '
      + 'style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div></div>';
    document.body.appendChild(m);
    var close = function () { m.remove(); };
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    $('#vx', m).onclick = close;
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  }

  /* ===================== CONTACT ===================== */
  function initContact() {
    if (page !== 'Contact') return;
    var btn = $('#ct-send');
    if (btn) btn.onclick = function () {
      var n = $('#ct-name'), e = $('#ct-email'), msg = $('#ct-msg');
      if (!n.value.trim()) { S.toast('Please tell us your name'); n.focus(); return; }
      if (!e.value.trim() || e.value.indexOf('@') === -1) { S.toast('Please enter a valid email'); e.focus(); return; }
      if (!msg.value.trim()) { S.toast('Please write a message'); msg.focus(); return; }
      n.value = ''; e.value = ''; msg.value = '';
      S.toast('Thanks ' + '— we\'ll get back to you soon! 🪶');
    };
  }

  /* ---------- copy-to-clipboard ---------- */
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      try { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); ta.remove(); res(); }
      catch (e) { rej(e); }
    });
  }
  /* wire any element with data-copy="CODE" to copy on click + show feedback */
  function wireCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (el) {
      if (el.dataset.copywired) return; el.dataset.copywired = '1';
      el.style.cursor = 'pointer'; el.title = 'Click to copy';
      el.classList.add('bij-btn');
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var code = el.getAttribute('data-copy');
        copyText(code).then(function () {
          S.toast('Copied “' + code + '” — paste it at checkout!');
          var prev = el.innerHTML; el.innerHTML = 'Copied ✓';
          el.classList.remove('bij-pop'); void el.offsetWidth; el.classList.add('bij-pop');
          setTimeout(function () { el.innerHTML = prev; }, 1400);
        }).catch(function () { S.toast('Copy failed — your code is ' + code); });
      });
    });
  }

  /* ===================== OFFERS ===================== */
  function initOffers() {
    if (page !== 'Offers') return;
    var codes = Object.keys(S.PROMOS);
    document.querySelectorAll('div').forEach(function (el) {
      if (el.children.length) return;
      var t = el.textContent.trim();
      if (codes.indexOf(t) === -1) return;
      el.setAttribute('data-copy', t);
      el.innerHTML = t + ' <span style="opacity:.6;font-size:11px">📋</span>';
    });
    wireCopy();
  }

  /* generic data-go navigation (for JS-rendered buttons) */
  function wireGo() {
    document.querySelectorAll('[data-go]').forEach(function (el) {
      if (el.dataset.gowired) return; el.dataset.gowired = '1'; el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) { e.stopPropagation(); location.href = el.getAttribute('data-go'); });
    });
  }

  /* ===================== POLICIES ===================== */
  var POLICIES = [
    { key: 'privacy', title: 'Privacy Policy', updated: 'Last updated: June 2026 · Bijamrit Foods Retail Pvt. Ltd.', body: [
      ['', 'At Bijamrit, your privacy matters. This policy explains what information we collect, how we use it, and the choices you have. We collect only what we need to process your orders and we never sell your data to third parties.'],
      ['Information we collect', 'Contact information (name, email, phone), shipping and billing addresses, order history, and payment confirmation — payments are processed securely by our partners and we never store your card numbers. We also collect limited usage data (pages viewed, device type) to improve the store.'],
      ['How we use your information', 'To fulfil and deliver orders, provide customer support, send order updates, prevent fraud, and — only if you opt in — share festive offers and new-flavour announcements. You can unsubscribe from marketing at any time.'],
      ['Cookies', 'We use essential cookies to keep your cart and login working, and optional analytics cookies to understand how the store is used. You can control cookies through your browser settings.'],
      ['Data sharing & security', 'We share data only with trusted partners who help us operate — payment gateways, logistics and delivery partners — under strict confidentiality. Your information is protected with industry-standard security measures.'],
      ['Your rights', 'You may request access to, correction of, or deletion of your data at any time by writing to <strong>care@bijamrit.com</strong>. We will respond within a reasonable timeframe.'],
      ['Contact', 'Bijamrit Foods Retail Pvt. Ltd., Shivajee Colony, Near Girls High School, Purnea, Bihar 854301, India · care@bijamrit.com · +91 98765 43210']
    ]},
    { key: 'terms', title: 'Terms & Conditions', updated: 'Last updated: June 2026 · Bijamrit Foods Retail Pvt. Ltd.', body: [
      ['', 'Welcome to Bijamrit. By browsing our store and placing an order you agree to these terms. Please read them carefully — they set out how we work together.'],
      ['Orders & acceptance', 'An order is confirmed only after you receive an order-confirmation email. We may decline or cancel an order in case of pricing errors, suspected fraud, or stock unavailability, and any amount charged will be refunded in full.'],
      ['Pricing & payment', 'All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Payment is taken at checkout via UPI, cards or cash on delivery. Coupon codes (e.g. WELCOME10, SAVE150, FREESHIP) are subject to their stated minimum-order conditions and cannot be clubbed.'],
      ['Product information', 'We make every effort to describe our makhana accurately, but flavour intensity, pack weights and images are indicative. Being a natural product, slight variation in size and colour is normal.'],
      ['Acceptable use', 'You agree not to misuse the site, attempt unauthorised access, or resell our products without written permission. All content, logos and images remain the property of Bijamrit Foods Retail Pvt. Ltd.'],
      ['Liability', 'Our liability for any order is limited to the value of that order. We are not responsible for delays caused by events beyond our control such as weather, strikes or courier disruptions.'],
      ['Governing law', 'These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts of Purnea, Bihar.'],
      ['Contact', 'Questions about these terms? Write to care@bijamrit.com or call +91 98765 43210.']
    ]},
    { key: 'refund', title: 'Refund Policy', updated: 'Last updated: June 2026 · Bijamrit Foods Retail Pvt. Ltd.', body: [
      ['', 'Your satisfaction is important to us. Because makhana is a food product, our refund policy balances fairness with food-safety rules.'],
      ['Eligibility', 'You may request a refund or replacement within <strong>7 days</strong> of delivery if your order arrives damaged, tampered, expired, or incorrect. Items must be unopened unless the issue is a quality defect.'],
      ['How to request', 'Email care@bijamrit.com with your order number and a photo of the product and packaging. Our team will review and respond within 48 hours.'],
      ['Refund method & timeline', 'Approved refunds are issued to your original payment method within <strong>5–7 business days</strong>. For cash-on-delivery orders, refunds are processed via UPI or bank transfer.'],
      ['Non-refundable items', 'Opened or partially consumed packs (except quality defects), clearance/festive-sale items marked final sale, and shipping charges on non-defective returns are not refundable.'],
      ['Cancellations', 'Orders can be cancelled free of charge any time before they are dispatched. Once shipped, an order follows the returns process above.'],
      ['Contact', 'Need help with a refund? Write to care@bijamrit.com or call +91 98765 43210.']
    ]},
    { key: 'shipping', title: 'Shipping Policy', updated: 'Last updated: June 2026 · Bijamrit Foods Retail Pvt. Ltd.', body: [
      ['', 'We deliver fresh, slow-roasted makhana across India. Here is everything you need to know about how your order reaches you.'],
      ['Delivery time', 'Orders are dispatched within <strong>1–2 business days</strong> and typically arrive in <strong>3–7 business days</strong> depending on your location. Remote pin codes may take a little longer.'],
      ['Shipping charges', 'Shipping is <strong>free on orders over ₹599</strong>. A flat fee of ₹49 applies to smaller orders. Use code <strong>FREESHIP</strong> for free delivery with no minimum during offer periods.'],
      ['Coverage', 'We ship pan-India to all serviceable pin codes via trusted courier partners. We currently do not offer international shipping.'],
      ['Order tracking', 'Once your order ships you will receive a tracking link by email and SMS so you can follow it to your doorstep.'],
      ['Packaging', 'Every order is sealed in food-grade, nitrogen-flushed packaging to lock in the crunch and freshness during transit.'],
      ['Delays', 'Festive rushes, weather and courier disruptions can occasionally cause delays. If your order is significantly late, reach out and we will chase it for you.'],
      ['Contact', 'Shipping questions? Write to care@bijamrit.com or call +91 98765 43210.']
    ]}
  ];
  function initPolicies() {
    if (page !== 'Policies') return;
    var nav = $('#pol-nav'), body = $('#pol-body'); if (!nav || !body) return;
    function renderBody(p) {
      body.innerHTML = '<h3 style="font-size:20px;font-weight:800;margin-bottom:6px">' + p.title + '</h3>'
        + '<div style="font-size:12px;color:#8a8678;margin-bottom:16px">' + p.updated + '</div>'
        + p.body.map(function (s) {
            return (s[0] ? '<div style="font-size:15px;font-weight:800;margin:18px 0 8px">' + s[0] + '</div>' : '')
              + '<p style="font-size:13px;color:#6b6b62;line-height:1.8;margin-bottom:16px">' + s[1] + '</p>';
          }).join('');
    }
    function renderNav(activeKey) {
      nav.innerHTML = POLICIES.map(function (p) {
        var on = p.key === activeKey;
        return '<span class="pol-tab bij-btn" data-key="' + p.key + '" style="cursor:pointer;font-size:13px;font-weight:' + (on ? '700' : '600')
          + ';padding:12px 16px;border-radius:10px;' + (on ? 'background:#e6eff0;color:#355a6e' : 'color:#6b6b62') + '">' + p.title + '</span>';
      }).join('');
      nav.querySelectorAll('.pol-tab').forEach(function (tab) {
        tab.onclick = function () { select(tab.dataset.key); };
      });
    }
    function select(key) {
      var p = POLICIES.filter(function (x) { return x.key === key; })[0] || POLICIES[0];
      renderNav(p.key); renderBody(p);
      body.classList.remove('bij-fade'); void body.offsetWidth; body.classList.add('bij-fade');
    }
    // honour ?p=terms etc.; default privacy
    select(qs('p') || 'privacy');
  }

  /* ===================== announcement marquee ===================== */
  function initMarquee() {
    document.querySelectorAll('div').forEach(function (el) {
      if (el.children.length || el.dataset.marquee) return;
      var t = el.textContent.trim();
      if (t.indexOf('Free shipping') !== 0) return;
      el.dataset.marquee = '1';
      el.classList.add('bij-marquee');
      el.style.textAlign = 'left';
      el.style.padding = '9px 0';
      var unit = '<span style="padding:0 30px">' + t + '</span><span style="padding:0 30px;opacity:.7">🪶</span>';
      var track = ''; for (var i = 0; i < 6; i++) track += unit;   // 6 identical units → −50% loops seamlessly
      el.innerHTML = '<div class="bij-marquee-track">' + track + '</div>';
    });
  }

  function run() {
    initShop(); initCart(); initCheckout(); initWishlist(); initSearch();
    initProduct(); initHome(); initContact(); initOffers(); initMarquee(); initPolicies();
    wireCopy();
    if (S) S.updateBadge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
