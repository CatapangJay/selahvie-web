import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import VideoHero from "@/components/layout/VideoHero";
import ContactSection from "@/components/layout/ContactSection";
import Reveal from "@/components/ui/Reveal";
import FloralSprig from "@/components/ui/FloralSprig";
import ArchCard from "@/components/ui/ArchCard";
import { Palette, MailCheck, Globe } from "lucide-react";
import { templates } from "@/data/templates";
import { testimonials } from "@/data/testimonials";
import { weddingImages } from "@/lib/weddingImages";
import { formatPrice } from "@/lib/utils";

const SERVICES = [
  { icon: Palette, title: "Invitations", body: "Curated, customizable designs you make your own — photos, colors, and your story.", img: weddingImages.invitation },
  { icon: MailCheck, title: "RSVP & Guests", body: "A living guest list with meal counts and plus-ones, tracked and tallied for you.", img: weddingImages.rsvp },
  { icon: Globe, title: "Your Story", body: "Registry, travel, schedule, gallery, and well-wishes — all on one shareable link.", img: weddingImages.story },
];

/*
 * ─── Pricing "packages" — HIDDEN FOR NOW ───────────────────────────────────
 * We don't offer tiered packages yet; templates are sold individually. Kept
 * here (and the <section> below is commented out) so we can revisit later.
 *
 * const PACKAGES = [
 *   { tier: "Silver", label: "Essential", price: 3900, features: ["A curated template", "Full personalization", "Unlimited RSVPs", "Mobile-optimized"] },
 *   { tier: "Gold", label: "Most loved", price: 4900, features: ["Everything in Silver", "Guest photo gallery", "Countdown & schedule", "Registry & travel"], featured: true },
 *   { tier: "Platinum", label: "Premium", price: 7900, features: ["Everything in Gold", "Priority support", "Custom domain", "Ambient music"] },
 * ];
 */

