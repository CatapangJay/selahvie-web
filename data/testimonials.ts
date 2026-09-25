export interface Testimonial {
  id: string;
  quote: string;
  names: string;
  detail: string; // date / location
  avatarSeed: string; // picsum seed for the couple photo
}

/** "Love notes" — social proof for the landing page. */
export const testimonials: Testimonial[] = [
  {
    id: "t-anna",
    quote:
      "We had our website live in an afternoon. Our guests kept saying it was the most beautiful invite they'd ever opened — and RSVPs just took care of themselves.",
    names: "Anna & Miguel",
    detail: "Married in Tagaytay · Mar 2026",
    avatarSeed: "love-anna",
  },
  {
    id: "t-jules",
    quote:
      "I'm not a designer and I didn't need to be. I picked a template, dropped in our photos, and it looked like we hired someone. Worth every peso.",
    names: "Jules & Karen",
    detail: "Married in Cebu · Jan 2026",
    avatarSeed: "love-jules",
  },
  {
    id: "t-david",
    quote:
      "The RSVP tracking saved our sanity. Meal counts, plus-ones, everything in one place. My planner asked which app we used — it was just Selah Vie.",
    names: "David & Priya",
    detail: "Married in Manila · Feb 2026",
    avatarSeed: "love-david",
  },
];
