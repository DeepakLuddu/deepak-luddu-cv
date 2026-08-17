// =========================================================
// /api/chat — Vercel serverless function powering the chat widget
// Stack: Vercel AI SDK + Vercel AI Gateway -> Anthropic Claude Haiku
// =========================================================

import { createGateway } from '@ai-sdk/gateway';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge',
};

// ---------- In-memory rate limiter (per IP per hour) ----------
// Note: edge runtime instances aren't shared, so this is best-effort.
// Real production would use Upstash Redis or Vercel KV. For a personal CV
// site, this combined with OpenAI's $10 monthly cap is sufficient.
const RATE_LIMIT_PER_HOUR = 20;
const ipBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const bucket = (ipBuckets.get(ip) || []).filter(t => t > hourAgo);
  if (bucket.length >= RATE_LIMIT_PER_HOUR) {
    ipBuckets.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  ipBuckets.set(ip, bucket);
  return false;
}

// ---------- System prompt with embedded CV context ----------
const CV_CONTEXT = `
DEEPAK LUDDU — STRATEGIC ACCOUNT EXECUTIVE
Location: Melbourne, Australia
Focus: AI, Cloud, DWS (Digital Workspace), Infrastructure, SaaS, Enterprise GTM
Market: ANZ (Australia & New Zealand)

POSITIONING:
Enterprise sales professional with a record of closing complex, multi-stakeholder
technology deals across ANZ. Hunts new logos, expands strategic accounts, builds
partner co-sell motions, orchestrates cross-functional pursuit teams across full
sales cycles. Unique differentiator: spent four years on the buy-side as Head of
Digital Workplace at the University of Melbourne ($80M+ in approved CAPEX), and
held a hands-on engineering role at Transurban — so he can credibly discuss
architecture with a CTO and TCO with a CFO.

CURRENT ROLE — Strategic Account Executive, Services & Solutions (AI, Cloud & Managed Services)
Lenovo · Aug 2024 to Present
- Owns a curated book of named enterprise accounts across ANZ
- Drives net-new revenue and platform expansion across cloud, infrastructure, AI, managed services, security, digital workplace
- Multi-stakeholder pursuit cycles of 6 to 18 months
- KEY RESULTS:
  * Grew ANZ services & solutions revenue to $46M (+32% YoY), on top of 30% YoY growth the prior year
  * Scaled Device-as-a-Service to $42M TCV (+400% YoY)
  * Owns $24M software portfolio: $22M Microsoft CSP (+14% YoY) + 30+ ISV ecosystem (SentinelOne, Google Workspace, Adobe, AvePoint)
  * $6.3M Managed Services revenue (+41% YoY), 110% quota attainment
  * Won Lenovo ANZ's first ServiceNow deal (licensing + implementation + professional services)
  * Built ANZ go-to-market for AI and robotics including the region's first robotics sale
  * Commercialised and sold net-new offers in cloud migration (MDM) and Essential 8 cybersecurity assessment
  * Activated ANZ partner ecosystem across hyperscalers, GSIs, technology partners, and agencies
  * Won Lenovo's inaugural AI Hero award at Sales Kick-Off for driving enablement and sales strategy across ANZ

PREVIOUS ROLE — Head of Digital Workplace Services (the buy side)
University of Melbourne · Mar 2020 to Aug 2024
- Financial accountability for $80M+ in CAPEX programs as a buyer
- Approved vendor proposals, evaluated business cases, made investment decisions under executive scrutiny
- Delivered outcomes for 10,000 staff and 53,000 students
- Built and led the function from 15 to 55 FTE plus 100+ vendor contractors
- Programs spanned AI, EUC, Cyber, SaaS, and AV across Microsoft, ServiceNow, CrowdStrike, Zoom, Okta, Citrix, Apple, Linux
- Delivered zero-touch cloud deployment, 1,000+ hybrid AV spaces, 750 hybrid teaching/learning spaces, virtualised student labs
- Established 'Evergreen IT' operating model
- This means he knows how buying decisions actually get made, who the stakeholders are, and what makes a credible business case

EARLIER ROLES (15 years building the enterprise network):
- Engineering Manager, Workspace Technology · Transurban · Aug 2018 to Feb 2020 — hands-on engineering lead, cloud-native workplace platforms; gives him credibility with engineering champions and technical buyers
- Strategy Lead, Digital Workplace · Telstra · Aug 2016 to Aug 2018 — built cloud-first digital workplace strategy, business cases, POCs, roadmaps
- IT Strategy Specialist · National Broadband Network · Mar to Aug 2016
- Digital Workspace Analyst · Telstra · Jul 2014 to Mar 2016
- Management Consultant · Accenture · Jul 2011 to Jun 2014 — delivered tech transformation across Telstra, Origin Energy, NSW DPC, ASIC
- Project Associate, Employee Experience · Willis Towers Watson · Apr 2010 to Jun 2011

EDUCATION & CREDENTIALS:
- Bachelor of Commerce (Honours), University of Melbourne
- Skillsoft AI Leadership Certifications (2026): AI Regulation and Compliance: Strategy for Leaders; The Strategic Value Proposition of AI/ML; Operationalizing AI Strategy: From Pilots to Scaled Enterprise Impact; Demystifying AI, ML, and Generative AI for Leaders; AI Enterprise Planning
- Lenovo Sustainability Services Certification (2025)
- Agile ICP Certified Professional (2023)
- Prosci Certified Change Practitioner (2022)

WORK RIGHTS: Australian citizen.

LINKEDIN: https://www.linkedin.com/in/deepak-luddu-4a541b36/
WEBSITE: https://deepak-luddu.vercel.app
GITHUB (this site's source): https://github.com/DeepakLuddu/deepak-luddu-cv
`;

