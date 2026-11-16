"use client";

import { Suspense, use } from "react";
import SeatFinder from "@/components/seat-finder/SeatFinder";

/**
 * Day-of "Find your table": the page behind the printed QR codes at the venue
 * (`?from=<entrance id>` says which door the code hangs at).
 */
export default function SeatFinderPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  return (
    <Suspense fallback={null}>
      <SeatFinder site={slug} />
    </Suspense>
  );
}
