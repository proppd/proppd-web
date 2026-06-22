'use client';

import { Share2, Copy, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  price: string;
  location: string;
}

export function ShareButtons({ url, title, price, location }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://proppd.com${url}`;
  const text = `${title} — ${price} in ${location}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        {copied ? <Check size={14} className="text-[#2563EB]" /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        <Facebook size={14} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        <Twitter size={14} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        <Linkedin size={14} />
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#1A1A2E] transition hover:border-[#4A3AFF] hover:text-[#4A3AFF]"
      >
        Print
      </button>
    </div>
  );
}
