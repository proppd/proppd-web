'use client';

import { useState } from 'react';
import { Check, Copy, Mail, MessageCircle, MessagesSquare } from 'lucide-react';
import { LEAD_TEMPLATES, fillTemplate, type LeadTemplate } from '@/lib/leads/templates';
import { buildWhatsAppHref } from '@/lib/leads/pipeline';

type Props = {
  firstName: string;
  listingTitle: string;
  agentName: string;
  agency: string;
  email: string;
  phone: string;
};

export function QuickReplyTemplates({ firstName, listingTitle, agentName, agency, email, phone }: Props) {
  const [activeId, setActiveId] = useState<string>(LEAD_TEMPLATES[0]?.id ?? '');
  const [copied, setCopied] = useState(false);

  const active = LEAD_TEMPLATES.find((template) => template.id === activeId) ?? LEAD_TEMPLATES[0];
  const message = active ? fillTemplate(active.body, { firstName, listingTitle, agentName, agency }) : '';

  const whatsappBase = buildWhatsAppHref(phone);
  const whatsappHref = whatsappBase
    ? `${whatsappBase.split('?')[0]}?text=${encodeURIComponent(message)}`
    : null;
  const emailHref = `mailto:${email}?subject=${encodeURIComponent(`Re: ${listingTitle}`)}&body=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MessagesSquare size={16} className="text-[#4A3AFF]" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#4A3AFF]">Quick replies</p>
      </div>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-[#1A1A2E]">Reply in one tap</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {LEAD_TEMPLATES.map((template: LeadTemplate) => (
          <button
            key={template.id}
            type="button"
            onClick={() => setActiveId(template.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              template.id === activeId
                ? 'bg-[#4A3AFF] text-white'
                : 'bg-[#F7F8FA] text-[#6B7280] hover:bg-[#4A3AFF]/10 hover:text-[#4A3AFF]'
            }`}
          >
            {template.label}
          </button>
        ))}
      </div>

      <p className="mt-3 rounded-xl bg-[#F7F8FA] p-3 text-sm leading-6 text-[#1A1A2E]">{message}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-3 py-2 text-xs font-bold text-[#166534] transition hover:bg-[#DCFCE7]"
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        <a
          href={emailHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
        >
          <Mail size={13} /> Email
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#6B7280] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
        >
          {copied ? <><Check size={13} className="text-[#2563EB]" /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
    </div>
  );
}
