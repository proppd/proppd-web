export type LegalSection = {
  title: string;
  body: string;
};

export type LegalPage = {
  label: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  contactSubject: string;
};

export const legalPages = {
  privacy: {
    label: 'Privacy policy',
    title: 'POPIA-ready privacy foundation',
    intro: 'How Proppd handles property enquiries, agency onboarding requests, saved-search requests, valuation handoffs, and future AgentOS workflows.',
    lastUpdated: '19 May 2026',
    contactSubject: 'Proppd privacy question',
    sections: [
      {
        title: 'What Proppd collects',
        body: 'Proppd collects only the information needed to respond to property enquiries, route valuation requests, onboard agencies, prepare saved-search alerts, and support agent workflows. This can include contact details, listing context, property requirements, agency information, and consent records.',
      },
      {
        title: 'Why it is used',
        body: 'Information is used to respond to the request, connect buyers, tenants, sellers, landlords, agents, and agencies, prevent spam or duplicate enquiries, improve listing quality, and prepare future tenant-scoped AgentOS workflows.',
      },
      {
        title: 'Sharing and routing',
        body: 'Where a request needs an agent or agency response, Proppd may route the relevant context to an appropriate launch partner or internal operator. The intent is limited handoff, not resale of personal information.',
      },
      {
        title: 'Your choices',
        body: 'You can ask Proppd to correct, export, or delete contact information where legally permitted. Some operational records may be retained when needed for security, audit, dispute handling, or compliance.',
      },
    ],
  },
  terms: {
    label: 'Terms of use',
    title: 'Fair portal rules for trusted property activity',
    intro: 'Clear operating terms for listings, enquiries, lead routing, agency onboarding, valuation handoffs, and early AgentOS tools.',
    lastUpdated: '19 May 2026',
    contactSubject: 'Proppd terms question',
    sections: [
      {
        title: 'Acceptable use',
        body: 'Use Proppd for genuine property discovery, listing, valuation, finance-readiness, and professional real-estate workflows. Do not submit fake enquiries, spam, scraped content, misleading listings, or unlawful material.',
      },
      {
        title: 'Listings and accuracy',
        body: 'Agents and agencies remain responsible for listing accuracy, mandate status, images, pricing, availability, and regulatory claims. Proppd may moderate, remove, or flag content that appears inaccurate, duplicated, stale, or abusive.',
      },
      {
        title: 'Enquiries and handoffs',
        body: 'Lead, saved-search, agency, valuation, and finance-readiness requests may be routed by structured email while backend persistence is being hardened. Proppd does not guarantee a response time, viewing, valuation outcome, loan approval, or transaction result.',
      },
      {
        title: 'Pilot-stage features',
        body: 'Some AgentOS, lead quality, valuation, and onboarding features are pilot-stage foundations. They are provided to shape workflow readiness and may change as Supabase-backed production operations go live.',
      },
    ],
  },
  cookies: {
    label: 'Cookie notice',
    title: 'Transparent tracking and essential storage',
    intro: 'How Proppd thinks about essential browser storage, analytics readiness, consent, and future operational diagnostics.',
    lastUpdated: '19 May 2026',
    contactSubject: 'Proppd cookie question',
    sections: [
      {
        title: 'Essential storage',
        body: 'Proppd may use essential browser storage for navigation, form state, authentication, saved preferences, and security controls. These are needed for the product to work reliably.',
      },
      {
        title: 'Analytics readiness',
        body: 'Analytics may be introduced to understand property search behaviour, listing performance, and conversion quality. Production analytics should be privacy-aware and disclosed clearly before relying on it for operations.',
      },
      {
        title: 'AgentOS and diagnostics',
        body: 'Future signed-in workflows may use operational diagnostics to support agents, resolve errors, and protect lead quality. Sensitive service-role and backend keys must remain server-side only.',
      },
      {
        title: 'Managing choices',
        body: 'You can control many cookies through your browser. If optional analytics or marketing tools are introduced, Proppd should provide clear consent and preference controls appropriate to the deployment stage.',
      },
    ],
  },
} as const satisfies Record<'privacy' | 'terms' | 'cookies', LegalPage>;

export type LegalPageKey = keyof typeof legalPages;

export function buildLegalContactMailto(page: LegalPage): string {
  const body = [
    `Page: ${page.label}`,
    `Last updated: ${page.lastUpdated}`,
    '',
    'Question / request:',
    '[please add your question]',
  ].join('\n');

  return `mailto:info@proppd.com?subject=${encodeURIComponent(page.contactSubject)}&body=${encodeURIComponent(body)}`;
}

export function getLegalPage(key: LegalPageKey): LegalPage {
  return legalPages[key];
}
