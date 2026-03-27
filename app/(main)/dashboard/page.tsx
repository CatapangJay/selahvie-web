"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { templates } from "@/data/templates";
import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { ExternalLink, Pencil, Globe } from "lucide-react";

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "var(--color-on-surface-variant)", bg: "var(--color-surface-container-high)" },
  published: { label: "Published", color: "white", bg: "var(--color-secondary)" },
};

export default function DashboardPage() {
  const { configs } = useWeddingStore();
  const configList = Object.values(configs);

  return (
    <div className="mx-auto max-w-7xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
      <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-luxury mb-2" style={{ color: "var(--color-tertiary)" }}>Your Account</p>
          <h1 className="headline-md">Wedding Dashboard</h1>
        </div>
        <Link href="/templates">
          <ButtonSecondary size="sm">+ Add Template</ButtonSecondary>
        </Link>
      </div>

      {configList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-3xl py-24 text-center"
          style={{ background: "var(--color-surface-container-low)" }}
        >
          <p className="text-5xl mb-6">💐</p>
          <h2 className="headline-sm mb-3">No websites yet</h2>
          <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Browse our template gallery, select the one that matches your vision, and purchase to get started.
          </p>
          <Link href="/templates">
            <ButtonPrimary size="lg">Browse Templates</ButtonPrimary>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {configList.map((config) => {
            const template = templates.find((t) => t.id === config.templateId);
            if (!template) return null;
            const status = statusStyles[config.status] ?? statusStyles.draft;

            return (
              <div
                key={config.id}
                className="group rounded-2xl overflow-hidden shadow-ambient"
                style={{ background: "var(--color-surface-container-low)" }}
              >
                {/* Preview */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {config.heroImageUrl ? (
                    <Image src={config.heroImageUrl} alt={template.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <Image src={template.previewImage} alt={template.name} fill className="object-cover opacity-70" sizes="(max-width: 768px) 100vw, 33vw" />
                  )}
                  {/* Status badge */}
                  <span
                    className="absolute top-3 right-3 label-luxury rounded-full px-3 py-1 text-[10px]"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p
                    className="headline-sm text-base"
                    style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
                  >
                    {config.partner1Name && config.partner2Name
                      ? `${config.partner1Name} & ${config.partner2Name}`
                      : template.name}
                  </p>
                  {config.weddingDate && (
                    <p className="label-luxury mt-1 text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
                      {new Date(config.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/customize/${config.id}`} className="flex-1">
                      <ButtonPrimary size="sm" fullWidth>
                        <Pencil size={13} />
                        Customize
                      </ButtonPrimary>
                    </Link>
                    {config.status === "published" && (
                      <Link href={`/wedding/${config.id}`} target="_blank">
                        <ButtonSecondary size="sm">
                          <Globe size={13} />
                          <ExternalLink size={13} />
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
