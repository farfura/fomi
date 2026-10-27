import localFont from "next/font/local";
import { AppProviders } from "@/components/providers/AppProviders";
import { getCatalog } from "@/server/services/catalog";
import { listGenerations } from "@/server/services/generations";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Fomi · Create",
    template: "%s · Fomi",
  },
  description: "Generate, refine and direct AI images and video in one workspace.",
  applicationName: "Fomi",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#131110" },
  ],
  colorScheme: "light dark",
};

// Runs before first paint so a saved (or system) dark theme never flashes light.
const themeScript = `(function(){try{var t=localStorage.getItem("fomi.theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }) {
  // The first page is rendered on the server; older pages stream in as the user scrolls.
  const initialPage = listGenerations({ limit: 10 });
  const catalog = getCatalog();

  return (
    <html lang="en" data-theme="light" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        <AppProviders initialPage={initialPage} catalog={catalog}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
