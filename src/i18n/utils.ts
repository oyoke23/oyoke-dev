import { defaultLang, type Lang, type UIKey, ui } from "./ui";

const LOCALES = ["en", "es"] as const;

export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split("/");
  if ((LOCALES as readonly string[]).includes(maybeLang)) {
    return maybeLang as Lang;
  }
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    const dict = ui[lang] ?? ui[defaultLang];
    const raw =
      (dict as Record<string, string>)[key] ??
      (ui[defaultLang] as Record<string, string>)[key] ??
      key;
    if (!vars) return raw;
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), raw);
  };
}

export function localizedPath(lang: Lang, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) return normalized;
  if (normalized === "/") return `/${lang}/`;
  return `/${lang}${normalized}`;
}

export function stripLocale(pathname: string): string {
  for (const loc of LOCALES) {
    if (pathname === `/${loc}` || pathname === `/${loc}/`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(`/${loc}`.length);
  }
  return pathname;
}

export function getAlternates(url: URL): Array<{ lang: Lang; href: string }> {
  const path = stripLocale(url.pathname);
  return LOCALES.map((loc) => ({
    lang: loc as Lang,
    href: new URL(localizedPath(loc as Lang, path), url.origin).toString(),
  }));
}

export const LOCALE_LIST = LOCALES;
