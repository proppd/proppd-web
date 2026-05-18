import Image from 'next/image';

export function ProppdLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center">
      <Image
        src="/proppd-logo-horizontal.png"
        alt="Proppd"
        width={1200}
        height={315}
        className={compact ? 'h-9 w-auto object-contain sm:h-10' : 'h-12 w-auto object-contain sm:h-14'}
        priority
      />
    </div>
  );
}
