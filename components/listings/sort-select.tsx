'use client';

type Option = { value: string; label: string; href: string };

type Props = {
  options: Option[];
  value: string;
};

export function SortSelect({ options, value }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = options.find((o) => o.value === e.target.value);
    if (selected) window.location.assign(selected.href);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-[.16em] text-[#9CA3AF]">
        Sort:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={handleChange}
        className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none transition focus:border-[#4A3AFF] focus:ring-4 focus:ring-[#4A3AFF]/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
