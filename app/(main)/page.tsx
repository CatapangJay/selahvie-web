import Link from "next/link";
import Image from "next/image";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { templates } from "@/data/templates";
import { formatPrice } from "@/lib/utils";
import { Star, Heart, Mail, Users } from "lucide-react";

export default function HomePage() {
  const featured = templates.filter((t) => t.isFeatured).slice(0, 3);

  return (
    <div>
      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: "var(--spacing-section-xl)", paddingBottom: "var(--spacing-section-xl)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left: Copy */}
            <div>
              <p className="label-luxury mb-6" style={{ color: "var(--color-tertiary)" }}>
                Wedding Websites & Invitations
              </p>
              <h1 className="display-lg">
                Your Dream<br />
                <span style={{ color: "var(--color-primary)" }}>Wedding,</span><br />
                Online.
              </h1>
              <p
                className="mt-6 max-w-md text-lg leading-relaxed"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Choose from our curated collection of beautiful wedding website templates, personalize every detail, and share your love story with the world.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/templates">
                  <ButtonPrimary size="lg">Browse Templates</ButtonPrimary>
                </Link>
                <Link href="/wedding/demo">
                  <ButtonSecondary size="lg">See a Demo</ButtonSecondary>
                </Link>
              </div>
              {/* Social proof */}
              <div className="mt-12 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-white overflow-hidden"
                      style={{ background: `hsl(${i * 50 + 10}, 40%, 75%)` }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} fill="var(--color-tertiary)" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                    Loved by 2,000+ couples
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="relative hidden lg:block">
              <div
                className="relative h-[600px] w-full overflow-hidden shadow-ambient"
                style={{ borderRadius: "var(--radius-xl)", background: "var(--color-surface-container-low)" }}
              >
                <Image
                  src="https://picsum.photos/seed/wedding-hero/900/1200"
                  alt="Wedding couple"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating card */}
              <div
                className="glass absolute -bottom-6 -left-6 rounded-2xl px-6 py-4 shadow-ambient"
              >
                <p className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>Templates from</p>
                <p className="title-md mt-1" style={{ color: "var(--color-tertiary)" }}>
                  {formatPrice(Math.min(...templates.map((t) => t.price)))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        style={{ padding: "var(--spacing-section-xl) 0", background: "var(--color-surface-container-low)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="label-luxury mb-3" style={{ color: "var(--color-tertiary)" }}>The Process</p>
            <h2 className="headline-md">From template to "I do" in minutes</h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              { icon: Heart, num: "01", title: "Choose a Template", body: "Browse our curated gallery and find the style that speaks to your love story." },
              { icon: Mail, num: "02", title: "Personalize Your Site", body: "Add your photos, wedding details, colors, and RSVP settings with ease." },
              { icon: Users, num: "03", title: "Share & Celebrate", body: "Share your unique link. Watch RSVPs roll in while you focus on each other." },
            ].map(({ icon: Icon, num, title, body }) => (
              <div key={num} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className="label-luxury text-2xl"
                    style={{ color: "var(--color-primary-container)" }}
                  >
                    {num}
                  </span>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "var(--color-surface-container)" }}
                  >
                    <Icon size={20} style={{ color: "var(--color-primary)" }} />
                  </div>
                </div>
                <h3 className="title-md">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Templates ─── */}
      <section style={{ padding: "var(--spacing-section-xl) 0" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-2 mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-luxury mb-2" style={{ color: "var(--color-tertiary)" }}>Handpicked for You</p>
              <h2 className="headline-md">Featured Templates</h2>
            </div>
            <Link href="/templates">
              <ButtonSecondary size="sm">View All Templates</ButtonSecondary>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featured.map((t, i) => (
              <Link
                key={t.id}
                href={`/templates/${t.id}`}
                className="group block overflow-hidden rounded-2xl shadow-ambient transition-transform duration-300 hover:-translate-y-1"
                style={{ background: "var(--color-surface-container-low)" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <Image
                    src={t.previewImage}
                    alt={t.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p
                    className="headline-sm text-lg"
                    style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
                  >
                    {t.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                      {t.tags.join(" · ")}
                    </p>
                    <p className="font-semibold" style={{ color: "var(--color-tertiary)" }}>
                      {formatPrice(t.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        style={{ padding: "var(--spacing-section-xl) 0", background: "var(--color-surface-container-low)" }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="label-luxury mb-3" style={{ color: "var(--color-tertiary)" }}>Simple Pricing</p>
          <h2 className="headline-md">One price, everything included</h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            Choose any template, personalize completely, share forever. No hidden fees, no subscriptions.
          </p>
          <div
            className="mt-12 rounded-3xl p-10 shadow-ambient"
            style={{ background: "var(--color-surface)" }}
          >
            <p className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>Templates start at</p>
            <p className="display-lg mt-2" style={{ color: "var(--color-primary)" }}>
              {formatPrice(Math.min(...templates.map((t) => t.price)))}
            </p>
            <ul className="mt-8 space-y-3 text-left max-w-xs mx-auto text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              {["Unlimited RSVP responses", "Custom invitation design", "Countdown timer", "Guest gallery", "Mobile-optimized", "Custom domain support"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span style={{ color: "var(--color-secondary)" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link href="/templates">
                <ButtonPrimary size="lg">Find Your Template</ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
