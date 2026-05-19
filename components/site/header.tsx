import { ProppdLogo } from './logo';

const nav = [
  ['Buy', '/properties/for-sale'],
  ['Rent', '/properties/to-rent'],
  ['Sell', '/list-with-us'],
  ['Agents', '/agents'],
  ['Agencies', '/agencies'],
  ['Home Loans', '/request-valuation'],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <nav className="hidden flex-1 items-center gap-6 text-sm font-black text-slate-700 lg:flex">
          {nav.slice(0, 3).map(([label, href]) => (
            <a key={href} className="transition hover:text-[#3B49FF]" href={href}>{label}</a>
          ))}
        </nav>
        <a href="/" aria-label="Proppd home" className="flex flex-1 justify-start lg:justify-center">
          <ProppdLogo compact />
        </a>
        <nav className="hidden flex-1 items-center justify-end gap-6 text-sm font-black text-slate-700 lg:flex">
          {nav.slice(3).map(([label, href]) => (
            <a key={href} className="transition hover:text-[#3B49FF]" href={href}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <a className="rounded-full bg-[#3B49FF] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20" href="/properties">
            Search
          </a>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <a className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100" href="/login">Sign in</a>
          <a className="whitespace-nowrap rounded-full bg-[#3B49FF] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20 transition hover:bg-[#050A30]" href="/list-with-us">
            Advertise
          </a>
        </div>
      </div>
    </header>
  );
}
