"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

export default function WishesSection({ config, green, floral, bg, textDeep }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: `${textDeep}80`,
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${green}40`,
    outline: "none",
    fontSize: "15px",
    paddingBottom: "10px",
    color: textDeep,
    transition: "border-color 0.3s",
  };

  return (
    <section className="py-32" style={{ background: `${green}06` }}>
      <div className="max-w-lg mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="mb-16 text-center"
        >
          <p className="text-xs tracking-[0.22em] uppercase mb-5" style={{ color: floral }}>
            Leave a note
          </p>
          <h2
            className="text-3xl lg:text-4xl font-light"
            style={{ color: textDeep, letterSpacing: "-0.02em" }}
          >
            Send Your Wishes
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <div>
                <label style={labelStyle}>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderBottomColor = green)}
                  onBlur={(e) => (e.target.style.borderBottomColor = `${green}40`)}
                />
              </div>

              <div>
                <label style={labelStyle}>Your message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something heartfelt..."
                  rows={4}
                  required
                  style={{ ...inputStyle, resize: "none", lineHeight: "1.7" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = green)}
                  onBlur={(e) => (e.target.style.borderBottomColor = `${green}40`)}
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, backgroundColor: green }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  background: "transparent",
                  border: `1px solid ${green}`,
                  color: textDeep,
                  padding: "14px 36px",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "2px",
                  width: "100%",
                }}
              >
                Send Wishes
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              className="text-center py-16"
            >
              <p
                className="text-2xl font-light mb-4"
                style={{ color: textDeep, letterSpacing: "-0.01em" }}
              >
                Thank you, {name}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: `${textDeep}80` }}>
                Your wishes mean the world to us.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
