"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { screensFor } from "@/lib/templateScreens";

interface Props {
  /** Template shown on the laptop (its intro, then its opened home). */
  laptopId: string;
  /** Template shown on the phone. */
  phoneId: string;
  laptopName: string;
  phoneName: string;
}

/**
 * The product itself: a real template on a laptop and another on a phone.
 * When the laptop first comes into view its invitation "opens" once, the intro
 * screen crossfading to the site behind it. Reduced motion and no script show
 * the opened site straight away.
 */
export default function DeviceShowcase({ laptopId, phoneId, laptopName, phoneName }: Props) {
  const laptop = screensFor(laptopId);
  const phone = screensFor(phoneId);
  const ref = useRef<HTMLDivElement>(null);
  // Without script the opened site shows (server render = open); the effect closes it, then opens on view.
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return; // already on screen: leave it open
    setOpen(false);
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timer = window.setTimeout(() => setOpen(true), 900);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  if (!laptop || !phone) return null;

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl pb-6 sm:pb-10">
      <div className="device-laptop mx-auto w-[94%] sm:w-[86%]">
        <div className={`device-screen screen-swap ${open ? "is-open" : ""}`}>
          <Image src={laptop.intro} alt="" fill className="object-cover object-top" sizes="(max-width: 768px) 90vw, 820px" />
          <Image
            src={laptop.home}
            alt={`The ${laptopName} template: the couple's wedding website on a laptop`}
            fill
            className="screen-after object-cover object-top"
            sizes="(max-width: 768px) 90vw, 820px"
          />
        </div>
      </div>
      <div className="device-phone absolute -bottom-2 right-0 w-[26%] max-w-[190px] sm:bottom-0 sm:right-[2%]">
        <div className="device-screen">
          <Image src={phone.phone} alt={`The ${phoneName} template on a phone`} fill className="object-cover object-top" sizes="190px" />
        </div>
      </div>
    </div>
  );
}
