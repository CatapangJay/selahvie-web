import { templates } from "@/data/templates";
import TemplateGrid from "@/components/templates/TemplateGrid";

export const metadata = {
  title: "Wedding website templates — Selah Vie",
  description: "Browse our curated collection of beautiful, customizable wedding website templates.",
};

export default function TemplatesPage() {
  return (
    <div>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "clamp(3.5rem, 8vw, 6rem)",
          paddingBottom: "clamp(3rem, 6vw, 5rem)",
          borderBottom: "1px solid var(--color-outline)",
          background: "var(--color-surface-container-low)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <p className="label-luxury mb-5" style={{ color: "var(--color-on-surface-muted)" }}>
            The collection
          </p>
          <h1 className="display-md">
            Find your
            <span
              style={{
                fontStyle: "italic",
                color: "var(--color-primary)",
                marginLeft: "0.5ch",
              }}
            >
              perfect style
            </span>
          </h1>
          <p
            className="mt-6 text-base font-light leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", maxWidth: 480 }}
          >
            Every template is a carefully curated starting point — each one yours to transform.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div
        className="mx-auto max-w-7xl px-6"
        style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
      >
        <TemplateGrid templates={templates} />
      </div>
    </div>
  );
}
