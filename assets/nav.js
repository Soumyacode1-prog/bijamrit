/* Bijamrit — client-side navigation wiring.
   The design renders nav items as <span> and cards as <div>, so we attach
   real navigation here without altering the pixel layout. */
(function () {
  // nav label (lowercased text) -> page
  var NAV = {
    'shop': 'shop.html',
    'categories': 'shop.html',
    'offers': 'offers.html',
    'about': 'about.html',
    'contact': 'contact.html'
  };
  // header icon glyph -> page
  var ICONS = {
    '🔍': 'search.html',
    '♡': 'wishlist.html',
    '👤': 'account.html',
    '🛒': 'cart.html'
  };
  // CTA / button text (lowercased, trimmed) -> page  (null = stay, just feedback)
  var BUTTONS = {
    'shop now': 'shop.html',
    'our story': 'about.html',
    'view all': 'shop.html',
    'view all →': 'shop.html',
    'shop hampers': 'shop.html',
    'build your box': 'shop.html',
    'add to cart': 'cart.html',
    'checkout': 'checkout.html'
  };

  function go(href) { if (href) window.location.href = href; }

  function link(el, href) {
    if (!el || el.dataset.link) return;
    el.dataset.link = '1';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      go(href);
    });
  }

  function txt(el) { return (el.textContent || '').trim().toLowerCase().replace(/\s+/g, ' '); }

  function wire() {
    // 1) Logo "Bijamrit" -> home
    document.querySelectorAll('div').forEach(function (d) {
      var t = txt(d);
      if ((t === 'bijamrit 🪶' || t === 'bijamrit') && d.children.length <= 1 && !d.dataset.link) {
        // only the compact logo block, not large containers
        if (d.textContent.trim().length < 14) link(d, 'index.html');
      }
    });

    // 2) Nav <span> items
    document.querySelectorAll('span').forEach(function (sp) {
      var t = txt(sp);
      if (NAV[t] && sp.parentElement &&
          sp.parentElement.querySelectorAll(':scope > span').length >= 3) {
        link(sp, NAV[t]);
      }
    });

    // 3) Header icon row (a single div holding the emoji glyphs)
    document.querySelectorAll('div').forEach(function (d) {
      var t = d.textContent.replace(/\s/g, '');
      if (/^[🔍♡👤🛒]{2,4}$/u.test(t) && !d.dataset.iconwired) {
        d.dataset.iconwired = '1';
        d.style.cursor = 'pointer';
        // split the glyphs into clickable spans preserving layout
        var html = '';
        Array.from(d.textContent.trim()).forEach(function (ch) {
          if (ICONS[ch]) html += '<span data-ico="' + ICONS[ch] + '" style="cursor:pointer">' + ch + '</span>';
          else if (ch.trim()) html += ch;
        });
        if (html) d.innerHTML = html;
        d.querySelectorAll('[data-ico]').forEach(function (s) {
          s.addEventListener('click', function (e) { e.stopPropagation(); go(s.getAttribute('data-ico')); });
        });
      }
    });

    // 4) CTA buttons / pill divs by text
    document.querySelectorAll('div,button,a').forEach(function (el) {
      if (el.children.length > 0 && el.tagName !== 'BUTTON' && el.tagName !== 'A') return;
      var t = txt(el);
      if (BUTTONS[t] && !el.dataset.link) link(el, BUTTONS[t]);
      // "Pay ₹..." on checkout
      if (/^pay\s+₹/.test(t) && !el.dataset.link) {
        el.dataset.link = '1'; el.style.cursor = 'pointer';
        el.addEventListener('click', function () { alert('Order placed! Thank you for shopping with Bijamrit 🪶'); });
      }
    });

    // 5) Product cards (rounded bordered tiles) -> product page
    document.querySelectorAll('div').forEach(function (d) {
      var s = d.getAttribute('style') || '';
      if (/border-radius:\s*18px/.test(s) && /overflow:\s*hidden/.test(s) &&
          d.querySelector('img') && !d.dataset.card) {
        d.dataset.card = '1';
        d.style.cursor = 'pointer';
        d.addEventListener('click', function () { go('product.html'); });
      }
    });

    // 6) Breadcrumb links (Cart / Information / Shop / Home etc.)
    var CRUMB = { 'cart': 'cart.html', 'home': 'index.html', 'shop': 'shop.html' };
    document.querySelectorAll('span,a').forEach(function (el) {
      var t = txt(el);
      if (CRUMB[t] && el.parentElement && /›|\/|>/.test(el.parentElement.textContent) && !el.dataset.link) {
        link(el, CRUMB[t]);
      }
    });

    // 7) Footer policy links -> policies page
    document.querySelectorAll('span,a').forEach(function (el) {
      var t = txt(el);
      if (/(privacy|terms|refund|shipping)( policy| & conditions)?$/.test(t) &&
          t.length < 24 && !el.dataset.link) {
        link(el, 'policies.html');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
