import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#050A30]">
      <SiteHeader />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#3B49FF]">Login</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.07em] sm:text-6xl">Agent and admin access</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Authentication will connect to Supabase once the dedicated Proppd project is ready.</p>
          <a className="mt-8 inline-flex rounded-full bg-[#050A30] px-6 py-3 font-black text-white" href="mailto:info@proppd.com">Contact info@proppd.com</a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
