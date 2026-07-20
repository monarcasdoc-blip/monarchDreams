import { defineRouting } from "next-intl/routing";

// Both languages are available on both domains (the EN/ES toggle keeps you on
// the same domain). What each domain changes is only the *default* language a
// bare visit resolves to:
//   - dreamsofamonarch.com   -> English by default (Spanish reachable at /es)
//   - suenosdeunamonarca.com -> Spanish by default (English reachable at /en)
//
// `localeDetection: false` makes the domain authoritative: the visitor's
// browser language (Accept-Language) and any prior cookie are ignored when
// resolving the default, so the English domain always opens in English and the
// Spanish domain always opens in Spanish. An explicit /en or /es prefix (what
// the language toggle navigates to) still wins over the domain default.
//
// www + apex are both listed so matching works whether Vercel serves the apex
// directly or the www host reaches the app. On localhost (no host match) this
// gracefully falls back to the global defaultLocale below.
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  domains: [
    {
      domain: "dreamsofamonarch.com",
      defaultLocale: "en",
      locales: ["en", "es"],
    },
    {
      domain: "www.dreamsofamonarch.com",
      defaultLocale: "en",
      locales: ["en", "es"],
    },
    {
      domain: "suenosdeunamonarca.com",
      defaultLocale: "es",
      locales: ["en", "es"],
    },
    {
      domain: "www.suenosdeunamonarca.com",
      defaultLocale: "es",
      locales: ["en", "es"],
    },
  ],
});
