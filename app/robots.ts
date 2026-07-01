import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proppd.com';

// Private, session-bound, or machine-only routes. Nothing here helps a search
// or answer engine, and some of it (dashboards, saved homes) is user data.
const PRIVATE_PATHS = ['/admin', '/dashboard', '/api', '/auth', '/saved', '/login', '/signup', '/account', '/my-properties', '/reset-password'];

/**
 * Crawlers behind AI search and assistant answers (ChatGPT, Claude,
 * Perplexity, Gemini, Meta AI, Apple Intelligence). Explicitly allowed as
 * part of Proppd's generative engine optimisation: being retrievable by
 * these bots is how Proppd listings and guides get cited in AI answers.
 * Each still inherits the private-path disallows.
 */
const AI_CRAWLERS = [
  // OpenAI: search index, on-demand fetches for ChatGPT answers, training.
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic: search index, on-demand fetches for Claude answers, training.
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity: index and on-demand fetches.
  'PerplexityBot',
  'Perplexity-User',
  // Google Gemini / grounding (AI Overviews uses regular Googlebot).
  'Google-Extended',
  // Apple Intelligence, Meta AI, Amazon (Alexa / Rufus answers).
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  // Common Crawl feeds many models' training corpora.
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
