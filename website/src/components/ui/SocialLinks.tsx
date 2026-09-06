import { Globe } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";
import type { SocialLink } from "@/lib/data/settings";
import styles from "./social-links.module.css";

const names: Record<string, string> = {
  whatsapp: "WhatsApp", instagram: "Instagram", youtube: "YouTube", linkedin: "LinkedIn",
  facebook: "Facebook", x: "X", github: "GitHub", telegram: "Telegram", website: "Website",
};

export function socialPlatform(link: SocialLink): string {
  const explicit = link.platform?.toLowerCase().trim();
  if (explicit && names[explicit]) return explicit;
  try {
    const host = new URL(link.url).hostname.replace(/^www\./, "");
    const hosts: Record<string, string> = { "wa.me": "whatsapp", "whatsapp.com": "whatsapp", "instagram.com": "instagram", "youtube.com": "youtube", "youtu.be": "youtube", "linkedin.com": "linkedin", "facebook.com": "facebook", "fb.com": "facebook", "x.com": "x", "twitter.com": "x", "github.com": "github", "t.me": "telegram", "telegram.org": "telegram" };
    for (const [domain, platform] of Object.entries(hosts)) {
      if (host === domain || host.endsWith(`.${domain}`)) return platform;
    }
  } catch { /* Unknown/legacy data uses the generic website icon. */ }
  return "website";
}

function SocialMark({ platform }: { platform: string }) {
  if (platform === "linkedin") return <LinkedInIcon />;
  if (platform === "github") return <GitHubIcon />;
  if (platform === "website") return <Globe aria-hidden="true" />;
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {platform === "facebook" && <path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5A25 25 0 0 0 15 1c-3 0-5 1.9-5 5.5V9H7v4h3v9z" />}
    {platform === "x" && <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-7.4L5.6 22H2.4l8.2-9.5L.8 2h6.4l4.4 6.6L18.9 2zm-1.1 18h1.7L6.2 3.9H4.4L17.8 20z" />}
    {platform === "instagram" && <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></g>}
    {platform === "youtube" && <><path d="M22.5 6.3a3 3 0 0 0-2.1-2.1C18.5 3.7 12 3.7 12 3.7s-6.5 0-8.4.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 1 12a31 31 0 0 0 .5 5.7 3 3 0 0 0 2.1 2.1c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-5.7z" /><path d="m10 8 6 4-6 4z" fill="#b91c1c" /></>}
    {platform === "telegram" && <path d="m21.4 3.1-3.2 17c-.2 1.2-.9 1.5-1.9.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.4-.1-.6-.6-.3L5.9 13.9l-4.7-1.5c-1-.3-1-1 .2-1.5L20 3.7c.9-.4 1.7-.2 1.4-.6z" />}
    {platform === "whatsapp" && <><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M20.7 11.7a8.7 8.7 0 0 1-13 7.6L3 21l1.5-4.7a8.7 8.7 0 1 1 16.2-4.6Z" /><path d="M8.2 6.7c-.4 0-.8.4-1 1-.6 2.2 1.6 5.8 4.6 7.4 2.3 1.3 4 .7 4.5-.4.2-.5.3-1.2-.1-1.4l-2-1c-.4-.2-.7.6-1.1 1-.3.3-1.4-.4-2.1-1s-1.6-1.7-1.4-2.1c.2-.4 1-.8.8-1.3l-.9-2c-.2-.4-.8-.3-1.3-.2Z" /></>}
  </svg>;
}

/** Presentation only: render exactly the active links returned by the existing CMS. */
export function SocialLinks({ links }: { links: readonly SocialLink[] }) {
  if (!links.length) return null;
  return <div className={styles.links} role="group" aria-label="Social links">
    {links.map((link, index) => {
      const platform = socialPlatform(link);
      const label = link.label?.trim() || names[platform];
      return <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer"
        className={styles.link} data-platform={platform} aria-label={`${label} (opens in a new tab)`} title={label}>
        <SocialMark platform={platform} />
      </a>;
    })}
  </div>;
}
