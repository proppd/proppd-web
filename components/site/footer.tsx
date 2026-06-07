import type { ReactNode } from 'react';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="/" aria-label="Proppd home" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4A3AFF] text-sm font-bold text-white">P</span>
              <span className="text-xl font-bold text-[#1A1A2E]">Proppd</span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              A modern South African property portal for verified listings, direct enquiries, and agent-led stock.
            </p>
            <a className="mt-3 inline-block text-sm font-semibold text-[#4A3AFF] hover:text-[#3A2AE0]" href="mailto:info@proppd.com">
              info@proppd.com
            </a>
          </div>

          {/* Browse */}
          <FooterGroup
            title="Browse"
            links={[
              ['Properties', '/properties'],
              ['For sale', '/properties/for-sale'],
              ['To rent', '/properties/to-rent'],
              ['Saved homes', '/saved'],
              ['Home loans', '/home-loans'],
            ]}
          />

          {/* Professionals */}
          <FooterGroup
            title="Professionals"
            links={[
              ['Agents', '/agents'],
              ['Agencies', '/agencies'],
              ['List with us', '/list-with-us'],
            ]}
          />

          {/* Company */}
          <FooterGroup
            title="Company"
            links={[
              ['Business model', '/business'],
              ['Contact', '/contact'],
              ['Request valuation', '/request-valuation'],
              ['Log in', '/login'],
            ]}
          />

          {/* Legal */}
          <FooterGroup
            title="Legal"
            links={[
              ['Privacy', '/privacy'],
              ['Terms', '/terms'],
              ['Cookies', '/cookies'],
            ]}
          />
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 text-sm text-[#9CA3AF] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Proppd. All rights reserved.</p>
          <p>Verified listings, routed leads, and clean portal navigation.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#1A1A2E]">{title}</h3>
      <div className="mt-3 grid gap-2.5">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="text-sm text-[#6B7280] transition hover:text-[#4A3AFF]"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
