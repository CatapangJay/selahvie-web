import type { Metadata } from "next";
import { Suspense } from "react";
import InvitationView from "./InvitationView";

export const metadata: Metadata = {
  title: "Invitation",
  robots: { index: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

/** /wedding/[slug]/invitation: the printable, downloadable invitation (Premium). */
export default async function InvitationPage(props: Props) {
  const { slug } = await props.params;
  return (
    <Suspense fallback={null}>
      <InvitationView slug={slug} />
    </Suspense>
  );
}
