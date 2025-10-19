import { resolve } from "node:path";
import { defineConfig } from "vite";

const packagesDir = resolve(__dirname, "..", "..", "packages", "@vib34d");

export default defineConfig({
  root: "./",
  resolve: {
    alias: [{ find: /^@vib34d\/(.*)$/, replacement: `${packagesDir}/$1/src` }]
  },
  server: {
    port: 5173
  }
});
