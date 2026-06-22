import type { ReactNode } from 'react';
import { ProppdLogo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Top row */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" aria-label="Proppd home">
              <ProppdLogo />
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
              ['Sell or rent it out', '/my-properties'],
              ['Saved homes', '/saved'],
              ['Home loans', '/home-loans'],
            ]}
          />

          {/* Popular areas */}
          <FooterGroup
            title="Popular areas"
            links={[
              ['For sale in Cape Town', '/properties/for-sale/cape-town'],
              ['To rent in Cape Town', '/properties/to-rent/cape-town'],
              ['For sale in Johannesburg', '/properties/for-sale/johannesburg'],
              ['To rent in Johannesburg', '/properties/to-rent/johannesburg'],
              ['Agents in Cape Town', '/estate-agents/cape-town'],
              ['Agents in Johannesburg', '/estate-agents/johannesburg'],
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
              ['Sign up', '/signup'],
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
        <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 text-xs text-[#9CA3AF] sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
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
      <div className="mt-3 grid gap-2">
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
