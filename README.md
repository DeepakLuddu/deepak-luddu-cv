# Deepak Luddu — Personal CV Website

Live site: **[deepak-luddu.vercel.app](https://deepak-luddu.vercel.app)**

A modern, dark-mode personal website with an embedded AI chat assistant. Built and deployed in a weekend. Showcases career history, deal track record, and credentials for a Strategic Account Executive role across AI, Cloud, DWS, Infrastructure, and Enterprise SaaS in the ANZ market.

## Stack

- **Frontend:** Hand-written HTML, CSS, vanilla JavaScript — no framework, no build step
- **Typography:** Inter + Space Grotesk (Google Fonts)
- **Hosting:** [Vercel](https://vercel.com) (Edge CDN, automatic HTTPS, serverless functions)
- **AI Chat:** [Vercel AI SDK](https://sdk.vercel.ai) + [Vercel AI Gateway](https://vercel.com/ai-gateway) routing to Anthropic Claude Haiku
- **Forms:** [Formspree](https://formspree.io) for the contact form (no backend code required)
- **Privacy:** `noindex` meta tags, `robots.txt`, and `X-Robots-Tag` HTTP headers prevent search-engine indexing

## Features

- **AI chat assistant** ("Ask about my experience") — a floating chat widget that uses Claude Haiku via the Vercel AI Gateway to answer questions about my career, drawing only from my CV context. Includes rate limiting, abuse protection, and strict behavioral guardrails (never invents information, deflects commercial/personal questions, points to contact form for direct outreach).
- **Modern Tech aesthetic** — dark mode, gradient accents, generous whitespace, responsive layout
- **Performance-first** — no framework runtime, no analytics, no tracking pixels; pages load in under 300ms from global CDN
- **Privacy-respectful** — hidden from search engines, contact form routes through Formspree without exposing email address

## Structure

```
cv-website/
├── index.html        Markup and content
├── styles.css        All styling (Modern Tech aesthetic, dark mode, gradients)
├── script.js         Smooth scroll + reveal-on-scroll
├── chat.js           AI chat widget client (streaming UI)
├── api/
│   └── chat.js       Vercel serverless function (edge runtime) — calls Claude via AI Gateway
├── package.json      Declares ai + @ai-sdk/gateway dependencies
├── headshot.jpg      Profile photo
├── vercel.json       Vercel config (clean URLs, X-Robots-Tag header)
├── robots.txt        Blocks all crawlers
└── README.md         This file
```

## Design principles

- **Restraint over decoration** — clean type, generous whitespace, single accent gradient
- **Mobile-first responsive** — stat cards collapse 3→2→1, industries table converts to stacked layout below 640px, chat goes fullscreen on mobile
- **AI as a peer feature, not a gimmick** — the chat widget is positioned as a professional CV utility ("ask anything about Deepak's experience") rather than a novelty
- **Strict AI guardrails** — never hallucinate, never share private contact details, always invite direct contact for sensitive questions

## Running locally

It's mostly static HTML. To test the chat function locally you need the Vercel CLI and an `AI_GATEWAY_API_KEY`:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables (requires project access)
vercel env pull .env.local

# Run dev server with serverless function support
vercel dev
```

For pure static preview (no chat function), any local server works:

```bash
python -m http.server 8000
# or
npx serve
```

## Deploying

This project is deployed via the Vercel CLI:

```bash
vercel --prod
```

The AI chat function requires the `AI_GATEWAY_API_KEY` environment variable to be configured in the Vercel project settings.

## License

Personal project. Code is open for reference and learning. Content, photos, and personal information are reserved.
