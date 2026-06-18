# Bijamrit — Makhana store (frontend)

A pixel-faithful, fully navigable static rebuild of the **Bijamrit** design.
Each screen from the design is its own real page, and every nav link, header
icon, product card and CTA button navigates.

## Run locally

From this folder:

```bash
cd bijamrit
python3 -m http.server 8080
```

Then open <http://localhost:8080> — that's the home page.

> Use a server (not `file://`) so the fonts and relative asset paths load cleanly.

## Pages

| Page            | File             |
|-----------------|------------------|
| Home            | `index.html`     |
| Shop            | `shop.html`      |
| Product detail  | `product.html`   |
| Cart            | `cart.html`      |
| Checkout        | `checkout.html`  |
| Wishlist        | `wishlist.html`  |
| Account / Login | `account.html`   |
| Search          | `search.html`    |
| Offers          | `offers.html`    |
| About           | `about.html`     |
| Contact         | `contact.html`   |
| Policies        | `policies.html`  |

## What's clickable

- **Logo** → home
- **Nav** (Shop, Categories, Offers, About, Contact) → matching pages
- **Header icons** 🔍 ♡ 👤 🛒 → Search, Wishlist, Account, Cart
- **Product cards** (home / shop / search / "you may also like") → product page
- **Hero & section CTAs** (Shop now, Our story, View all, Add to cart, Checkout)
- **Breadcrumbs** on product & checkout pages
- **Footer policy links** → policies page
- **Pay** on checkout shows an order-placed confirmation

## How it's built

- Assets live in `assets/` — `img/` (webp), `fonts/` (woff2), `fonts.css`
  (Instrument Serif for headings, Plus Jakarta Sans for body).
- Layout is the design's original inline-styled markup, untouched, so it stays
  pixel-identical.
- `assets/nav.js` attaches all navigation at runtime without changing the
  layout. To re-point a link, edit the `NAV` / `ICONS` / `BUTTONS` maps at the
  top of that file.
