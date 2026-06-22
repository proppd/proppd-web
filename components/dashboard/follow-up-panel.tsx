import { AlarmClock, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { LeadRecord } from '@/lib/leads/pipeline';
import { formatLeadStatus } from '@/lib/leads/pipeline';
import { formatIdleDuration, getFollowUps } from '@/lib/leads/follow-ups';

export function FollowUpPanel({ leads }: { leads: LeadRecord[] }) {
  const followUps = getFollowUps(leads).slice(0, 6);
  const overdue = followUps.filter((f) => f.urgency === 'overdue').length;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlarmClock size={18} className={overdue > 0 ? 'text-amber-600' : 'text-[#2563EB]'} />
          <h2 className="text-base font-bold text-[#1A1A2E]">Needs follow-up</h2>
        </div>
        {followUps.length > 0 && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${overdue > 0 ? 'bg-amber-50 text-amber-700' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
            {overdue > 0 ? `${overdue} overdue` : `${followUps.length} due soon`}
          </span>
        )}
      </div>

      {followUps.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F7F8FA] p-4 text-sm font-semibold text-[#6B7280]">
          <CheckCircle2 size={16} className="text-[#2563EB]" /> You&apos;re all caught up — no leads waiting on a reply.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {followUps.map(({ lead, hoursSinceActivity, urgency }) => (
            <a
              key={lead.id}
              href={`/dashboard/leads/${lead.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#F3F4F6] px-3 py-2.5 transition hover:border-[#4A3AFF]/30 hover:bg-[#F7F8FA]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#1A1A2E]">{lead.name}</p>
                <p className="truncate text-xs text-[#9CA3AF]">{formatLeadStatus(lead.status)} · no reply in {formatIdleDuration(hoursSinceActivity)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${urgency === 'overdue' ? 'bg-amber-50 text-amber-700' : 'bg-[#4A3AFF]/10 text-[#4A3AFF]'}`}>
                {urgency === 'overdue' ? 'Overdue' : 'Due soon'}
              </span>
            </a>
          ))}
          <a href="/dashboard/leads" className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]">
            View all leads <ArrowRight size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
