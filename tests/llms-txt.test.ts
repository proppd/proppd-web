import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '@/lib/seo/llms';
import { listings as demoListings } from '@/lib/demo-data';
import robots from '@/app/robots';

describe('buildLlmsTxt', () => {
  const output = buildLlmsTxt(demoListings);

  it('follows the llms.txt format: H1 title then blockquote summary', () => {
    const lines = output.split('\n');
    expect(lines[0]).toBe('# Proppd');
    expect(lines[2].startsWith('> ')).toBe(true);
  });

  it('states the core quotable facts', () => {
    expect(output).toContain('PPRA-verified');
    expect(output).toContain('Fidelity Fund Certificate');
    expect(output).toContain('POPIA');
    expect(output).toContain('free for buyers, tenants, and property seekers');
  });

  it('links the main search surfaces with absolute URLs', () => {
    expect(output).toContain('https://proppd.com/properties/for-sale');
    expect(output).toContain('https://proppd.com/properties/to-rent');
    expect(output).toContain('https://proppd.com/agents');
    expect(output).toContain('https://proppd.com/home-values');
  });

  it('builds city landing links from listing data plus major cities', () => {
    // Major city landings are always present…
    expect(output).toContain('/properties/for-sale/cape-town');
    expect(output).toContain('/properties/to-rent/johannesburg');
    expect(output).toContain('/estate-agents/durban');
    // …and cities that only exist in listing stock are picked up too.
    expect(output).toContain('/properties/for-sale/sandton');
  });

  it('never links private routes', () => {
    for (const path of ['/admin', '/dashboard', '/login', '/account', '/saved']) {
      expect(output).not.toContain(`https://proppd.com${path}`);
    }
  });
});

describe('robots AI crawler policy', () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];

  it('explicitly allows the major AI search and assistant crawlers', () => {
    const agents = rules.map((rule) => rule.userAgent);
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended']) {
      expect(agents).toContain(bot);
    }
  });

  it('keeps private paths disallowed for every crawler, AI bots included', () => {
    for (const rule of rules) {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      expect(disallow).toContain('/admin');
      expect(disallow).toContain('/dashboard');
      expect(disallow).toContain('/account');
      expect(rule.allow).toBe('/');
    }
  });
});
