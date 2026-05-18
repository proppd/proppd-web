import { ProppdLogo } from './logo';

const nav = [
  ['Search', '/properties'],
  ['For sale', '/properties/for-sale'],
  ['To rent', '/properties/to-rent'],
  ['Agents', '/agents'],
  ['Agencies', '/agencies'],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/[.88] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" aria-label="Proppd home">
          <ProppdLogo compact />
        </a>
        <nav className="hidden items-center gap-6 text-sm font800 text-slate-700 lg:flex">
          {nav.map(([label, href]) => (
            <a key={href} className="transition hover:text-[#3B49FF]" href={href}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a className="hidden rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex" href="/login">Log in</a>
          <a className="hidden whitespace-nowrap rounded-full bg-[#3B49FF] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#3B49FF]/20 ring-1 ring-[#3B49FF]/10 transition hover:bg-[#050A30] sm:inline-flex" href="/list-with-us">
            List with Proppd
          </a>
        </div>
      </div>
    </header>
  );
}
