import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import HeroRsvpCard from "@/components/landing/HeroRsvpCard";
import { APP_TAGLINE } from "@/lib/constants";
import { weddingImages } from "@/lib/weddingImages";
import { formatPrice } from "@/lib/utils";

const CREAM = "#FDF8F7";

/**
 * Landing hero. The brand name is the headline: "Be my guest." is what you
 * say when you open the door, so it's set large on a bordeaux background.
 * Opposite it, a wedding photo and a working RSVP card show what the product
 * does.
 */
export default function Hero({ minPrice }: { minPrice: number }) {
  const words = ["Be", "my", "guest."];

  return (
    <section
      className="on-dark relative overflow-hidden"
      style={{ background: "var(--bordeaux)", color: CREAM }}
    >
      {/* Soft light falling from the photo side, so the bordeaux has depth instead of reading as a flat fill. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 85% 30%, rgba(167,84,99,0.45), transparent 70%), radial-gradient(50% 50% at 0% 100%, rgba(30,6,12,0.45), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-28 sm:pt-32 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-36">
        {/* ─── Words ─── */}
        <div className="lg:col-span-7">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 12.5vw, 6rem)",
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
            }}
          >
            {words.map((w, i) => (
              <span key={w}>
                <span className="bmg-word">
                  <span
                    style={{
                      animationDelay: `${120 + i * 110}ms`,
                      color: i === words.length - 1 ? "var(--gold)" : undefined,
                    }}
                  >
                    {w}
                  </span>
                </span>
                {i < words.length - 1 && " "}
              </span>
            ))}
          </h1>

          <p
            className="bmg-fade-up mt-6"
            style={{
              animationDelay: "520ms",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
              lineHeight: 1.2,
              textWrap: "balance",
            }}
          >
            {APP_TAGLINE}
          </p>

          <p
            className="bmg-fade-up mt-6 max-w-[34rem] text-base leading-relaxed sm:text-[1.0625rem]"
            style={{ animationDelay: "640ms", color: "rgba(253,248,247,0.84)", textWrap: "pretty" }}
          >
            A wedding website you make your own, and a guest list that manages itself. Choose a design, add your
            story, send one link, then watch the replies come in.
          </p>

          <div className="bmg-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-5" style={{ animationDelay: "760ms" }}>
            <Link
              href="/templates"
              className="inline-flex min-h-[52px] items-center rounded-full px-8 text-[0.95rem] font-medium transition-[transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              style={{ background: CREAM, color: "var(--bordeaux)", boxShadow: "0 10px 30px -10px rgba(20,4,8,0.6)" }}
            >
              Browse the templates
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex min-h-11 items-center gap-2 text-[0.95rem]"
              style={{ color: CREAM }}
            >
              <span className="underline decoration-[rgba(253,248,247,0.4)] underline-offset-[6px] transition-colors duration-200 group-hover:decoration-[var(--gold)]">
                How it works
              </span>
              <ArrowDown size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>

          <p className="bmg-fade-up mt-8 text-sm" style={{ animationDelay: "860ms", color: "rgba(253,248,247,0.72)" }}>
            From {formatPrice(minPrice)}, paid once. No subscription.
          </p>
        </div>

        {/* ─── Photo + the RSVP card guests actually receive ─── */}
        <div className="relative lg:col-span-5">
          <div
            className="bmg-fade-up relative ml-auto w-[80%] overflow-hidden sm:w-[62%] lg:w-[88%]"
            style={{ animationDelay: "300ms", aspectRatio: "4 / 5", borderRadius: "999px 999px 10px 10px" }}
          >
            <Image
              src={weddingImages.guestsPetals}
              alt="Newlyweds kiss as their guests throw white petals over them on the lawn"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 62vw, 36vw"
            />
            <div aria-hidden className="absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px rgba(253,248,247,0.18)" }} />
          </div>

          <div className="relative -mt-28 w-[90%] sm:-mt-48 sm:w-auto lg:absolute lg:-bottom-6 lg:-left-6 lg:mt-0">
            <HeroRsvpCard />
          </div>
        </div>
      </div>
    </section>
  );
}
