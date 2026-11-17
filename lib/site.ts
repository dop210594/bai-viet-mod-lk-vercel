export const SITE = {
  title: "Mod của Claude Code: chúng là gì, và mod chúng tôi cài sẵn cho mọi agent",
  shortTitle: "Mod của Claude Code",
  description:
    "Mod là một plugin có JavaScript chạy bên trong Claude Code. Nó làm được gì, ba tệp của nó, cách nạp và kiểm thử một mod, và mod AgentsRoom cài sẵn trong mọi agent.",
  brand: "AgentsRoom",
  brandUrl: "https://agentsroom.dev",
  originalUrl: "https://agentsroom.dev/vi/blog/claude-code-mods-what-they-are-and-the-one-we-ship",
  published: "2026-11-09",
  publishedLabel: "9 tháng 11, 2026",
};

/**
 * Public URL of the site. Set NEXT_PUBLIC_SITE_URL in Vercel once the custom
 * domain is attached (e.g. https://mods.yourdomain.com). Falls back to the
 * Vercel production URL, then localhost.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
