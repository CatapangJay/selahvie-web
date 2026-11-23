import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/landing/Hero";
import GuestListPreview from "@/components/landing/GuestListPreview";
import ContactSection from "@/components/layout/ContactSection";
import { BmgMark } from "@/components/brand/BmgMark";
import { templates } from "@/data/templates";
import { testimonials } from "@/data/testimonials";
import { weddingImages } from "@/lib/weddingImages";
import { formatPrice } from "@/lib/utils";

const INK = "var(--color-on-surface)";
const INK_VARIANT = "var(--color-on-surface-variant)";
const CREAM = "#FDF8F7";

const sectionY = { paddingTop: "clamp(5rem, 10vw, 8.5rem)", paddingBottom: "clamp(5rem, 10vw, 8.5rem)" };

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
  fontWeight: 400,
  lineHeight: 1.04,
  letterSpacing: "-0.015em",
  color: INK,
  textWrap: "balance",
};

const GUEST_FEATURES = [
  { title: "Groups and households", body: "Keep families, barkadas and office tables together in one group." },
  { title: "Meals and dietary notes", body: "Every reply carries its meal choice, so your caterer gets one clean count." },
  { title: "Plus-ones you decide", body: "Allow a plus-one site-wide, or, on Premium, give particular guests extra seats of their own." },
  { title: "Import, export, done", body: "Bring your list in from a spreadsheet, and take it back out whenever you need it." },
];

/*
 * ─── Pricing "packages" — HIDDEN FOR NOW ───────────────────────────────────
 * Templates are sold individually; the tiered "packages" section that used to
 * live here was removed in the Be My Guest redesign. Restore from git history
 * (pre-rebrand app/(main)/page.tsx) if packages return to the landing page.
 */

