"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  /** Jump the studio to a given step when a checklist item is clicked. */
  onGoToStep: (step: number) => void;
}

/**
 * First-run onboarding: a compact activation checklist that reads the config
 * and shows what's left before the couple can publish. Dismissible; reappears
 * only while the site is a draft and something's still incomplete.
 */
export default function OnboardingChecklist({ config, onGoToStep }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const items = [
    {
      step: 1,
      label: "Add your names & date",
      done: Boolean(config.partner1Name && config.partner2Name && config.weddingDate),
    },
    { step: 2, label: "Pick your colors", done: Boolean(config.themePresetId || config.primaryColor) },
    { step: 3, label: "Add a hero photo & your story", done: Boolean(config.heroImageUrl && config.coupleStory) },
    { step: 4, label: "Set your RSVP details", done: Boolean(config.rsvpDeadline) },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  // Hide once published, fully complete, or manually dismissed.
  if (dismissed || config.status === "published" || allDone) return null;

  return (
    <div
      className="mb-10 overflow-hidden rounded-2xl"
      style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)" }}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div>
          <p className="label-luxury" style={{ color: "var(--color-primary)" }}>Let&apos;s get you set up</p>
          <p className="mt-1 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
            A few steps and your website is ready to share — {doneCount} of {items.length} done.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss setup guide"
          className="flex h-9 w-9 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
          style={{ color: "var(--color-on-surface-muted)" }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-6 mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-surface-container-high)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / items.length) * 100}%`, background: "var(--color-primary)" }}
        />
      </div>

      <ul className="mt-4 px-3 pb-4">
        {items.map((item) => (
          <li key={item.step}>
            <button
              onClick={() => onGoToStep(item.step)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-container-high)]"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: item.done ? "var(--color-primary)" : "var(--color-surface-container-high)",
                  color: item.done ? "#fff" : "var(--color-on-surface-muted)",
                  border: item.done ? "none" : "1px solid var(--color-outline)",
                }}
              >
                {item.done ? <Check size={13} /> : <span className="text-xs">{item.step}</span>}
              </span>
              <span
                className="flex-1 text-sm"
                style={{
                  color: item.done ? "var(--color-on-surface-muted)" : "var(--color-on-surface)",
                  textDecoration: item.done ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
              <ChevronRight size={15} style={{ color: "var(--color-on-surface-muted)" }} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
