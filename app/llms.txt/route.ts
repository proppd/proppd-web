import { buildLlmsTxt } from '@/lib/seo/llms';
import { loadPortalListings } from '../../lib/proppd/backend';

export const dynamic = 'force-dynamic';

// llms.txt (llmstxt.org): curated site map for AI assistants and answer
// engines. Built from live listing data so city links track actual stock.
export async function GET() {
  const portalListings = await loadPortalListings();
  const body = buildLlmsTxt(portalListings.items);

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
