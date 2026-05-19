import { describe, expect, it } from 'vitest';
import { buildLegalContactMailto, getLegalPage, legalPages } from '@/lib/legal/policies';

describe('legal policy content', () => {
  it('defines privacy, terms, and cookies pages with useful sections', () => {
    expect(Object.keys(legalPages)).toEqual(['privacy', 'terms', 'cookies']);
    expect(legalPages.privacy.sections).toHaveLength(4);
    expect(legalPages.terms.sections).toHaveLength(4);
    expect(legalPages.cookies.sections).toHaveLength(4);
  });

  it('keeps POPIA and pilot-stage language visible in the right places', () => {
    expect(getLegalPage('privacy').title).toContain('POPIA');
    expect(getLegalPage('terms').sections.map((section) => section.body).join(' ')).toContain('pilot-stage');
    expect(getLegalPage('cookies').sections.map((section) => section.body).join(' ')).toContain('server-side only');
  });

  it('builds an encoded contact mailto with page context', () => {
    const mailto = buildLegalContactMailto(getLegalPage('privacy'));

    expect(mailto).toContain('mailto:info@proppd.com');
    expect(mailto).toContain(encodeURIComponent('Proppd privacy question'));
    expect(mailto).toContain(encodeURIComponent('Page: Privacy policy'));
    expect(mailto).toContain(encodeURIComponent('Last updated: 19 May 2026'));
  });
});
