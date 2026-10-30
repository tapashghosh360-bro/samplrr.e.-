# THE REAL ESTATE — Bangladesh

> Spaces Worth Coming Home To — A curated, cinematic real estate discovery platform presenting selective apartments, penthouses, and developments across Bangladesh through a scroll-directed cinematic film.

---

## 🌟 Key Features

- **Cinematic Scroll-Canvas Experience**: Scroll-synchronized frame-by-frame film animation rendered smoothly via HTML5 Canvas.
- **Editorial Layout & Design**: Cormorant Garamond and Inter typography with a warm parchment and graphite palette.
- **Bilingual Experience**: Full English and Bengali translation support with instant toggle.
- **Property Catalog & Filters**: Explore luxury listings with neighborhood filters, price ranges, verified disclosures, and modal view.
- **Interactive Inquiries & Lead Management**: Customer inquiry drawer, private viewing scheduler, and built-in lead tracking console.
- **Optimized Video & Asset Delivery**: Lightweight range-request streaming server for smooth media scrubbing.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS, Vanilla ES6+ Modules
- **Build Tool**: [Vite](https://vitejs.dev/) with TypeScript support
- **Server**: Zero-dependency Node.js HTTP server supporting Range requests (`server.js`)
- **Icons**: Lucide Icons

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

You can run the platform using either Vite's dev server or the custom range-streaming server:

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

---

## 📂 Project Structure

```text
├── css/
│   └── styles.css          # Editorial styling & custom utility rules
├── js/
│   ├── analytics.js        # Event logging & interaction tracking
│   ├── app.js              # Core UI orchestration & state management
│   ├── bundle.js           # Production bundled script
│   ├── data.js             # Curated property listings & mock data
│   └── translations.js     # English and Bengali localization
├── public/
│   ├── frames/             # Cinematic scroll animation frames (161 frames)
│   └── videos/             # Hero background videos
├── src/                    # TypeScript interfaces & source definitions
├── index.html              # Main single-page application entry
├── server.js               # Node.js streaming HTTP server
├── tailwind.config.js      # Tailwind theme extensions
└── vite.config.ts          # Vite build configuration
```

---

## 📄 License

Private & Proprietary — All rights reserved.
