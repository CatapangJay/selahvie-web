import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import GiltFrame from "./GiltFrame";
import CalaLily from "./CalaLily";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

export default function StorySection({ config, palette: p }: Props) {
  const paragraphs = (config.coupleStory ?? "")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;

  const portrait = config.galleryImageUrls?.find(Boolean) || config.heroImageUrl;

  return (
    <section
      id="story"
      aria-labelledby="jt-story-title"
      style={{ ...paperStyle(p.cream, p.creamDeep), padding: SECTION_PAD, position: "relative", overflow: "hidden", color: p.ink }}
    >
      <div className="mx-auto" style={{ maxWidth: "64rem" }}>
        <SectionHeading id="jt-story-title" eyebrow="How It Began" title="Our Story" palette={p} tone="light" />

        <div
          className={portrait ? "grid items-center md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" : ""}
          style={{ gap: "clamp(2rem, 6vw, 4.5rem)" }}
        >
          {portrait && (
            <Reveal from="left" className="mx-auto w-full" style={{ maxWidth: "min(78vw, 22rem)" }}>
              <div style={{ position: "relative" }}>
                <GiltFrame palette={p} shape="oval" ratio="4 / 5" style={{ transform: "rotate(-2deg)" }}>
                  <Image
                    src={portrait}
                    alt={`${config.partner1Name} and ${config.partner2Name}`}
                    fill
                    sizes="(max-width: 768px) 78vw, 352px"
                    className="object-cover"
                  />
                </GiltFrame>
                <CalaLily
                  className="pointer-events-none absolute"
                  style={{ width: "22%", right: "-6%", bottom: "-8%", transform: "rotate(14deg)", filter: "drop-shadow(0 6px 8px rgba(0,0,0,.3))" }}
                />
              </div>
            </Reveal>
          )}

          <div className={portrait ? "" : "mx-auto"} style={{ maxWidth: "38rem" }}>
            {paragraphs.map((text, i) => (
              <Reveal key={i} index={i}>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(1.2rem, 2.3vw, 1.4rem)",
                    lineHeight: 1.75,
                    marginTop: i === 0 ? 0 : "1.4rem",
                    textWrap: "pretty",
                  }}
                >
                  {i === 0 ? (
                    <>
                      <span
                        aria-hidden
                        style={{ float: "left", fontFamily: SCRIPT, fontSize: "4.6em", lineHeight: 0.8, paddingRight: "0.12em", paddingTop: "0.06em", color: p.raspberry }}
                      >
                        {text.charAt(0)}
                      </span>
                      <span className="sr-only">{text.charAt(0)}</span>
                      {text.slice(1)}
                    </>
                  ) : (
                    text
                  )}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
