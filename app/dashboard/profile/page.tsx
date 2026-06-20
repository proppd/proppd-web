import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BadgeCheck, ListPlus, MessageCircle, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AgentProfileEditor } from '@/components/agent/agent-profile-editor';
import { getPortalServerUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: { absolute: 'Profile | Proppd' },
  description: 'Edit your agent profile.',
  alternates: { canonical: '/dashboard/profile' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getPortalServerUser();
  if (!user) {
    redirect('/login?next=%2Fdashboard%2Fprofile');
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A2E]">Edit your profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">Update your public agent details and keep the operational tools connected to listings, leads, and agency handoff quality.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <AgentProfileEditor />
            <aside className="space-y-4">
              <div className="rounded-xl bg-[#1A1A2E] p-5 text-white shadow-sm">
                <BadgeCheck size={26} className="text-[#00C9A7]" />
                <h2 className="mt-3 text-xl font-bold tracking-tight">Agent readiness</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-white/65">
                  Complete the essentials buyers use to trust a response: identity, agency, direct contact details, and clear service areas.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Setup checklist</p>
                <div className="mt-4 space-y-3">
                  <ChecklistItem>Public name and agency are accurate.</ChecklistItem>
                  <ChecklistItem>Phone or WhatsApp reaches the right agent.</ChecklistItem>
                  <ChecklistItem>Areas served match active listings.</ChecklistItem>
                  <ChecklistItem>Bio explains local experience in plain English.</ChecklistItem>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#00C9A7]">After saving</p>
                <div className="mt-4 grid gap-2">
                  <ProfileToolLink icon={<ListPlus size={16} />} label="Manage listings" text="Create and edit stock tied to this profile." href="/dashboard/listings" />
                  <ProfileToolLink icon={<MessageCircle size={16} />} label="Open CRM" text="Review enquiries and follow-up history." href="/dashboard/leads" />
                  <ProfileToolLink icon={<ShieldCheck size={16} />} label="Agent command centre" text="Return to workspace tools and lead priorities." href="/dashboard" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function ChecklistItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm font-bold leading-6 text-[#6B7280]">
      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E6FBF7] text-[#00C9A7]">
        <BadgeCheck size={12} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function ProfileToolLink({ icon, label, text, href }: { icon: ReactNode; label: string; text: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-xl bg-[#F7F8FA] p-3 transition hover:bg-white hover:ring-1 hover:ring-[#4A3AFF]/20">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A3AFF]/10 text-[#4A3AFF]">{icon}</span>
      <span>
        <span className="block text-sm font-bold text-[#1A1A2E]">{label}</span>
        <span className="mt-0.5 block text-xs font-bold leading-5 text-[#9CA3AF]">{text}</span>
      </span>
    </a>
  );
}
