"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

/**
 * Desktop navigation.
 *
 * The previous version had no active state, so the only visible treatment was a
 * grey hover pill that read as a stray artifact. Now the current page carries a
 * tinted pill in the brand colour — matching the language toggle and the blood
 * type tiles — and hover is a much lighter wash.
 */
export function MainNav({ t }: { t: Dictionary }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/for-you", label: t.nav.forYou },
    { href: "/my-requests", label: t.nav.myRequests },
    { href: "/donor", label: t.nav.profile },
    { href: "/learn", label: t.nav.learn },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="hidden items-center gap-0.5 md:flex" aria-label={t.nav.home}>
      {links.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-pill px-3 py-2 text-sm transition-colors duration-150 ease-out",
              active
                ? "bg-primary-tint font-semibold text-primary-hover"
                : "font-medium text-subtle hover:bg-standard-tint/70 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
