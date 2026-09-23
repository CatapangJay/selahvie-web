"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

/** FAQ accordion. Renders nothing until the couple adds a question. */
export default function FaqSection({ config, primary, accent }: Props) {
  const faq = (config.faq ?? []).filter((f) => f.question.trim());
  const [open, setOpen] = useState<string | null>(null);

  if (faq.length === 0) return null;

  return (
    <section className="py-24" id="faq">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-12 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>Questions</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>Good to Know</h2>
        </div>

        <ul className="flex flex-col gap-3">
          {faq.map((item) => {
            const isOpen = open === item.id;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{ background: "var(--color-surface-container-low)", border: `1px solid ${accent}25` }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{item.question}</span>
                  <Plus
                    size={18}
                    className="shrink-0 transition-transform duration-300"
                    style={{ color: primary, transform: isOpen ? "rotate(45deg)" : "none" }}
                  />
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