export default function HomePage() {
  // Skip any design whose preview is the hero photo, so no picture appears twice.
  const heroPhoto = weddingImages.guestsPetals.split("?")[0];
  const featured = templates.filter((t) => t.isFeatured && !t.previewImage.startsWith(heroPhoto)).slice(0, 5);
  const minPrice = Math.min(...templates.map((t) => t.price));
  const story = testimonials[0];

  const steps = [
    {
      title: "Choose a design",
      body: `Start from one of ${templates.length} designs, from garden-soft to black-and-white. Never a blank page.`,
    },
    {
      title: "Make it yours",
      body: "Your names, photos, colours and story, set into the design you chose. No design skills, no code.",
    },
    {
      title: "Send it, then watch the replies",
      body: "Share one link with everyone (or, on Premium, give each guest their own). RSVPs, meal choices and plus-ones land in your list as they arrive.",
    },
  ];

  return (
    <div style={{ background: "var(--color-surface)", fontFamily: "var(--font-brand)" }}>
      <Hero minPrice={minPrice} />

      {/* ─── How it works: a real sequence, so the numbers carry meaning ─── */}
      <section id="how-it-works" className="scroll-mt-20" style={sectionY}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <h2 style={h2Style}>
                From &ldquo;save the date&rdquo; to{" "}
                <span style={{ color: "var(--color-primary)" }}>&ldquo;see you there.&rdquo;</span>
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
                Setting up takes an afternoon, not a season. After that, your guest list stays in order on its own, all the way to the wedding day.
              </p>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="bmg-rise grid grid-cols-[3.5rem_1fr] gap-x-5 py-9 sm:grid-cols-[5rem_1fr] sm:gap-x-8"
                style={{ borderTop: "1px solid var(--color-outline)", ...(i === steps.length - 1 ? { borderBottom: "1px solid var(--color-outline)" } : {}) }}
              >
                <span
                  aria-hidden
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.75rem, 5vw, 3.75rem)", lineHeight: 0.9, color: "var(--color-primary)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.4vw, 1.9rem)", lineHeight: 1.15, color: INK }}>
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[36rem] text-base leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Templates: one large lead design, four companions ─── */}
      <section style={{ ...sectionY, paddingTop: 0 }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <h2 style={h2Style} className="max-w-xl">
              Pick the one that already feels like you.
            </h2>
            <Link
              href="/templates"
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-[0.95rem] font-medium"
              style={{ color: "var(--color-primary-dim)" }}
            >
              <span className="underline decoration-[var(--color-outline-variant)] underline-offset-[6px] transition-colors group-hover:decoration-[var(--color-primary)]">
                See all {templates.length} designs
              </span>
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 md:grid-rows-2">
            {featured.map((t, i) => {
              const lead = i === 0;
              return (
                <li key={t.id} className={`bmg-rise ${lead ? "col-span-2 md:row-span-2" : ""}`}>
                  <Link href={`/templates/${t.id}`} className="group flex h-full flex-col">
                    <div
                      className="relative flex-1 overflow-hidden"
                      style={{ aspectRatio: lead ? "4 / 4.4" : "4 / 5", borderRadius: "var(--radius-md)", background: "var(--color-surface-container)" }}
                    >
                      <Image
                        src={t.previewImage}
                        alt={`Preview of the ${t.name} template`}
                        fill
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                        sizes={lead ? "(max-width: 768px) 100vw, 560px" : "(max-width: 768px) 50vw, 270px"}
                      />
                    </div>
                    <div className={`mt-3 flex gap-x-3 gap-y-0.5 ${lead ? "items-baseline justify-between" : "flex-col"}`}>
                      <p
                        className="transition-colors duration-200 group-hover:text-[var(--color-primary)]"
                        style={{ fontFamily: "var(--font-display)", fontSize: lead ? "1.5rem" : "1.15rem", lineHeight: 1.2, color: INK }}
                      >
                        {t.name}
                      </p>
                      <p className="shrink-0 text-sm" style={{ color: INK_VARIANT }}>{formatPrice(t.price)}</p>
                    </div>
                    {lead && (
                      <p className="mt-1 text-sm" style={{ color: INK_VARIANT }}>{t.tags.join(" · ")}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── The guest side: real product UI over a set reception table ─── */}
      <section
        style={{ ...sectionY, background: "var(--color-surface-container-low)", borderTop: "1px solid var(--color-outline)", borderBottom: "1px solid var(--color-outline)" }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-12 lg:gap-16">
          <div className="lg:order-2 lg:col-span-5">
            <h2 style={h2Style}>The guest list that keeps count.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: INK_VARIANT, textWrap: "pretty" }}>
              Every reply lands in one place, already counted. No spreadsheet to chase, no group chat to scroll back
              through.
            </p>
            <dl className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {GUEST_FEATURES.map((f) => (
                <div key={f.title} className="py-5" style={{ borderTop: "1px solid var(--color-outline)" }}>
                  <dt className="text-[0.95rem] font-semibold" style={{ color: INK }}>{f.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed" style={{ color: INK_VARIANT }}>{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:order-1 lg:col-span-7">
            <div
              aria-hidden
              className="absolute -top-8 right-0 hidden w-[58%] overflow-hidden sm:block"
              style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius-lg)" }}
            >
              <Image src={weddingImages.rsvp} alt="" fill className="object-cover" sizes="400px" />
            </div>
            <div className="relative sm:mr-[18%] sm:mt-24">
              <GuestListPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── A couple's word ─── */}
      <section style={sectionY}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16">
          <figure className="lg:col-span-7">
            <blockquote
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.65rem, 3.2vw, 2.6rem)",
                lineHeight: 1.22,
                letterSpacing: "-0.01em",
                color: INK,
                textWrap: "pretty",
              }}
            >
              <span aria-hidden style={{ color: "var(--color-primary)" }}>&ldquo;</span>
              {story.quote}
              <span aria-hidden style={{ color: "var(--color-primary)" }}>&rdquo;</span>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-sm" style={{ color: INK_VARIANT }}>
              <span aria-hidden className="h-px w-10" style={{ background: "var(--color-primary)" }} />
              <span>
                <span className="font-semibold" style={{ color: INK }}>{story.names}</span> · {story.detail}
              </span>
            </figcaption>
          </figure>
          <div className="lg:col-span-5">
            <div className="relative ml-auto w-full max-w-sm overflow-hidden lg:max-w-none" style={{ aspectRatio: "4 / 5", borderRadius: "var(--radius-lg)" }}>
              <Image
                src={weddingImages.bouquet}
                alt="A bride holds her bouquet of peach roses, white blooms and baby’s breath"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 384px, 420px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Closing: the invitation, extended ─── */}
      <section className="on-dark relative overflow-hidden" style={{ background: "var(--bordeaux)", color: CREAM, ...sectionY }}>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <BmgMark size={64} color="var(--gold)" />
          <h2
            className="mt-8"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6.5vw, 4.75rem)", lineHeight: 1.02, letterSpacing: "-0.02em", textWrap: "balance" }}
          >
            Your guests are waiting to hear from you.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed" style={{ color: "rgba(253,248,247,0.84)" }}>
            Choose a design tonight, and send the link this week. From {formatPrice(minPrice)}, paid once.
          </p>
          <Link
            href="/templates"
            className="mt-10 inline-flex min-h-[52px] items-center rounded-full px-8 text-[0.95rem] font-medium transition-[transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
            style={{ background: CREAM, color: "var(--bordeaux)" }}
          >
            Find your template
          </Link>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
