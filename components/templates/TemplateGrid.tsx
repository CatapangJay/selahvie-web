"use client";

import { WeddingTemplate, TemplateTag } from "@/types/template";
import { TEMPLATE_TAGS, SORT_OPTIONS } from "@/lib/constants";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useHydrated } from "@/lib/useHydrated";
import TemplateCard from "./TemplateCard";

interface Props {
  templates: WeddingTemplate[];
}

export default function TemplateGrid({ templates }: Props) {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const hydrated = useHydrated();
  // Empty until hydrated so the server/first-render markup matches.
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const favCount = hydrated ? favoriteIds.length : 0;

  const filtered = templates
    .filter((t) => (onlyFavorites ? favoriteIds.includes(t.id) : true))
    .filter((t) =>
      activeTag === "All" ? true : t.tags.includes(activeTag as TemplateTag)
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div>
      {/* Filter bar */}
      <div
        className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6"
        style={{ borderBottom: "1px solid var(--color-outline)" }}
      >
        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOnlyFavorites((v) => !v)}
            aria-pressed={onlyFavorites}
            className="label-luxury inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] transition-all duration-200 cursor-pointer"
            style={{
              background: onlyFavorites ? "var(--color-primary)" : "transparent",
              color: onlyFavorites ? "var(--color-surface)" : "var(--color-on-surface-variant)",
              border: `1px solid ${onlyFavorites ? "var(--color-primary)" : "var(--color-outline)"}`,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Heart size={12} fill={onlyFavorites ? "currentColor" : "none"} />
            Saved{favCount > 0 ? ` (${favCount})` : ""}
          </button>
          {TEMPLATE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="label-luxury inline-flex items-center px-3 py-1.5 min-h-[36px] transition-all duration-200 cursor-pointer"
              style={{
                background: activeTag === tag ? "var(--color-primary)" : "transparent",
                color: activeTag === tag ? "var(--color-surface)" : "var(--color-on-surface-variant)",
                border: `1px solid ${activeTag === tag ? "var(--color-primary)" : "var(--color-outline)"}`,
                borderRadius: "var(--radius-sm)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="label-luxury px-4 py-2 min-h-[36px] outline-none cursor-pointer"
          style={{
            background: "var(--color-surface-container)",
            color: "var(--color-on-surface-variant)",
            border: "1px solid var(--color-outline)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p
            className="font-serif"
            style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", fontWeight: 300, color: "var(--color-outline)", fontStyle: "italic" }}
          >
            &empty;
          </p>
          <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            {onlyFavorites
              ? "You haven't saved any templates yet. Tap the heart on a template to save it here."
              : "No templates match that filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
