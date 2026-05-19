// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pagefind from "astro-pagefind";

export default defineConfig({
  site: "https://oyoke.dev",
  output: "static",
  adapter: vercel(),
  integrations: [
    react(),
    mdx(),
    sitemap(),
    pagefind(),
    icon({
      include: {
        // Brand logos with official colors
        logos: ["*"],
        // Monochrome brand logos (used as fallback for marks not in `logos`)
        "simple-icons": ["*"],
        // Colorful flat tiles (e.g. for the "Daily stack" row)
        "skill-icons": ["*"],
      },
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: ["300 600"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: ["400 500"],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
});
