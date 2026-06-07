import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceHistoryProps {
  listingPrice: number;
  listedAt: string;
}

export function PriceHistory({ listingPrice, listedAt }: PriceHistoryProps) {
  // Simulated price history — in production this comes from the database
  const history = [
    { date: listedAt, price: listingPrice, label: 'Listed' },
    { date: listedAt, price: listingPrice, label: 'Current asking' },
  ];

  const fmt = (value: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);

  const change = history.length >= 2 ? history[history.length - 1].price - history[0].price : 0;
  const changePercent = history.length >= 2 && history[0].price > 0
    ? ((change / history[0].price) * 100).toFixed(1)
    : '0.0';
  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? 'text-red-500' : change < 0 ? 'text-[#00C9A7]' : 'text-[#9CA3AF]';

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
          {history.map((entry, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[#4A3AFF] bg-white" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A1A2E]">{fmt(entry.price)}</p>
                <p className="text-xs text-[#9CA3AF]">{entry.label}</p>
                <p className="text-xs text-[#9CA3AF]">
                  {new Intl.DateTimeFormat('en-ZA', { month: 'short', year: 'numeric' }).format(new Date(entry.date))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#9CA3AF]">
        Price history is illustrative. Full history available after data integration.
      </p>
    </div>
  );
}
