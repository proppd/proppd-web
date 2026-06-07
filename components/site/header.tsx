import { ProppdLogo } from './logo';
import { SavedHomesLink } from './saved-homes-link';

const nav = [
  ['Buy', '/properties/for-sale'],
  ['Rent', '/properties/to-rent'],
  ['Sell', '/list-with-us'],
  ['Agents', '/agents'],
  ['Agencies', '/agencies'],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" aria-label="Proppd home" className="shrink-0">
          <ProppdLogo compact />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#6B7280] lg:flex">
          {nav.map(([label, href]) => (
            <a key={href} className="transition hover:text-[#1A1A2E]" href={href}>{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SavedHomesLink className="hidden items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] lg:inline-flex" />
          <a className="rounded-lg bg-[#4A3AFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3A2AE0]" href="/properties">
            Search
          </a>
          <a className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex" href="/login">
            Sign in
          </a>
          <a className="hidden rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF] sm:inline-flex" href="/list-with-us">
            List with us
          </a>
        </div>
      </div>
    </header>
  );
}
