import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS, couplePhotos } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

/** The story beside a tall arched photo of the two of them; the photo drops away on phones and when there's none. */
export default function StorySection({ config, palette: p, band }: Props) {
  const paragraphs = config.coupleStory?.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) ?? [];
  if (paragraphs.length === 0) return null;
  const t = tones(band, p);
  const [lead, ...rest] = paragraphs;
  const photos = couplePhotos(config);
  const photo = photos[1] ?? photos[0];

  return (
    <section aria-labelledby="ah-story-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div className={photo ? "mx-auto grid max-w-[66rem] items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20" : "mx-auto max-w-[620px]"}>
        {photo && (
          <div className="relative mx-auto hidden w-full max-w-[24rem] lg:block">
            <div
              role="img"
              aria-label={`${config.partner1Name} and ${config.partner2Name}`}
              style={{
                aspectRatio: "3 / 4",
                borderRadius: "999px 999px 1.25rem 1.25rem",
                backgroundColor: p.apricotSoft,
                backgroundImage: photo,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: `0 0 0 6px ${p.morning}, 0 0 0 7px color-mix(in srgb, ${p.apricot} 60%, transparent), 0 30px 60px -30px ${p.dusk}`,
              }}
            />
            {/* A small sun set into the arch's shoulder, echoing the hero. */}
            <span aria-hidden style={{ position: "absolute", top: "6%", right: "-6%", width: "22%", aspectRatio: "1", borderRadius: "50%", background: p.golden, boxShadow: `0 0 0 5px ${band.bg}` }} />
          </div>
        )}
        <div className={photo ? "text-center lg:text-left" : "text-center"}>
          <SectionTitle id="ah-story-title" eyebrow="How we got here" title="Our little story" band={band} palette={p} align={photo ? "start" : "center"} />
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.3rem, 5vw, 1.6rem)", lineHeight: 1.55, color: t.text, marginBottom: "1.5rem", maxWidth: "36ch" }} className={photo ? "mx-auto lg:ml-0" : "mx-auto"}>
            {lead}
          </p>
          {rest.map((text, i) => (
            <p key={i} style={{ fontFamily: SANS, fontWeight: 300, fontSize: "clamp(1rem, 4.2vw, 1.1rem)", lineHeight: 1.8, color: t.soft, marginBottom: "1.25rem", maxWidth: "60ch", textWrap: "pretty" }} className={photo ? "mx-auto lg:ml-0" : "mx-auto"}>
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
