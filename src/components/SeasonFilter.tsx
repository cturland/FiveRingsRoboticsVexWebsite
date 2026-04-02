'use client';

type SeasonOption = {
  value: string;
  label: string;
};

type SeasonFilterProps = {
  options: SeasonOption[];
  selectedSeason: string;
  onChange: (season: string) => void;
};

export default function SeasonFilter({ options, selectedSeason, onChange }: SeasonFilterProps) {
  return (
    <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--color-muted)]">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Season</span>
      <select
        value={selectedSeason}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent font-semibold text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[var(--color-bg-elevated)] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
