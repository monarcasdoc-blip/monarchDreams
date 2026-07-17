import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

// `admin` is excluded alongside `api`: /admin is an internal, English-only tool
// with its own root layout outside app/[locale], so next-intl must not try to
// redirect it to /en/admin.
export const config = {
  matcher: ["/", "/(en|es)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
