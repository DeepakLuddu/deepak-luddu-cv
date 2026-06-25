# Deepak Luddu — Personal CV Website

Live site: **[deepak-luddu.vercel.app](https://deepak-luddu.vercel.app)**

A modern, dark-mode personal website built and deployed in a weekend. Showcases career history, deal track record, and credentials for a Strategic Account Executive role across AI, Cloud, DWS, Infrastructure, and Enterprise SaaS in the ANZ market.

## Stack

- **Frontend:** Hand-written HTML, CSS, vanilla JavaScript — no framework, no build step
- **Typography:** Inter + Space Grotesk (Google Fonts)
- **Hosting:** [Vercel](https://vercel.com) (Edge CDN, automatic HTTPS)
- **Forms:** [Formspree](https://formspree.io) for the contact form (no backend code required)
- **Privacy:** `noindex` meta tags, `robots.txt`, and `X-Robots-Tag` HTTP headers prevent search-engine indexing

## Structure

```
cv-website/
├── index.html       Markup and content
├── styles.css       All styling (Modern Tech aesthetic, dark mode, gradients)
├── script.js        Smooth scroll + reveal-on-scroll
├── headshot.jpg     Profile photo
├── vercel.json      Vercel config (clean URLs, X-Robots-Tag header)
├── robots.txt       Blocks all crawlers
└── README.md        This file
```

## Design principles

- **Restraint over decoration** — clean type, generous whitespace, single accent gradient
- **Mobile-first responsive** — stat cards collapse 3→2→1, industries table converts to stacked layout below 640px
- **Performance** — no framework runtime, no analytics, no tracking pixels; pages load in under 300ms from global CDN
- **Privacy-respectful** — site is hidden from search engines, contact form routes through Formspree without exposing email address

## Running locally

It's just static HTML. Open `index.html` in any browser and it works.

For a local dev server with hot reload, you can use any of:

```bash
# Python
python -m http.server 8000

# Node
npx serve

# Vercel CLI
vercel dev
```

## Deploying

This repo is deployed via the Vercel CLI:

```bash
cd cv-website
vercel --prod
```

## License

Personal project. Code is open for reference and learning. Content, photos, and personal information are reserved.
