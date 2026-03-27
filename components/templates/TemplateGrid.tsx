"use client";

import { WeddingTemplate, TemplateTag } from "@/types/template";
import { TEMPLATE_TAGS, SORT_OPTIONS } from "@/lib/constants";
import { useState } from "react";
import TemplateCard from "./TemplateCard";

interface Props {
  templates: WeddingTemplate[];
}

export default function TemplateGrid({ templates }: Props) {
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");

  const filtered = templates
    .filter((t) =>
      activeTag === "All" ? true : t.tags.includes(activeTag as TemplateTag)
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // featured: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="rounded-full px-4 py-1.5 label-luxury transition-all duration-200"
              style={{
                background: activeTag === tag ? "var(--color-primary)" : "var(--color-surface-container-low)",
                color: activeTag === tag ? "white" : "var(--color-on-surface-variant)",
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
          className="rounded-lg border-0 bg-[var(--color-surface-container-low)] px-4 py-2 text-sm text-[var(--color-on-surface)] outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-center">
          <p className="text-[var(--color-on-surface-variant)]">No templates match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
