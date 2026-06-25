import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type PricePoint = { price: number; recordedAt: string };

interface PriceHistoryProps {
  listingPrice: number;
  listedAt: string;
  history?: PricePoint[];
}

export function PriceHistory({ listingPrice, listedAt, history }: PriceHistoryProps) {
  // Use real recorded history when available; otherwise show the current asking
  // price as a single point (no fabricated movement).
  const points: PricePoint[] =
    history && history.length > 0
      ? history
      : [{ price: listingPrice, recordedAt: listedAt }];

  const fmt = (value: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);

  const first = points[0].price;
  const last = points[points.length - 1].price;
  const change = points.length >= 2 ? last - first : 0;
  const changePercent = points.length >= 2 && first > 0 ? ((change / first) * 100).toFixed(1) : '0.0';
  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? 'text-red-500' : change < 0 ? 'text-[#2563EB]' : 'text-[#9CA3AF]';

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <h3 className="text-base font-bold text-[#1A1A2E]">Price history</h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <TrendIcon size={16} className={trendColor} />
          <span className={`text-sm font-bold ${trendColor}`}>
            {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${changePercent}%`}
          </span>
        </div>
        <span className="text-xs text-[#9CA3AF]">since listing</span>
      </div>

      {/* Price timeline */}
      <div className="mt-4 relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E5E7EB]" />
        <div className="grid gap-3">
          {points.map((entry, i) => {
            const isLast = i === points.length - 1;
            const prev = i > 0 ? points[i - 1].price : null;
            const delta = prev !== null ? entry.price - prev : 0;
            return (
              <div key={`${entry.recordedAt}-${i}`} className="flex items-start gap-3">
                <div className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[#4A3AFF] bg-white" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1A1A2E]">{fmt(entry.price)}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {i === 0 ? 'Listed' : isLast ? 'Current asking' : delta < 0 ? 'Price reduced' : delta > 0 ? 'Price increased' : 'Updated'}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(entry.recordedAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(!history || history.length === 0) && (
        <p className="mt-4 text-[11px] text-[#9CA3AF]">
          Price changes will appear here as the asking price is updated.
        </p>
      )}
    </div>
  );
}
