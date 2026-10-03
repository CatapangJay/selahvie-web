"use client";

import { WeddingTemplate, TemplateTag } from "@/types/template";
import { TEMPLATE_TAGS, SORT_OPTIONS } from "@/lib/constants";
import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useHydrated } from "@/lib/useHydrated";
import { formatPrice } from "@/lib/utils";
import TemplatePreviewMock from "./TemplatePreviewMock";
import Reveal from "@/components/ui/Reveal";

interface Props {
  templates: WeddingTemplate[];
}

const SAMPLE_COUPLES: [string, string][] = [
  ["Ava", "Liam"],
  ["Sofia", "Noah"],
  ["Mia", "Ethan"],
  ["Isla", "Kai"],
  ["Lena", "Theo"],
];

export default function TemplateGrid({ templates }: Props) {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const hydrated = useHydrated();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favCount = hydrated ? favoriteIds.length : 0;

  const filtered = templates
    .filter((t) => (onlyFavorites ? favoriteIds.includes(t.id) : true))
    .filter((t) => (activeTag === "All" ? true : t.tags.includes(activeTag as TemplateTag)))
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
        className="mb-16 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderBottom: "1px solid var(--color-outline)" }}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOnlyFavorites((v) => !v)}
            aria-pressed={onlyFavorites}
            className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 px-3 py-1.5 transition-all duration-200"
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
              className="label-luxury inline-flex min-h-[36px] cursor-pointer items-center px-3 py-1.5 transition-all duration-200"
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

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="label-luxury min-h-[36px] cursor-pointer px-4 py-2 outline-none"
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
          <p className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", fontWeight: 300, color: "var(--color-outline)", fontStyle: "italic" }}>
            &empty;
          </p>
          <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            {onlyFavorites
              ? "You haven't saved any templates yet. Tap the heart on a template to save it here."
              : "No templates match that filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => {
            const favorited = hydrated && favoriteIds.includes(t.id);
            return (
              <Reveal key={t.id} index={i % 3} className="group relative flex flex-col">
                {/* Preview */}
                <Link
                  href={`/templates/${t.id}`}
                  className="relative block overflow-hidden shadow-ambient"
                  style={{ aspectRatio: "4/5", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
                  aria-label={`View ${t.name}`}
                >
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]">
                    <TemplatePreviewMock template={t} couple={SAMPLE_COUPLES[i % SAMPLE_COUPLES.length]} />
                  </div>

                  {/* Live-preview affordance on hover */}
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  >
                    <span
                      className="label-luxury inline-flex items-center gap-1.5 px-4 py-2"
                      style={{ background: "rgba(253,248,247,0.92)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", backdropFilter: "blur(4px)" }}
                    >
                      View template <ArrowRight size={12} />
                    </span>
                  </span>
                </Link>

                {/* Favorite heart (top-right, above the link) */}
                <button
                  onClick={() => toggleFavorite(t.id)}
                  aria-pressed={favorited}
                  aria-label={favorited ? `Remove ${t.name} from saved` : `Save ${t.name}`}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ background: "rgba(253,248,247,0.9)", backdropFilter: "blur(4px)" }}
                >
                  <Heart size={15} style={{ color: favorited ? "var(--color-primary)" : "var(--color-on-surface-muted)" }} fill={favorited ? "var(--color-primary)" : "none"} />
                </button>

                {/* Info */}
                <div className="mt-4 flex flex-1 flex-col px-1">
                  <p className="label-luxury mb-1.5" style={{ color: "var(--color-primary)" }}>{t.tags.join(" · ")}</p>
                  <h2
                    style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-on-surface)", lineHeight: 1.2 }}
                  >
                    {t.name}
                  </h2>
                  <div className="mt-3 flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--color-outline)" }}>
                    <p className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-primary)" }}>
                      {formatPrice(t.price)}
                    </p>
                    <Link
                      href={`/preview/${t.id}`}
                      className="label-luxury transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-on-surface-muted)" }}
                    >
                      Live preview
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
