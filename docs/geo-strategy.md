# Generative Engine Optimization (GEO)

GEO is about getting Proppd surfaced and cited when people ask AI assistants
(ChatGPT, Claude, Perplexity, Google AI Overviews, Meta AI) questions like
"best property portal in South Africa", "houses for sale in Sandton", or
"how do I check if an estate agent is PPRA verified". Answer engines pull
from pages they can crawl, parse, and quote — GEO is making Proppd the
easiest source to quote.

## What is implemented

### 1. AI crawler access — `app/robots.ts`

Every major AI search/assistant crawler is explicitly allowed (with the same
private-path disallows as regular crawlers):

| Provider | Crawlers | Powers |
| --- | --- | --- |
| OpenAI | OAI-SearchBot, ChatGPT-User, GPTBot | ChatGPT search + answers, training |
| Anthropic | Claude-SearchBot, Claude-User, ClaudeBot | Claude search + answers, training |
| Perplexity | PerplexityBot, Perplexity-User | Perplexity answers |
| Google | Google-Extended | Gemini grounding (AI Overviews uses normal Googlebot) |
| Apple / Meta / Amazon | Applebot-Extended, Meta-ExternalAgent, Amazonbot | Apple Intelligence, Meta AI, Rufus/Alexa |
| Common Crawl | CCBot | Training corpora for many models |

### 2. `/llms.txt` — `app/llms.txt/route.ts` + `lib/seo/llms.ts`

Curated markdown map of the site per [llmstxt.org](https://llmstxt.org):
what Proppd is, the quotable key facts (PPRA/FFC verification, free for
seekers, POPIA consent, direct enquiry routing), and links to the search
surfaces, city landing pages (generated from live listing stock), agent
directory, and tools. This is the one-shot answer for a bot deciding what
Proppd is and where its useful pages live.

### 3. Structured data (pre-existing, kept in step)

- Organization + WebSite + FAQPage schema on the home page.
- RealEstateListing + FAQ schema per listing; RealEstateAgent/Agency schema
  on directory profiles.
- FAQ answers are written as complete, self-contained statements — the
  format answer engines lift verbatim.

## How to verify it is working

- `curl https://proppd.com/llms.txt` and `curl https://proppd.com/robots.txt`
  after deploy.
- Ask ChatGPT/Perplexity/Claude (with browsing) "site:proppd.com property for
  sale in Sandton"-style questions and check whether Proppd pages get cited.
- Server logs: look for the crawler user agents above hitting `/llms.txt`,
  listing pages, and city landing pages.

## Next levers (not yet done)

1. **Bing Webmaster Tools** — ChatGPT search rides on Bing's index; submit
   the sitemap there (Google Search Console is already on the TODO list in
   `app/layout.tsx`).
2. **Statistics and citable numbers in copy** — GEO studies show pages with
   concrete stats ("X listings in Sandton", "average asking price R Y") get
   cited more. The market-snapshot data on `/properties` already computes
   these; surfacing them in crawlable landing-page copy would help.
3. **Suburb guide content** — long-form "Living in {suburb}" pages answer
   the questions people actually ask assistants and give engines something
   to quote beyond listing cards.
4. **Entity consistency** — same one-line description of Proppd everywhere
   (home SEO section, llms.txt, schema.org `description`, social profiles
   once live). Add `sameAs` links to the Organization schema when the
   social accounts exist.
5. **llms-full.txt** — expanded variant inlining key page content, worth it
   once suburb guides exist.
