# THE REAL ESTATE — Bangladesh

> Spaces Worth Coming Home To — A curated, cinematic real estate discovery platform presenting selective apartments, penthouses, and developments across Bangladesh through a scroll-directed cinematic film.

---

## 🌟 Key Features

- **Cinematic Scroll-Canvas Experience**: Scroll-synchronized frame-by-frame film animation rendered smoothly via HTML5 Canvas with High-DPI / Retina device pixel ratio scaling.
- **Enterprise Security & SQLi Defense**: Client and serverless SQL injection inspection, deep XSS escaping, anti-bot honeypots, and submission rate-limiting.
- **Netlify Optimized**: Built-in `netlify.toml`, serverless lead capture function, SPA routing, asset rewrites, and strict Content Security Policy (CSP).
- **Production Tailwind CSS**: Fully compiled utility and design tokens without runtime CDN dependency.
- **Editorial Layout & Design**: Cormorant Garamond and Inter typography with a warm parchment and graphite palette.
- **Bilingual Experience**: Full English and Bengali translation support with instant toggle.
- **Property Catalog & Filters**: Explore luxury listings with neighborhood filters, price ranges, verified disclosures, and modal view.
- **Interactive Inquiries & Lead Management**: Customer inquiry drawer, private viewing scheduler, and built-in lead tracking console.

---

## 🛠️ Tech Stack & Security Architecture

- **Frontend**: HTML5, CSS3, Tailwind CSS (PostCSS compiled), Vanilla ES6+ Modules
- **Security Engine**: `js/security.js` with regex-based SQLi vector filtering, HTML entity sanitizer, E.164 phone validation, honeypot traps, and rate limiter.
- **Build Tool**: [Vite](https://vitejs.dev/) with PostCSS & Autoprefixer
- **Hosting & Serverless**: [Netlify](https://www.netlify.com/) (functions in `netlify/functions/submit-lead.js`)
- **Local Dev Server**: Node.js HTTP server supporting HTTP Range video streaming (`server.js`)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/tapashghosh360-bro/samplrr.e.-.git
cd "Animative  R.E. website 2"

# Install dependencies
npm install
```

### Running Locally

```bash
# Option A: Start Vite development server
npm run dev

# Option B: Run custom streaming server
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The output will be generated in `dist/`.

---

## 🌐 Deploying to Netlify

This project is pre-configured for one-click deployment on Netlify:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Functions Directory**: `netlify/functions`
4. The included `netlify.toml`, `public/_headers`, and `public/_redirects` will automatically handle:
   - High-performance asset caching for video & frames
   - HTTP Range request support for smooth film scrubbing
   - SPA routing fallbacks
   - Serverless lead verification (`/api/lead`)
   - Strict HTTP Security Headers & Content Security Policy

---

## 📂 Project Structure

```text
├── css/
│   └── styles.css          # Editorial styling & Tailwind directives
├── js/
│   ├── analytics.js        # Event logging & interaction tracking
│   ├── app.js              # Modular UI orchestration & state management
│   ├── bundle.js           # Production bundled script
│   ├── data.js             # Curated property listings & mock data
│   ├── security.js         # Enterprise SQLi detection, XSS sanitization & validation
│   └── translations.js     # English and Bengali localization
├── netlify/
│   └── functions/
│       └── submit-lead.js  # Serverless lead intake with server-side SQLi defense
├── public/
│   ├── _headers            # Netlify HTTP security & caching headers
│   ├── _redirects          # Netlify routing & asset rewrites
│   ├── frames/             # Cinematic scroll animation frames (161 frames)
│   └── videos/             # Hero background videos
├── netlify.toml            # Netlify deployment & header configuration
├── index.html              # Main single-page application entry
├── server.js               # Node.js streaming HTTP server with security headers
├── tailwind.config.js      # Complete Tailwind design system theme tokens
└── vite.config.ts          # Vite build configuration
```

---

## 📄 License

Private & Proprietary — All rights reserved.
