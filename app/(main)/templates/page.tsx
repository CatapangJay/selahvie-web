import { templates } from "@/data/templates";
import TemplateGrid from "@/components/templates/TemplateGrid";

export const metadata = {
  title: "Wedding Website Templates — Selah Vie",
  description: "Browse our curated collection of beautiful, customizable wedding website templates.",
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
      {/* Header */}
      <div className="mb-16 max-w-2xl">
        <p className="label-luxury mb-4" style={{ color: "var(--color-tertiary)" }}>The Collection</p>
        <h1 className="display-lg">Find Your<br /><span style={{ color: "var(--color-primary)" }}>Perfect Style</span></h1>
        <p
          className="mt-6 text-lg leading-relaxed"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Every template is a carefully curated starting point. Each one yours to transform.
        </p>
      </div>

      <TemplateGrid templates={templates} />
    </div>
  );
}
