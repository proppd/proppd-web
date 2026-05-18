import Image from 'next/image';

export function ProppdLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/proppd-logo-light.png"
        alt="Proppd"
        width={compact ? 42 : 54}
        height={compact ? 42 : 54}
        className="h-10 w-10 rounded-2xl object-contain sm:h-12 sm:w-12"
        priority
      />
      <div className="leading-none">
        <div className="text-xl font-black tracking-[-.04em] text-[#050A30] sm:text-2xl">proppd</div>
        {!compact && <div className="mt-1 text-[10px] font-black uppercase tracking-[.22em] text-slate-500">Real property</div>}
      </div>
    </div>
  );
}
