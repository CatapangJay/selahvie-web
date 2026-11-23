import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";


export const metadata: Metadata = {
  title: "Be My Guest — Invite beautifully. Host effortlessly.",
  description:
    "Wedding websites and invitations you make your own, with RSVPs and your guest list kept in one place.",
  openGraph: {
    title: "Be My Guest — Invite beautifully. Host effortlessly.",
    description: "Wedding websites and invitations you make your own, with RSVPs and your guest list kept in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=Gloock&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "var(--font-sans)" }}>
        <AuthProvider />
        {children}
      </body>
    </html>
  );
}
