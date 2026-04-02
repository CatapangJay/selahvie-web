"use client";

import { motion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import BotanicalOrnament from "./BotanicalOrnament";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  textDeep: string;
}

export default function TemplateFooter({ config, green, floral, textDeep }: Props) {
  return (
    <footer
      className="py-20 text-center"
      style={{ background: textDeep }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <BotanicalOrnament
          green={green}
          floral={floral}
          width={50}
          height={90}
          animationDelay={0.3}
        />

        <p
          className="text-2xl font-light italic"
          style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}
        >
          {config.partner1Name} &amp; {config.partner2Name}
        </p>

        <p
          className="text-xs tracking-[0.22em] uppercase"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {config.weddingDate}
        </p>

        <div
          style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.15)", margin: "4px auto 0" }}
        />

        <p
          className="text-[10px] tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Created with Selah Vie
        </p>
      </motion.div>
    </footer>
  );
}
