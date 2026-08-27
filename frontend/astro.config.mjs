// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Science Gothic",
      cssVariable: "--font-science-gothic",
    },
  ],

  integrations: [react(), mdx()],
  output: "server",

  adapter: node({
    mode: "standalone"
  })
});