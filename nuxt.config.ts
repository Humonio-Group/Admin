// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/scripts",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@nuxt/image",
  ],
  ssr: false,
  devtools: { enabled: true },
  app: {
    baseURL: process.env.APP_BASE_URL || "/",
  },
  css: ["./tailwind.css"],
  colorMode: {
    classPrefix: "",
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },
  runtimeConfig: {
    public: {
      env: "",
      api: {
        1: "",
        2: "",
        key: "",
      },
      urls: {
        auth: "",
        product: "",
        gps: "",
      },
      platform: "",
      brand: {
        name: "",
      },
    },
  },
  srcDir: "app/",
  compatibilityDate: "2025-07-15",
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
  eslint: {
    checker: true,
    config: {
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
      },
    },
  },
  googleFonts: {
    families: {
      Inter: "100..900",
    },
  },
  i18n: {
    locales: [
      {
        code: "fr",
        iso: "fr-FR",
        name: "Français",
        file: "fr.json",
      },
    ],
    defaultLocale: "fr",
    strategy: "no_prefix",
  },
  shadcn: {
    prefix: "Ui",
    componentDir: "./app/components/ui",
  },
});
