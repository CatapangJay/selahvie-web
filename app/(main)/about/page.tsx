import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";
import { templates } from "@/data/templates";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "About Us — Selah Vie",
  description:
    "The story behind Selah Vie — beautifully crafted wedding websites, made simple for the modern couple.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Made with care",
    body: "Every template is designed by hand, for the one day that matters most. No filler, no clutter — just craft.",
  },
  {
    icon: Sparkles,
    title: "Effortless to you",
    body: "Beautiful shouldn't mean complicated. Personalize everything in minutes, with no code and no design degree.",
  },
  {
    icon: ShieldCheck,
    title: "Yours, forever",
    body: "One price, no subscriptions, no surprises. Your website and your memories stay yours for good.",
  },
];

export default function AboutPage() {
  const minPrice = Math.min(...templates.map((t) => t.price));

  return (
    <div>
      {/* ─── Hero band — bordeaux ─── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--bordeaux)", paddingTop: "clamp(7rem, 14vw, 11rem)", paddingBottom: "clamp(4rem, 9vw, 7rem)" }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="label-luxury mb-4" style={{ color: "rgba(253,248,247,0.6)" }}>Our story</p>
            <h1
              className="font-serif"
              style={{
                fontFamily: "'Instrument Serif', 'Fraunces', serif",
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#FDF8F7",
                textWrap: "balance",
              }}
            >
              We believe every love story deserves a{" "}
              <em className="not-italic" style={{ color: "var(--gold)" }}>beautiful beginning.</em>
            </h1>
          </Reveal>
          <Reveal index={1}>
            <p className="mx-auto mt-7 max-w-xl text-base font-light leading-relaxed sm:text-lg" style={{ color: "rgba(253,248,247,0.82)" }}>
              Selah Vie was born from a simple idea — that a couple should be able to share their day
              in a way that feels as personal and considered as the celebration itself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Story — text + image ─── */}
      <section style={{ paddingTop: "clamp(4.5rem, 9vw, 8rem)", paddingBottom: "clamp(4.5rem, 9vw, 8rem)" }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
          <Reveal from="left">
            <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Why we started</p>
            <h2 className="headline-md">Wedding planning is overwhelming. This part shouldn&apos;t be.</h2>
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              <p>
                When we set out to build our own wedding site, we found two options: generic builders
                that looked like everyone else&apos;s, or bespoke designers who cost more than the cake.
                Neither felt right.
              </p>
              <p>
                So we made the thing we wished existed — a curated collection of genuinely beautiful
                templates you can make your own in an afternoon, with RSVPs and guest management built in.
                The kind of website you&apos;d be proud to send, without the price of a designer or the
                look of a template.
              </p>
            </div>
          </Reveal>
          <Reveal
            from="right"
            index={1}
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/5", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-outline)" }}
          >
            <Image
              src="https://picsum.photos/seed/selahvie-about-story/900/1100"
              alt="A couple reviewing their wedding website together"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </Reveal>
        </div>
      </section>

      {/* ─── Values ─── */}
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
            <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>What we stand for</p>
            <h2 className="headline-md">Craft, care, and no compromise</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                index={i}
                className="flex flex-col gap-4 p-8"
                style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-primary-container-strong)" }}>
                  <Icon size={20} style={{ color: "var(--color-primary)" }} />
                </span>
                <h3 className="headline-sm" style={{ fontSize: "1.25rem" }}>{title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Closing CTA ─── */}
      <section style={{ paddingTop: "clamp(4.5rem, 9vw, 8rem)", paddingBottom: "clamp(5rem, 10vw, 9rem)" }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <h2 className="headline-md">Ready to begin your story?</h2>
            <p className="mx-auto mt-5 max-w-md text-base font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              Browse the collection and find the design that feels like you — from {formatPrice(minPrice)}, once.
            </p>
            <div className="mt-9 flex justify-center">
              <Link href="/templates">
                <ButtonPrimary size="lg">Browse templates</ButtonPrimary>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
