import type { Metadata } from "next";
import StudioPreviewFrame from "@/components/customize/StudioPreviewFrame";

export const metadata: Metadata = {
  title: "Website preview",
  robots: { index: false, follow: false },
};

/** Rendered inside the customize studio's preview iframe. */
export default function StudioPreviewPage() {
  return <StudioPreviewFrame />;
}
