"use client";

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  showNewOnly: boolean;
  onToggleNewOnly: () => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  resultCount: number;
}

const SCORE_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "25%+", value: 25 },
  { label: "50%+", value: 50 },
  { label: "75%+", value: 75 },
];

export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  showNewOnly,
  onToggleNewOnly,
  minScore,
  onMinScoreChange,
  resultCount,
}: FilterBarProps) {
  const allCategories = ["All", ...categories];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allCategories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full text-xs px-3 py-1 border transition-colors ${
              isActive
                ? "bg-charcoal text-cream border-charcoal"
                : "bg-white text-charcoal border-border hover:border-charcoal/30"
            }`}
          >
            {cat}
          </button>
        );
      })}

      <button
        onClick={onToggleNewOnly}
        className={`rounded-full text-xs px-3 py-1 border transition-colors ${
          showNewOnly
            ? "bg-gold text-white border-gold"
            : "bg-white text-charcoal border-border hover:border-charcoal/30"
        }`}
      >
        New only
      </button>

      <select
        value={minScore}
        onChange={(e) => onMinScoreChange(Number(e.target.value))}
        className="rounded-full text-xs px-3 py-1 border border-border bg-white text-charcoal cursor-pointer focus:outline-none focus:border-gold"
      >
        {SCORE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <span className="ml-auto font-mono text-xs text-charcoal-light">
        {resultCount} result{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
