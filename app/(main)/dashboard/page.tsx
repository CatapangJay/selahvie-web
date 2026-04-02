"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { ExternalLink, Pencil, Globe } from "lucide-react";

const statusStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: {
    label: "Draft",
    color: "var(--color-on-surface-variant)",
    bg: "var(--color-surface-container-high)",
    border: "var(--color-outline)",
  },
  published: {
    label: "Published",
    color: "var(--color-surface)",
    bg: "var(--color-success)",
    border: "transparent",
  },
};

export default function DashboardPage() {
  const { configs } = useWeddingStore();
  const configList = Object.values(configs);

  return (
    <div
      className="mx-auto max-w-7xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>Your account</p>
          <h1 className="headline-md" style={{ fontWeight: 300 }}>Dashboard</h1>
        </div>
        <Link href="/templates">
          <ButtonSecondary size="sm">Add a template</ButtonSecondary>
        </Link>
      </div>

      {configList.length === 0 ? (
        <div
          className="flex flex-col items-start justify-center py-20 px-12"
          style={{
            background: "var(--color-surface-container)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-outline)",
          }}
        >
          <p
            className="font-serif mb-6"
            style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 300, color: "var(--color-outline)", fontStyle: "italic" }}
          >
            &empty;
          </p>
          <h2 className="headline-sm mb-3" style={{ fontWeight: 300 }}>No websites yet</h2>
          <p
            className="text-sm font-light mb-8 max-w-sm leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Browse our template gallery, pick the one that matches your vision, and purchase to get started.
          </p>
          <Link href="/templates">
            <ButtonPrimary size="lg">Browse templates</ButtonPrimary>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configList.map((config) => {
            const template = templates.find((t) => t.id === config.templateId);
            if (!template) return null;
            const status = statusStyles[config.status] ?? statusStyles.draft;

            return (
              <div
                key={config.id}
                className="group flex flex-col overflow-hidden"
                style={{
                  background: "var(--color-surface-container)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-outline)",
                }}
              >
                {/* Preview */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {config.heroImageUrl ? (
                    <Image src={config.heroImageUrl} alt={template.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <Image src={template.previewImage} alt={template.name} fill className="object-cover opacity-60" sizes="(max-width: 768px) 100vw, 33vw" />
                  )}
                  {/* Status badge */}
                  <span
                    className="absolute top-3 right-3 label-luxury px-2.5 py-1"
                    style={{
                      background: status.bg,
                      color: status.color,
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${status.border}`,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-5">
                  <p
                    className="font-serif"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 300, color: "var(--color-on-surface)" }}
                  >
                    {config.partner1Name && config.partner2Name
                      ? `${config.partner1Name} & ${config.partner2Name}`
                      : template.name}
                  </p>
                  {config.weddingDate && (
                    <p className="label-luxury mt-1" style={{ color: "var(--color-on-surface-muted)" }}>
                      {new Date(config.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}

                  <div
                    className="mt-auto pt-4 flex gap-2"
                    style={{ borderTop: "1px solid var(--color-outline)", marginTop: "1rem" }}
                  >
                    <Link href={`/dashboard/customize/${config.id}`} className="flex-1">
                      <ButtonPrimary size="sm" fullWidth>
                        <Pencil size={12} />
                        Customize
                      </ButtonPrimary>
                    </Link>
                    {config.status === "published" && (
                      <Link href={`/wedding/${config.id}`} target="_blank">
                        <ButtonSecondary size="sm">
                          <Globe size={12} />
                          <ExternalLink size={12} />
                        </ButtonSecondary>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