export default function HomePage() {
  const featured = templates.filter((t) => t.isFeatured).slice(0, 4);
  const minPrice = Math.min(...templates.map((t) => t.price));
  const featuredCouple = testimonials[0];

  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* ─── Hero — cinematic video, reference-style curved transition ─── */}
      <VideoHero />

      {/* ─── About / passionate intro ─── */}
      <section style={{ paddingTop: "clamp(3rem, 6vw, 5rem)", paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="flex flex-col items-center text-center">
            <FloralSprig size={44} color="var(--color-primary)" />
            <h2
              className="mt-8 max-w-3xl"
              style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.6vw, 2.6rem)", fontWeight: 400, lineHeight: 1.32, letterSpacing: "0.02em", color: "var(--color-on-surface)", textWrap: "balance" }}
            >
              We design <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>beautiful</em> wedding
              website templates, and hand you the tools to make each one{" "}
              <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>unmistakably yours</em>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Your wedding day is a chapter in your love story — and your website is where you invite everyone into it.
              Pick a design, add your photos, colors, and details, and collect RSVPs in one place. No design skills, no
              code.
            </p>
          </Reveal>

          {/* Overlapping photo collage + signature */}
          <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-12">
            <Reveal from="left" className="md:col-span-5 md:mt-24">
              <div className="relative overflow-hidden shadow-lift" style={{ aspectRatio: "3/4", borderRadius: "var(--radius-lg)" }}>
                <Image src={weddingImages.aboutPortrait} alt="A couple at their ceremony" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
              </div>
              <p className="mt-6 font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontStyle: "italic", color: "var(--color-on-surface)" }}>
                For your <span style={{ color: "var(--color-primary)" }}>day</span>
              </p>
            </Reveal>
            <Reveal from="right" index={1} className="md:col-span-7">
              <div className="relative overflow-hidden shadow-lift" style={{ aspectRatio: "16/12", borderRadius: "var(--radius-lg)" }}>
                <Image src={weddingImages.aboutWide} alt="Newlyweds beneath a floral arch" fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Our Services — arched cards ─── */}
      <section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)", paddingBottom: "clamp(4rem, 8vw, 7rem)", background: "var(--color-surface-container-low)", borderTop: "1px solid var(--color-outline)", borderBottom: "1px solid var(--color-outline)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14 flex flex-col items-center text-center">
            <FloralSprig size={38} color="var(--color-primary)" />
            <h2 className="mt-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.9rem, 4vw, 3rem)", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-on-surface)" }}>
              In Every Template
            </h2>
            <p className="mt-4 max-w-md text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              Every website you buy comes with all three, ready to personalize.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} index={i}>
                <ArchCard className="group h-full" style={{ border: "1px solid var(--color-outline)", background: "var(--color-surface-container-lowest)" }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                    <Image src={s.img} alt={s.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(47,20,30,0.72), transparent 55%)" }} aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center">
                      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(253,248,247,0.16)", backdropFilter: "blur(4px)" }}>
                        <s.icon size={18} style={{ color: "#FDF8F7" }} />
                      </span>
                      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDF8F7" }}>{s.title}</p>
                    </div>
                  </div>
                  <p className="px-6 py-6 text-center text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{s.body}</p>
                </ArchCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Latest Weddings — gallery collage ─── */}
      <section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)", paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <Reveal from="left" className="lg:col-span-5">
              <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Gallery</p>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.9rem, 4vw, 3rem)", fontWeight: 400, letterSpacing: "0.02em", color: "var(--color-on-surface)" }}>
                Latest weddings
              </h2>
              <p className="mt-5 max-w-sm text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                A glimpse of the designs couples chose and made their own. Each one started as a template — and became
                unmistakably theirs.
              </p>
              <div className="mt-8">
                <Link href="/templates"><ButtonSecondary size="sm">View all {templates.length} designs</ButtonSecondary></Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-4 lg:col-span-7">
              {featured.map((t, i) => (
                <Reveal key={t.id} index={i} className={i % 2 === 1 ? "mt-8" : ""}>
                  <Link
                    href={`/templates/${t.id}`}
                    className="group relative block overflow-hidden shadow-ambient"
                    style={{ aspectRatio: "4/5", borderRadius: "var(--radius-lg)" }}
                  >
                    <Image src={t.previewImage} alt={`${t.name} preview`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 45vw, 26vw" />
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(to top, rgba(47,20,30,0.78), transparent 60%)" }} aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <p className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FDF8F7" }}>{t.name}</p>
                      <p className="label-luxury mt-0.5" style={{ color: "rgba(253,248,247,0.75)" }}>{formatPrice(t.price)}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Packages — HIDDEN: we don't offer tiered packages yet.
           Kept intact to revisit later; the PACKAGES data is commented out above.
      <section id="pricing" style={{ paddingTop: "clamp(4rem, 8vw, 7rem)", paddingBottom: "clamp(4rem, 8vw, 7rem)", background: "var(--color-surface-container-low)", borderTop: "1px solid var(--color-outline)", borderBottom: "1px solid var(--color-outline)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14 flex flex-col items-center text-center">
            <FloralSprig size={38} color="var(--color-primary)" />
            <h2 className="mt-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.9rem, 4vw, 3rem)", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-on-surface)" }}>
              Our Packages
            </h2>
            <p className="mt-4 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
              One-time pricing. No subscriptions, yours forever.
            </p>
          </Reveal>

          <div className="mx-auto grid max-w-5xl grid-cols-1 items-end gap-6 md:grid-cols-3">
            {PACKAGES.map((p, i) => {
              const featured = p.featured;
              return (
                <Reveal key={p.tier} index={i}>
                  <ArchCard
                    className="h-full text-center"
                    style={{
                      background: featured ? "var(--bordeaux)" : "var(--color-surface-container-lowest)",
                      border: `1px solid ${featured ? "transparent" : "var(--color-outline)"}`,
                      paddingTop: featured ? "clamp(3rem, 5vw, 4rem)" : "clamp(2.5rem, 4vw, 3.25rem)",
                    }}
                  >
                    <div className="px-7 pb-8">
                      <p className="label-luxury" style={{ color: featured ? "var(--gold)" : "var(--color-primary)" }}>{p.label}</p>
                      <p className="mt-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", letterSpacing: "0.12em", textTransform: "uppercase", color: featured ? "#FDF8F7" : "var(--color-on-surface)" }}>
                        {p.tier}
                      </p>
                      <div className="my-6 h-px" style={{ background: featured ? "rgba(253,248,247,0.2)" : "var(--color-outline)" }} />
                      <ul className="flex flex-col gap-3 text-left">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm font-light" style={{ color: featured ? "rgba(253,248,247,0.85)" : "var(--color-on-surface-variant)" }}>
                            <Check size={14} className="mt-0.5 shrink-0" style={{ color: featured ? "var(--gold)" : "var(--color-primary)" }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-8 font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, lineHeight: 1, color: featured ? "var(--gold)" : "var(--color-primary)" }}>
                        {formatPrice(p.price)}
                      </p>
                      <div className="mt-6">
                        <Link href="/templates">
                          {featured ? (
                            <button className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 text-sm transition-all hover:scale-[1.03]" style={{ background: "#FDF8F7", color: "var(--bordeaux)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                              Choose {p.tier}
                            </button>
                          ) : (
                            <ButtonPrimary size="lg" fullWidth>Choose {p.tier}</ButtonPrimary>
                          )}
                        </Link>
                      </div>
                    </div>
                  </ArchCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      */}

      {/* ─── Testimonial — split with photo ─── */}
      <section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)", paddingBottom: "clamp(4rem, 8vw, 7rem)" }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal from="left">
            <FloralSprig size={40} color="var(--color-primary)" />
            <p className="mt-5 label-luxury" style={{ color: "var(--color-primary)" }}>{featuredCouple.names} · {featuredCouple.detail}</p>
            <p className="mt-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontStyle: "italic", lineHeight: 1.35, color: "var(--color-on-surface)", textWrap: "balance" }}>
              &ldquo;{featuredCouple.quote}&rdquo;
            </p>
          </Reveal>
          <Reveal from="right" index={1}>
            <div className="relative overflow-hidden shadow-lift" style={{ aspectRatio: "4/5", borderRadius: "var(--radius-lg)" }}>
              <Image src={weddingImages.testimonial} alt={`${featuredCouple.names} on their wedding day`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Newsletter + closing CTA — bordeaux band ─── */}
      <section style={{ background: "var(--bordeaux)", paddingTop: "clamp(4rem, 8vw, 6.5rem)", paddingBottom: "clamp(4rem, 8vw, 6.5rem)" }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <FloralSprig size={40} color="var(--gold)" className="mx-auto" />
            <h2 className="mt-6" style={{ fontFamily: "'Instrument Serif', 'Fraunces', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontStyle: "italic", lineHeight: 1.15, color: "#FDF8F7", textWrap: "balance" }}>
              Find the template that tells your story.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed" style={{ color: "rgba(253,248,247,0.8)" }}>
              Browse the collection and make one your own — beautifully personalized, from {formatPrice(minPrice)}, once.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                href="/templates"
                className="inline-flex min-h-[52px] items-center rounded-full px-11 text-sm transition-all hover:scale-[1.03]"
                style={{ background: "#FDF8F7", color: "var(--bordeaux)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}
              >
                Get started
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Contact — tinted band the footer's curved edge rises into ─── */}
      <ContactSection />
    </div>
  );
}
