import { ShieldCheck, BadgeCheck, FileCheck2, UserCheck } from 'lucide-react';

export function PpraTrustSection() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="overflow-hidden rounded-2xl proppd-panel">
          <div className="grid gap-0 lg:grid-cols-[1fr_auto]">

            {/* Left — copy */}
            <div className="p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#047857]">
                <ShieldCheck size={13} className="text-[#059669]" /> A South African first
              </div>

              <h2 className="mt-5 max-w-lg text-4xl font-bold tracking-[-.06em] text-white sm:text-5xl">
                Every agent on Proppd is PPRA&#8209;verified.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
                Before an agent earns a profile on Proppd, we cross-check them against the{' '}
                <span className="font-bold text-white">Property Practitioners Regulatory Authority</span> and
                confirm they hold a valid Fidelity Fund Certificate — the legal requirement to practise
                real estate in South Africa. No certificate, no listing.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustPill icon={<FileCheck2 size={16} />} label="Fidelity Fund Certificate" detail="Cross-checked against PPRA records" />
                <TrustPill icon={<BadgeCheck size={16} />} label="Active & compliant" detail="Ongoing status, not a one-off check" />
                <TrustPill icon={<UserCheck size={16} />} label="Identity confirmed" detail="Matched to the practitioner register" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1A1A2E] shadow-sm transition hover:bg-white/90"
                  href="/agents"
                >
                  <ShieldCheck size={15} className="text-[#059669]" /> Browse verified agents
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/8"
                  href="/list-with-us"
                >
                  List your agency
                </a>
              </div>
            </div>

            {/* Right — visual badge */}
            <div className="hidden items-center justify-center border-l border-white/8 bg-white/4 px-12 lg:flex">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#A7F3D0]/40 bg-[#ECFDF5]/10 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                  <ShieldCheck size={56} className="text-[#34D399]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">PPRA</p>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Verified</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function TrustPill({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="rounded-xl bg-white/8 p-4">
      <div className="flex items-center gap-2 text-[#34D399]">{icon}</div>
      <p className="mt-2 text-sm font-bold text-white">{label}</p>
      <p className="mt-1 text-xs leading-5 text-white/55">{detail}</p>
    </div>
  );
}
