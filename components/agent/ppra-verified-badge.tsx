import Image from 'next/image';

export function PpraVerifiedBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const imgSize = size === 'sm' ? 44 : 72;

  return (
    <span
      title="Verified against the Property Practitioners Regulatory Authority (PPRA) — valid Fidelity Fund Certificate."
      className={`inline-flex ${className}`}
    >
      <Image
        src="/ppra-verified-badge.png"
        alt="Agent Verified by the PPRA"
        width={imgSize}
        height={imgSize}
        className="drop-shadow-md"
      />
    </span>
  );
}
