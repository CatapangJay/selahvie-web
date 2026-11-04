"use client";

import type { CSSProperties, ReactNode } from "react";
import { hasModule } from "@/lib/tiers";
import { invitationPath } from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  className?: string;
  style?: CSSProperties;
  /** Link text. Default "Download the invitation". */
  children?: ReactNode;
}

/**
 * Link to the printable, downloadable invitation (Premium). Renders nothing on
 * other packages, so templates can place it unconditionally and style it in
 * their own design. Opens in a new tab so the guest keeps their place on the site.
 */
export default function InvitationDownloadLink({ config, className, style, children }: Props) {
  if (!hasModule(config, "invitationDownload")) return null;
  return (
    <a href={invitationPath(config)} target="_blank" rel="noopener" className={className} style={style}>
      {children ?? "Download the invitation"}
    </a>
  );
}