const SYSTEM_PROMPT = `You are an AI assistant on Deepak Luddu's personal CV website. You help visitors and recruiters learn about Deepak's professional experience and career as a Strategic Account Executive.

You have access to Deepak's full CV below. Use it to answer questions factually and concisely.

# Deepak's CV Context
${CV_CONTEXT}

# Your Rules

1. NEVER make up information. If a question cannot be answered from the CV context above, say something like "I don't have that detail in Deepak's CV — best to reach out via the contact form on this page and ask him directly."

2. Be concise but warm. Aim for 2-4 sentences for most answers. Longer is fine for genuinely detailed questions like "tell me about his biggest deals."

3. Never share private contact info. Don't share phone numbers or email addresses. For contact, always point people to the contact form at the bottom of the page or his LinkedIn (which is linked on the site).

4. Stay on topic. Only answer questions about Deepak's career, experience, and how to get in touch. Politely deflect off-topic questions (jokes, homework help, opinions on competitors, etc.).

5. Stay professional. Never make negative comments about Deepak's past employers, current employer, or any other people or organisations.

6. Always invite next steps when relevant. If someone seems interested in hiring Deepak or having a conversation, suggest: "If you'd like to chat with Deepak directly, scroll down to the contact form or message him on LinkedIn."

7. Be honest about being AI. If asked, say "I'm an AI assistant on Deepak's website, trained on his CV. I'm not Deepak himself — best to message him directly via the form below for a real conversation."

8. Decline financial / commercial details. Don't speculate on salary expectations, day rates, compensation, notice period, or commercial terms. Deflect: "That's a conversation for Deepak directly — use the contact form."

9. Don't speculate about future intentions. If asked things like "would he take a role at X" or "is he interested in moving to Y", deflect to direct contact.

10. Tone: confident, professional, slightly conversational. Like a smart, helpful assistant who knows Deepak well and is happy to help recruiters.

Format: Plain text only. No markdown headers, no bullet lists unless genuinely required. Short paragraphs.`;

// ---------- Handler ----------
export default async function handler(req) {
  // CORS / method guards
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get client IP for rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({
        error: 'Too many questions. Please wait a few minutes and try again.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = body;

  // Basic input validation
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (messages.length > 20) {
    return new Response(
      JSON.stringify({
        error: 'Conversation too long. Refresh the page to start a new one.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Reject overly long user messages
  const lastUserMsg = messages[messages.length - 1];
  if (
    lastUserMsg &&
    typeof lastUserMsg.content === 'string' &&
    lastUserMsg.content.length > 1000
  ) {
    return new Response(
      JSON.stringify({
        error: 'Question is too long. Please keep questions under 1000 characters.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify configuration
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('AI_GATEWAY_API_KEY is not set in the function environment');
    return new Response(
      JSON.stringify({
        error: "Sorry, the assistant is temporarily offline. Please use the contact form below to reach Deepak directly.",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create gateway client with explicit API key
  const myGateway = createGateway({ apiKey: apiKey.trim() });

  // Call Claude via Vercel AI Gateway
  let result;
  try {
    result = streamText({
      model: myGateway('anthropic/claude-3-5-haiku-latest'),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.4,
      maxTokens: 400,
    });
  } catch (initErr) {
    console.error('streamText init error:', initErr);
    return new Response(
      JSON.stringify({
        error: "Sorry, I couldn't process that request. Please try again or use the contact form to reach Deepak directly.",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let textReceived = false;
      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            textReceived = true;
            const delta = part.textDelta ?? part.text ?? '';
            if (delta) controller.enqueue(encoder.encode(delta));
          } else if (part.type === 'error') {
            console.error('Stream error event:', part.error);
          } else if (part.type === 'finish') {
            console.log('Stream finished. Reason:', part.finishReason, 'Usage:', part.usage);
          }
        }
        if (!textReceived) {
          controller.enqueue(
            encoder.encode("I'm having trouble responding right now. Try rephrasing your question, or use the contact form below to reach Deepak directly.")
          );
        }
        controller.close();
      } catch (streamErr) {
        console.error('Stream iteration error:', streamErr);
        controller.enqueue(
          encoder.encode("Sorry, something went wrong while answering. Please try again in a moment.")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
