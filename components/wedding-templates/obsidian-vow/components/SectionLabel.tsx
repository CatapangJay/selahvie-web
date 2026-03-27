"use client";

import { motion } from "framer-motion";
import Divider from "./Divider";

interface Props {
  eyebrow: string;
  title: string;
}

export default function SectionLabel({ eyebrow, title }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="text-center mb-14"
    >
      <p
        className="label-luxury mb-3"
        style={{ color: "#c9a84c", letterSpacing: "0.22em" }}
      >
        {eyebrow}
      </p>
      <h2
        className="headline-md"
        style={{
          fontFamily: "var(--font-serif)",
          color: "#f5f0e8",
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}
      >
        {title}
      </h2>
      <Divider />
    </motion.div>
  );
}
