import type { Metadata } from 'next';
import { PlusCircle, Pencil, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ListingEditorForm } from '@/components/listings/listing-editor-form';
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { loadMyPortalListings, loadPortalDiagnostics, loadPortalUserAccess } from '@/lib/proppd/backend';
import { getPortalServerUser } from '@/lib/supabase/server';
import { getSupabaseBrowserConfig } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: {
    absolute: 'Manage listings | Proppd',
  },
  description: 'Create and edit Proppd listings from the authenticated management area.',
  alternates: { canonical: '/dashboard/listings' },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const config = getSupabaseBrowserConfig();
  const user = await getPortalServerUser();
  const diagnostics = await loadPortalDiagnostics();

  if (!user) {
    if (!config) {
      const readiness = [
        { label: 'Live mode', value: diagnostics.backendMode === 'database' ? 'Database connected' : 'Demo fallback' },
        { label: 'Agent login', value: diagnostics.databaseConfigured ? 'Configured' : 'Missing' },
        { label: 'Listing sync', value: diagnostics.canReadDatabase ? 'Healthy' : 'Blocked' },
      ];

      return (
        <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
          <SiteHeader />
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_.95fr]">
              <div className="rounded-xl bg-white p-8 shadow-sm sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Listing backend readiness</p>
                <h1 className="mt-4 text-4xl font-bold tracking-[-.06em]">Get the listing system ready for live agents.</h1>
                <p className="mt-4 text-lg leading-8 text-[#6B7280]">
                  Proppd already has the listing editor and database-backed workflow. This deployment still needs the Supabase browser config before agents can sign in from the live site.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <BackendCard title="Connect env" text="Provide the public Supabase URL and publishable key." />
                  <BackendCard title="Enable auth" text="Signed-in agents can create drafts, publish changes, and keep stock current." />
                  <BackendCard title="Persist records" text="Once connected, drafts save to the database instead of staying in demo mode." />
                </div>
                <div className="mt-8 rounded-xl border border-[#c8f6ec] bg-[#E6FBF7] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#00C9A7]">Local admin session</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#00C9A7]">
                    If you are testing on localhost without Supabase env vars, open the temporary admin session for <span className="font-bold">info@proppd.com</span>.
                  </p>
                  <a className="mt-4 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]" href="/auth/dev-admin?next=%2Fdashboard%2Flistings">
                    Open local admin session
                  </a>
                </div>
                <div className="mt-5 rounded-[1.75rem] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Need the live backend check?</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">
                    Open diagnostics to confirm auth, database connectivity, and the current readiness signals.
                  </p>
                  <a className="mt-4 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]" href="/admin/diagnostics">
                    Open backend diagnostics
                  </a>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {readiness.map((item) => (
                    <div key={item.label} className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{item.label}</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{item.value}</p>
                    </div>
                  ))}
                </div>

              </div>

              <aside className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm sm:p-8">
                <ShieldCheck className="text-[#00C9A7]" size={30} />
                <h2 className="mt-4 text-3xl font-bold tracking-[-.05em]">What unlocks next</h2>
                <div className="mt-5 space-y-3 text-sm font-bold leading-6 text-white/72">
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Create a real listing draft with title, location, price, and property type.</p>
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Edit the draft directly in the workspace and push updates to the live record.</p>
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Keep the agent and agency relationship tied to the signed-in account.</p>
                </div>
              </aside>
            </div>
          </section>

          <section className="px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-4 md:grid-cols-3">
                <FallbackCard title="No data lost" text="Once the backend is connected, draft records persist immediately and remain editable." />
                <FallbackCard title="What the workspace does" text="Agents can create, update, and publish listings without leaving the dashboard." />
                <FallbackCard title="Need a hand?" text="If you are setting this up for a live agency, Proppd can wire the first pass with you." />
              </div>
            </div>
          </section>
          <SiteFooter />
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
        <SiteHeader />
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
            <div className="rounded-xl bg-white p-8 shadow-sm sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Access required</p>
              <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Sign in to manage listings.</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">
                Use the invite-only Proppd login to create new stock, publish drafts, and keep your agency listings current.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="rounded-full bg-[#1A1A2E] px-6 py-3 text-sm font-bold text-white" href="/login?next=%2Fdashboard%2Flistings">
                  Go to login
                </a>
                <a className="rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-bold text-[#1A1A2E]" href="mailto:info@proppd.com?subject=Proppd%20listing%20access">
                  Request access
                </a>
              </div>
              <div className="mt-6 rounded-[1.75rem] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9CA3AF]">Didn’t get the login link?</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">
                  Check spam and promotions first, then open backend diagnostics if the invite still does not land.
                </p>
                <a className="mt-4 inline-flex rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4A3AFF]" href="/admin/diagnostics">
                  Open backend diagnostics
                </a>
              </div>
            </div>
            <aside className="rounded-xl bg-[#1A1A2E] p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-[#00C9A7]">Magic link login</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Access your control room</h2>
              <div className="mt-5">
                <SupabaseLoginForm supabaseUrl={config.url} publishableKey={config.publishableKey} nextPath="/dashboard/listings" />
              </div>
            </aside>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const access = await loadPortalUserAccess(user.id, user.email ?? undefined);
  if (!access) {
    redirect('/login?next=%2Fdashboard%2Flistings');
  }

  const listings = await loadMyPortalListings(access);
  const items = listings.items;
  const liveReady = diagnostics.backendMode === 'database' && diagnostics.canReadDatabase && diagnostics.databaseConfigured && diagnostics.browserSupabaseConfigured && diagnostics.serviceRoleConfigured;
  const localAdminSession = !config && user.email?.trim().toLowerCase() === 'info@proppd.com';
  const listingSourceLabel =
    listings.source === 'database'
      ? 'Live database'
      : listings.source === 'demo'
        ? localAdminSession
          ? 'Demo-backed admin session'
          : 'Demo mode'
        : listings.source === 'empty'
          ? 'Empty database'
          : 'Data error';
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1A1A2E]">
      <SiteHeader />

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-[#1A1A2E] p-8 text-white shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-[#00C9A7]">Listings management</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="text-5xl font-bold tracking-[-.07em]">Create, edit, and publish listings.</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                  {access.agencyName ?? 'Your agency'} · {access.agentName ?? 'Linked account'} · {items.length} managed listing{items.length === 1 ? '' : 's'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {localAdminSession ? (
                    <span className="rounded-full bg-[#E6FBF7] px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#00C9A7]">
                      Local admin session · info@proppd.com
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-white/70">
                    {liveReady ? 'Live backend ready' : 'Demo-backed workspace'}
                  </span>
                </div>
              </div>
              <a className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold !text-[#1A1A2E]" href="/dashboard/listings/new">
                <PlusCircle size={18} /> New listing
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ReadyCard title="Live mode" value={diagnostics.backendMode === 'database' ? 'Database connected' : 'Demo fallback'} detail={diagnostics.backendMode === 'database' ? 'Live reads and writes are available.' : 'Database config still needs to land.'} tone={diagnostics.backendMode === 'database' ? 'good' : 'warn'} />
            <ReadyCard title="Listing sync" value={diagnostics.canReadDatabase ? 'Healthy' : 'Blocked'} detail={diagnostics.listingCount !== null ? `${diagnostics.listingCount} live listings visible` : 'Read access is not confirmed yet.'} tone={diagnostics.canReadDatabase ? 'good' : 'warn'} />
            <ReadyCard title="Agent account" value={access.agentName ? 'Linked agent' : 'Unlinked account'} detail={access.agencyName ?? 'No agency linked yet.'} tone={access.agentName ? 'good' : 'warn'} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#4A3AFF]">Your stock</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">Managed listings</h2>
                </div>
                <div className="rounded-full bg-[#E6FBF7] px-4 py-2 text-sm font-bold text-[#00C9A7]">
                  {listingSourceLabel}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-[#F7F8FA] p-8 text-center">
                  <ShieldCheck className="mx-auto text-[#4A3AFF]" size={28} />
                  <h3 className="mt-4 text-2xl font-bold tracking-[-.04em]">No listings yet</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#9CA3AF]">
                    Start by creating a draft listing. It will be stored in the database and can be published later.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {items.map((listing) => (
                    <article key={listing.slug} className="overflow-hidden rounded-[1.75rem] border border-[#E5E7EB] bg-[#F7F8FA]">
                      <div className={`h-28 bg-gradient-to-br ${listing.gradient}`} />
                      <div className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{listing.purpose}</p>
                            <h3 className="mt-1 text-xl font-bold tracking-[-.04em]">{listing.title}</h3>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-[#6B7280]">
                            {listing.featured ? 'Featured' : listing.purpose}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#9CA3AF]">{listing.location}</p>
                        <p className="font-bold">{listing.price}</p>
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#9CA3AF]">{listing.type}</p>
                          <a className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-4 py-2 text-sm font-bold text-white" href={`/dashboard/listings/${listing.slug}/edit`}>
                            <Pencil size={16} /> Edit
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold tracking-[-.04em]">Publishing workflow</h2>
                <ol className="mt-4 space-y-3 text-sm font-bold leading-6 text-[#6B7280]">
                  <li>1. Create a draft listing with correct property details.</li>
                  <li>2. Edit until the stock is ready for public viewing.</li>
                  <li>3. Change the status to available when live.</li>
                </ol>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#E6FBF7] p-6">
                <p className="text-sm font-bold uppercase tracking-[.18em] text-[#00C9A7]">Authenticated backend</p>
                <p className="mt-3 text-sm font-bold leading-6 text-[#00C9A7]">
                  This page now uses server-side Supabase sessions and direct database-backed listing persistence instead of demo data.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function BackendCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </div>
  );
}

function ReadyCard({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: 'good' | 'warn' }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
      <p className={`mt-2 text-xl font-bold ${tone === 'good' ? 'text-[#00C9A7]' : 'text-amber-700'}`}>{value}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{detail}</p>
    </div>
  );
}

function FallbackCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4A3AFF]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#6B7280]">{text}</p>
    </div>
  );
}
