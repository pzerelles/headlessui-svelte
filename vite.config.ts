import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"
import { svelteTesting } from "@testing-library/svelte/vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [sveltekit(), svelteTesting(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    setupFiles: ["./vitest-setup.js"],
  },
})
