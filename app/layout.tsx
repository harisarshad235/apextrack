import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kynov | Agile Velocity & Sprint Tracking",
  description:
    "Next-generation Agile Velocity & Sprint Tracking engine for modern high-output teams. Kanban boards, sprint backlogs, velocity sparklines, and RBAC team collaboration.",
  openGraph: {
    title: "Kynov | Agile Velocity & Sprint Tracking",
    description:
      "Next-generation Agile Velocity & Sprint Tracking engine for modern high-output teams. Kanban boards, sprint backlogs, velocity sparklines, and RBAC team collaboration.",
    url: "https://kynov.io",
    siteName: "Kynov",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kynov | Agile Velocity & Sprint Tracking",
    description:
      "Next-generation Agile Velocity & Sprint Tracking engine for modern high-output teams.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `var __name = function(fn, name) { return fn; }; window.__name = __name; globalThis.__name = __name;`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
