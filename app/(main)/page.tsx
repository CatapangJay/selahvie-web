import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { templates } from "@/data/templates";
import { formatPrice } from "@/lib/utils";

export default function HomePage() {
  const featured = templates.filter((t) => t.isFeatured).slice(0, 3);
  const minPrice = Math.min(...templates.map((t) => t.price));

  return (
    <div>
      {/* ─── Hero — bordeaux drenched ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "var(--bordeaux)",
          paddingTop: "clamp(6rem, 14vw, 11rem)",
          paddingBottom: "clamp(5rem, 10vw, 9rem)",
        }}
      >
        {/* Full-bleed photo, low opacity for depth over the bordeaux */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="https://picsum.photos/seed/selahvie-hero/1920/1080"
            alt=""
            fill
            className="object-cover"
            priority
            style={{ opacity: 0.16 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(97,28,42,0.55) 0%, rgba(97,28,42,0.35) 40%, var(--bordeaux) 100%)" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <h1
              className="display-lg"
              style={{ color: "#FDF8F7", fontStyle: "italic" }}
            >
              Your story,<br />
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "normal",
                  fontWeight: 400,
                  color: "var(--gold)",
                }}
              >
                beautifully told.
              </span>
            </h1>
          </div>

          <p
            className="mt-8 max-w-lg text-base leading-relaxed font-light"
            style={{ color: "rgba(253,248,247,0.82)" }}
          >
            Curated wedding websites you personalize in minutes — invitations, RSVPs, and your
            whole love story, all in one calm place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/templates">
              <ButtonPrimary size="lg">Browse templates</ButtonPrimary>
            </Link>
            <Link href="/wedding/demo">
              <button
                className="btn-outline label-luxury inline-flex min-h-[48px] items-center px-7"
                style={{ borderRadius: "var(--radius-sm)", color: "#FDF8F7", borderColor: "rgba(253,248,247,0.4)" }}
              >
                View a live demo
              </button>
            </Link>
          </div>

          {/* Understated inline proof — not a hero-metric grid */}
          <p
            className="mt-14 text-sm font-light"
            style={{ color: "rgba(253,248,247,0.72)" }}
          >
            Loved by <span style={{ color: "var(--gold)" }}>2,400+ couples</span> ·{" "}
            {templates.length} designs · from {formatPrice(minPrice)}, once.
          </p>
        </div>
      </section>

      {/* ─── Featured Templates — asymmetric mosaic ─── */}
      <section style={{ paddingTop: "var(--spacing-section-xl)", paddingBottom: "var(--spacing-section-xl)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 mb-12 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="headline-md" style={{ maxWidth: "18ch" }}>
              A few of our favorite designs
            </h2>
            <Link href="/templates">
              <ButtonSecondary size="sm">View all</ButtonSecondary>
            </Link>
          </div>

          {/* Mosaic grid — not three equal columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {featured[0] && (
              <Link
                href={`/templates/${featured[0].id}`}
                className="card-hover group block lg:col-span-7"
                style={{
                  background: "var(--color-surface-container)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                  <Image
                    src={featured[0].previewImage}
                    alt={featured[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                </div>
                <div className="p-6">
                  <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
                    {featured[0].tags.join(" · ")}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="headline-sm">{featured[0].name}</p>
                    <p
                      className="font-serif text-xl font-light"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {formatPrice(featured[0].price)}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-4 lg:col-span-5">
              {featured.slice(1).map((t) => (
                <Link
                  key={t.id}
                  href={`/templates/${t.id}`}
                  className="card-hover group flex gap-4 items-stretch"
                  style={{
                    background: "var(--color-surface-container)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <div className="relative w-32 shrink-0 overflow-hidden">
                    <Image
                      src={t.previewImage}
                      alt={t.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="128px"
                    />
                  </div>
                  <div className="flex flex-col justify-center py-4 pr-5">
                    <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
                      {t.tags.slice(0, 2).join(" · ")}
                    </p>
                    <p className="headline-sm text-lg">{t.name}</p>
                    <p
                      className="mt-2 font-serif text-base font-light"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {formatPrice(t.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Process — horizontal numbered strip ─── */}
      <section
        style={{
          paddingTop: "var(--spacing-section-xl)",
          paddingBottom: "var(--spacing-section-xl)",
          background: "var(--color-surface-container-low)",
          borderTop: "1px solid var(--color-outline)",
          borderBottom: "1px solid var(--color-outline)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <p className="label-luxury mb-12" style={{ color: "var(--color-on-surface-muted)" }}>
            How it works
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                num: "I",
                title: "Choose a template",
                body: "Browse our curated gallery. Each design is crafted for elegance — find the one that feels like you.",
              },
              {
                num: "II",
                title: "Make it yours",
                body: "Add your photos, wedding details, color palette, and RSVP settings. No design skills needed.",
              },
              {
                num: "III",
                title: "Share & celebrate",
                body: "Send your link. Watch RSVPs arrive while you focus on the day ahead.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex flex-col gap-5">
                <p
                  className="font-serif"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "3rem",
                    fontWeight: 300,
                    lineHeight: 1,
                    color: "var(--color-outline)",
                    fontStyle: "italic",
                  }}
                >
                  {num}
                </p>
                <div style={{ width: "2rem", height: "1px", background: "var(--color-primary)" }} />
                <h3 className="title-md" style={{ color: "var(--color-on-surface)", fontWeight: 400, fontSize: "1.0625rem" }}>
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed font-light"
                  style={{ color: "var(--color-on-surface-variant)", maxWidth: 280 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        style={{ paddingTop: "var(--spacing-section-xl)", paddingBottom: "var(--spacing-section-xl)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            {/* Left: copy */}
            <div>
              <h2 className="headline-md">One price.<br />Everything included.</h2>
              <p
                className="mt-6 text-base font-light leading-relaxed"
                style={{ color: "var(--color-on-surface-variant)", maxWidth: 440 }}
              >
                Choose any template, personalize completely, and share forever.
                No recurring fees, no surprise charges at checkout.
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  "Unlimited RSVP responses",
                  "Custom invitation design",
                  "Countdown timer",
                  "Guest photo gallery",
                  "Mobile-optimized layouts",
                  "Custom domain support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 1,
                        background: "var(--color-primary)",
                        flexShrink: 0,
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: price card */}
            <div
              style={{
                background: "var(--color-surface-container)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-outline)",
                padding: "clamp(2rem, 4vw, 3.5rem)",
              }}
            >
              <p className="label-luxury mb-3" style={{ color: "var(--color-on-surface-muted)" }}>
                Templates from
              </p>
              <p
                className="font-serif"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--color-primary)",
                }}
              >
                {formatPrice(minPrice)}
              </p>
              <p
                className="label-luxury mt-2"
                style={{ color: "var(--color-on-surface-muted)" }}
              >
                one-time purchase
              </p>

              <div className="mt-10">
                <Link href="/templates">
                  <ButtonPrimary size="lg" fullWidth>
                    Find your template
                  </ButtonPrimary>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Full-bleed editorial image break ─── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(200px, 30vw, 420px)", borderTop: "1px solid var(--color-outline)", borderBottom: "1px solid var(--color-outline)" }}
      >
        <Image
          src="https://picsum.photos/seed/selahvie-ceremony/1920/600"
          alt="Wedding ceremony"
          fill
          className="object-cover"
          style={{ opacity: 0.5 }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(14,13,11,0.52)" }}
        >
          <p
            className="font-serif text-center px-6"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.75rem, 4vw, 3.5rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--color-surface)",
              letterSpacing: "0.02em",
              maxWidth: 700,
              lineHeight: 1.3,
            }}
          >
            "Every love story deserves a beautiful page."
          </p>
        </div>
      </div>
    </div>
  );
}
