# AIOminer.com — Crypto Mining Profitability Calculator

A static website for [aiominer.com](https://aiominer.com) featuring a real-time cryptocurrency mining profitability calculator, live coin prices, hardware recommendations, and mining guides. Monetized with Google AdSense and affiliate links.

## Features

- **Mining Calculator** — Supports 8 coins: BTC, ETC, LTC, XMR, KAS, RVN, ZEC, DOGE
- **Live Prices** — Real-time pricing from CoinGecko API (updates every 60s)
- **Coin Overview** — Price cards with 24h change and mining stats
- **Hardware Recs** — ASIC, GPU, and CPU miner recommendations with affiliate link placeholders
- **Mining Guides** — Informational articles covering mining fundamentals
- **SEO Optimized** — Meta tags, Open Graph, semantic HTML
- **Mobile Responsive** — Works on all screen sizes
- **Dark Theme** — Modern crypto aesthetic

## Quick Start

This is a static site — no build step required. Just serve the files:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Or just open index.html in a browser
```

## Deployment

Deploy to any static hosting provider:

- **Netlify** — Drag and drop the folder, or connect your Git repo
- **Cloudflare Pages** — Connect repo, no build command needed
- **Vercel** — `vercel --prod` from the project root
- **GitHub Pages** — Push to a `gh-pages` branch
- **Any web host** — Upload files via FTP/SFTP

## Google AdSense Setup

1. Sign up at [Google AdSense](https://www.google.com/adsense/)
2. Get your publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. In `index.html`, replace all instances of `ca-pub-XXXXXXXXXXXXXXXX` with your actual publisher ID
4. Replace each `data-ad-slot="XXXXXXXXXX"` with the ad unit IDs you create in your AdSense dashboard
5. Ad placements are already positioned in the HTML:
   - **Top leaderboard** — Below the hero section
   - **Calculator sidebar** — Next to the calculator (300x250 area)
   - **Mid-content banner** — Between coins and hardware sections
   - **Bottom banner** — Above the footer CTA

## Affiliate Links

Hardware cards in the `#hardware` section have placeholder `href="#"` links. Replace these with your affiliate URLs:

- **Amazon Associates** — Mining hardware product links
- **Newegg Affiliate** — GPU and hardware links
- **Exchange Referrals** — Coinbase, Kraken, Binance referral links

## Updating Mining Data

Network stats (hashrate, block rewards) are configured in `js/app.js` in the `COINS` object. Update these periodically to keep the calculator accurate:

- `networkHashrate` — Current network hashrate in H/s
- `blockReward` — Current block reward
- `blockTime` — Average block time in seconds

Coin prices are fetched live from CoinGecko and do not need manual updates.

## File Structure

```
aiominer/
├── index.html          # Main page with all sections
├── css/
│   └── styles.css      # All styles (dark theme, responsive)
├── js/
│   └── app.js          # Calculator logic, API calls, UI
└── README.md
```

## Revenue Potential

With ~4,500 monthly visitors in the crypto niche:

| Source | Estimated Monthly |
|--------|------------------|
| AdSense (crypto CPMs ~$5-15) | $22 – $67 |
| Affiliate links (2-5% conversion) | $20 – $100+ |
| **Total potential** | **$42 – $167+** |

Revenue grows with traffic. Focus on SEO content to increase organic visits.

## License

All rights reserved. For use on aiominer.com.
