import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selah Vie — Wedding Websites & Invitations",
  description:
    "Beautiful, customizable wedding websites with built-in RSVP management and digital invitations.",
  openGraph: {
    title: "Selah Vie — Wedding Websites & Invitations",
    description: "Beautiful, customizable wedding websites with built-in RSVP management and digital invitations.",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
