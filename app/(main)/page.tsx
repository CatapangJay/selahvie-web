import Link from "next/link";
import Image from "next/image";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import VideoHero from "@/components/layout/VideoHero";
import Reveal from "@/components/ui/Reveal";
import ParallaxQuote from "@/components/ui/ParallaxQuote";
import { Heart, Sparkles, Send, ArrowRight } from "lucide-react";
import { templates } from "@/data/templates";
import { formatPrice } from "@/lib/utils";


export default function HomePage() {
  const featured = templates.filter((t) => t.isFeatured).slice(0, 3);
  const minPrice = Math.min(...templates.map((t) => t.price));

  return (
    <div>
      {/* ─── Hero — cinematic looping video ─── */}
      <VideoHero />

      {/* Quiet proof strip beneath the cinematic hero */}
      <div style={{ background: "var(--color-surface-container-low)", borderBottom: "1px solid var(--color-outline)" }}>
        <p
          className="mx-auto max-w-7xl px-6 py-5 text-center text-sm font-light"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Loved by <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>2,400+ couples</span>
          {" · "}{templates.length} designs{" · "}from {formatPrice(minPrice)}, once.
        </p>
      </div>

      {/* ─── The Collection — immersive offset portrait gallery ─── */}
      <section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)", paddingBottom: "clamp(4rem, 9vw, 8rem)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>The collection</p>
              <h2 className="headline-md" style={{ maxWidth: "20ch" }}>
                Designs worth saying yes to
              </h2>
            </div>
            <Link href="/templates">
              <ButtonSecondary size="sm">View all {templates.length}</ButtonSecondary>
            </Link>
          </Reveal>

          {/* Three immersive portrait cards, vertically offset for rhythm */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t, i) => (
              <Reveal
                key={t.id}
                index={i}
                className="lg:[&:nth-child(2)]:mt-16"
              >
                <Link
                  href={`/templates/${t.id}`}
                  className="group relative block overflow-hidden"
                  style={{ aspectRatio: "3/4", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
                >
                  <Image
                    src={t.previewImage}
                    alt={`${t.name} wedding website preview`}
                    fill
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={i === 0}
                  />

                  {/* Always-on legibility gradient + deepening on hover */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ background: "linear-gradient(to top, rgba(47,20,30,0.82) 0%, rgba(47,20,30,0.18) 42%, transparent 68%)" }}
                    aria-hidden
                  />

                  {/* Rank numeral — subtle editorial accent */}
                  <span
                    className="absolute left-5 top-4 font-serif"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "rgba(253,248,247,0.55)", lineHeight: 1 }}
                    aria-hidden
                  >
                    0{i + 1}
                  </span>

                  {/* Overlaid content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="label-luxury mb-2" style={{ color: "rgba(253,248,247,0.72)" }}>
                      {t.tags.join(" · ")}
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", lineHeight: 1.1, color: "#FDF8F7" }}>
                        {t.name}
                      </p>
                      <p className="font-serif shrink-0" style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "var(--gold)" }}>
                        {formatPrice(t.price)}
                      </p>
                    </div>
                    {/* Reveal-on-hover CTA row */}
                    <div className="mt-0 grid grid-rows-[0fr] transition-all duration-500 group-hover:mt-4 group-hover:grid-rows-[1fr]">
                      <span className="overflow-hidden">
                        <span
                          className="inline-flex items-center gap-1.5 label-luxury"
                          style={{ color: "#FDF8F7", borderBottom: "1px solid rgba(253,248,247,0.5)", paddingBottom: "0.25rem" }}
                        >
                          View this design
                          <ArrowRight size={12} />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works — image-anchored, warm ─── */}
      <section
        style={{
          paddingTop: "clamp(4.5rem, 9vw, 8rem)",
          paddingBottom: "clamp(4.5rem, 9vw, 8rem)",
          background: "var(--color-surface-container-low)",
          borderTop: "1px solid var(--color-outline)",
          borderBottom: "1px solid var(--color-outline)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>How it works</p>
            <h2 className="headline-md">From "yes" to shared in three easy steps</h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Heart, step: "01", title: "Choose a template", body: "Browse our curated gallery. Each design is crafted for elegance — find the one that feels like you." },
              { icon: Sparkles, step: "02", title: "Make it yours", body: "Add your photos, story, colors, and RSVP settings. No design skills needed — it just works." },
              { icon: Send, step: "03", title: "Share & celebrate", body: "Send your link and watch RSVPs arrive while you focus on the day ahead." },
            ].map(({ icon: Icon, step, title, body }, i) => (
              <Reveal
                key={step}
                index={i}
                className="card-hover flex flex-col gap-4 p-8"
                style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-primary-container-strong)" }}>
                    <Icon size={20} style={{ color: "var(--color-primary)" }} />
                  </span>
                  <span className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-outline)", lineHeight: 1 }}>
                    {step}
                  </span>
                </div>
                <h3 className="headline-sm" style={{ fontSize: "1.25rem" }}>{title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Editorial quote with scroll parallax — the emotional beat ─── */}
      <ParallaxQuote />

      {/* ─── Pricing ─── */}
      <section id="pricing" style={{ paddingTop: "clamp(4.5rem, 9vw, 8rem)", paddingBottom: "clamp(5rem, 10vw, 9rem)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal from="left">
              <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Pricing</p>
              <h2 className="headline-md">One price.<br />Everything included.</h2>
              <p className="mt-6 max-w-md text-base font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                Choose any template, personalize completely, and share forever. No recurring
                fees, no surprise charges at checkout.
              </p>

              <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  "Unlimited RSVP responses",
                  "Custom invitation design",
                  "Countdown timer",
                  "Guest photo gallery",
                  "Mobile-optimized layouts",
                  "Custom domain support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                    <Heart size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} fill="var(--color-primary)" />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal
              from="right"
              index={1}
              className="relative overflow-hidden text-center"
              style={{ background: "var(--bordeaux)", borderRadius: "var(--radius-xl)", padding: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              <p className="label-luxury mb-3" style={{ color: "rgba(253,248,247,0.7)" }}>Templates from</p>
              <p
                className="font-serif"
                style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(4rem, 8vw, 6rem)", fontWeight: 400, lineHeight: 1, color: "var(--gold)" }}
              >
                {formatPrice(minPrice)}
              </p>
              <p className="label-luxury mt-3" style={{ color: "rgba(253,248,247,0.7)" }}>one-time purchase · yours forever</p>
              <div className="mt-9">
                <Link href="/templates">
                  <button
                    className="liquid-glass inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-8 py-3.5 text-base"
                    style={{ color: "#FDF8F7" }}
                  >
                    Find your template
                  </button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
