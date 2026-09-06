import Image from "next/image";
import { Globe, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function TeamCard({
  name,
  roleTitle,
  photoUrl,
  shortBio,
  skills,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  email,
  className,
}: {
  name: string;
  roleTitle?: string | null;
  photoUrl?: string | null;
  shortBio?: string | null;
  skills?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  /** Rendered only when public_email is true upstream. */
  email?: string | null;
  className?: string;
}) {
  const socials = [
    linkedinUrl ? { href: linkedinUrl, label: `${name} on LinkedIn`, Icon: LinkedInIcon } : null,
    githubUrl ? { href: githubUrl, label: `${name} on GitHub`, Icon: GitHubIcon } : null,
    portfolioUrl ? { href: portfolioUrl, label: `${name}'s portfolio`, Icon: Globe } : null,
    email ? { href: `mailto:${email}`, label: `Email ${name}`, Icon: Mail } : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <article
      className={cn(
        "group card-3d flex h-full flex-col rounded-[1.375rem] p-5",
        className,
      )}
    >
      <div className="relative z-10 mx-auto rounded-full bg-brand-gradient p-[3px] shadow-[0_8px_24px_-6px_rgb(37_87_232/0.5)] transition-transform duration-300 ease-spring group-hover:scale-[1.04]">
        <div className="relative aspect-square w-28 overflow-hidden rounded-full border-[3px] border-surface bg-canvas-raised">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`Portrait of ${name}`}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50">
            <span aria-hidden="true" className="text-gradient text-2xl font-bold">
              {initials(name)}
            </span>
          </div>
        )}
        </div>
      </div>
      <div className="relative z-10 mt-4 text-center">
        <h3 className="font-semibold tracking-tight text-ink">{name}</h3>
        {roleTitle ? (
          <p className="mt-0.5 text-sm font-medium text-brand-600">{roleTitle}</p>
        ) : null}
        {shortBio ? <p className="mt-2 text-sm text-ink-muted">{shortBio}</p> : null}
      </div>
      {skills && skills.length > 0 ? (
        <ul className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5" aria-label={`${name}'s skills`}>
          {skills.slice(0, 4).map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs text-ink-soft"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}
      {socials.length > 0 ? (
        <div className="relative z-10 mt-4 flex justify-center gap-1 border-t border-line pt-3">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(/^https?:\/\//i.test(href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-[color,background-color,transform] duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-600 focus-ring"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
