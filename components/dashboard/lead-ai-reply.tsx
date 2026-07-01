'use client';

import { useState } from 'react';
import { AlertCircle, Check, Copy, Loader2, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { buildWhatsAppHref } from '@/lib/leads/pipeline';
import type { LeadReplyChannel } from '@/lib/ai/lead-reply';

type Props = {
  leadId: string;
  listingTitle: string;
  email: string;
  phone: string;
  /** ANTHROPIC_API_KEY present on the server; renders a setup hint when false. */
  aiEnabled: boolean;
};

/**
 * AI reply drafting for a lead. Unlike quick-reply templates (canned text),
 * the draft responds to what the buyer actually wrote. The draft stays
 * editable — the agent reviews it, then sends via email or WhatsApp.
 */
export function LeadAiReply({ leadId, listingTitle, email, phone, aiEnabled }: Props) {
  const [channel, setChannel] = useState<LeadReplyChannel>('whatsapp');
  const [draft, setDraft] = useState('');
  const [draftChannel, setDraftChannel] = useState<LeadReplyChannel | null>(null);
  const [state, setState] = useState<{ kind: 'idle' | 'drafting' | 'ready' | 'error'; message: string }>({ kind: 'idle', message: '' });
  const [copied, setCopied] = useState(false);

  async function generate() {
    setState({ kind: 'drafting', message: '' });
    try {
      const response = await fetch(`/api/dashboard/leads/${encodeURIComponent(leadId)}/ai-reply`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        setState({ kind: 'error', message: data.error || 'Drafting failed. Try again.' });
        return;
      }
      setDraft(data.reply);
      setDraftChannel(channel);
      setState({ kind: 'ready', message: '' });
    } catch {
      setState({ kind: 'error', message: 'Network error. Try again.' });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const whatsappBase = buildWhatsAppHref(phone);
  const whatsappHref = whatsappBase && draft ? `${whatsappBase.split('?')[0]}?text=${encodeURIComponent(draft)}` : null;
  const emailHref = draft ? `mailto:${email}?subject=${encodeURIComponent(`Re: ${listingTitle}`)}&body=${encodeURIComponent(draft)}` : null;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#4A3AFF]" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">AI reply</p>
      </div>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-[#1A1A2E]">Draft a reply to this enquiry</h2>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#9CA3AF]">
        Drafted from the buyer&apos;s actual message and this lead&apos;s stage. Review and edit before sending.
      </p>

      {!aiEnabled ? (
        <p className="mt-3 rounded-xl bg-[#F7F8FA] p-3 text-xs font-bold leading-5 text-[#9CA3AF]">
          AI drafting is not enabled on this deployment. Use the quick replies below in the meantime.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-[#F7F8FA] p-1">
              {(['whatsapp', 'email'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChannel(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${channel === option ? 'bg-[#4A3AFF] text-white' : 'text-[#6B7280] hover:text-[#4A3AFF]'}`}
                >
                  {option === 'whatsapp' ? 'WhatsApp tone' : 'Email tone'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={state.kind === 'drafting'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4A3AFF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-60"
            >
              {state.kind === 'drafting' ? (
                <><Loader2 size={13} className="animate-spin" /> Drafting…</>
              ) : (
                <><Sparkles size={13} /> {draft ? 'Redraft' : 'Draft reply'}</>
              )}
            </button>
          </div>

          {state.kind === 'error' && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {state.message}
            </p>
          )}

          {draft && (
            <>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={7}
                aria-label="AI reply draft"
                className="mt-3 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-sm leading-6 text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {draftChannel === 'whatsapp' && whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-3 py-2 text-xs font-bold text-[#166534] transition hover:bg-[#DCFCE7]"
                  >
                    <MessageCircle size={13} /> Send on WhatsApp
                  </a>
                )}
                {draftChannel === 'email' && emailHref && (
                  <a
                    href={emailHref}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                  >
                    <Mail size={13} /> Open in email
                  </a>
                )}
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
                >
                  {copied ? <><Check size={13} className="text-[#2563EB]" /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
