"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface Props {
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const DEFAULT_FAQS = [
  {
    q: "Where Will I Stay After The Wedding?",
    a: "We have arranged special accommodation rates at nearby hotels for all our guests. Please reach out to us directly and we will be happy to help with your arrangements.",
  },
  {
    q: "Is There A Dress Code For The Events?",
    a: "We'd love our guests to dress in traditional or semi-formal attire that reflects the celebratory spirit of our occasions. Feel free to wear your best cultural or formal wear!",
  },
  {
    q: "How Do I Reach The Venue?",
    a: "The venue is accessible by road and we will be sharing detailed maps and directions for each event. Shuttle services will also be arranged from key pickup points.",
  },
  {
    q: "Who Should I Contact If I Need Assistance?",
    a: "Our wedding coordinator team will be happy to assist you. Contact details will be shared in the formal invitation and in the event booklet.",
  },
  {
    q: "What Kind Of Food Will Be Served?",
    a: "We will be serving a lavish multi-cuisine spread including vegetarian and non-vegetarian options. Please inform us of any dietary restrictions in advance.",
  },
  {
    q: "Will Alcohol Be Served At The Events?",
    a: "Some of our events will have a bar available, while others are dry events. Please check the specific event details for more information.",
  },
  {
    q: "Is Parking Available At The Venue?",
    a: "Yes, ample parking space is available at all venues. Valet parking will also be offered at select events.",
  },
  {
    q: "Can I Share Pictures On Social Media?",
    a: "Absolutely! We encourage you to share your memories using our wedding hashtag. Details will be included in your invitation.",
  },
];

function FaqItem({ q, a, accent, isOpen, onToggle }: {
  q: string; a: string; accent: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <motion.div
      variants={rise}
      className="border-b cursor-pointer"
      style={{ borderColor: "rgba(44,24,16,0.1)" }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between py-4 gap-4">
        <p
          className="text-sm flex-1"
          style={{
            fontFamily: "var(--font-sans)",
            color: isOpen ? accent : "#2c1810",
            fontWeight: isOpen ? 500 : 400,
          }}
        >
          {q}
        </p>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{ background: isOpen ? accent : "rgba(44,24,16,0.07)" }}
        >
          {isOpen
            ? <Minus size={13} style={{ color: "#ffffff" }} />
            : <Plus  size={13} style={{ color: "#2c1810" }} />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="text-sm pb-4 leading-relaxed"
              style={{ color: "rgba(44,24,16,0.6)", fontFamily: "var(--font-sans)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection({ accent }: Props) {
  const BG = "#faf8f4";
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 px-6" style={{ background: BG }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Heading */}
          <div className="text-center mb-14">
            <motion.p
              variants={rise}
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: accent, fontFamily: "var(--font-sans)" }}
            >
              Questions
            </motion.p>
            <motion.h2
              variants={rise}
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#2c1810",
                lineHeight: 1.2,
              }}
            >
              FAQ
            </motion.h2>
            <motion.div variants={rise} className="flex items-center justify-center gap-2 mt-3">
              <div className="h-0.5 w-8" style={{ background: accent }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: accent }} />
              <div className="h-0.5 w-8" style={{ background: accent }} />
            </motion.div>
          </div>

          {/* Accordion */}
          <motion.div variants={cont} className="flex flex-col">
            {DEFAULT_FAQS.map((item, i) => (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                accent={accent}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
