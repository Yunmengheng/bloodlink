"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HeartHandshake, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

/**
 * Mobile tab bar, below 768px only. On desktop the same destinations appear in
 * the header nav instead.
 */
export function BottomTabBar({ t }: { t: Dictionary }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: t.nav.home, Icon: Home },
    { href: "/for-you", label: t.nav.forYou, Icon: HeartHandshake },
    { href: "/donor", label: t.nav.profile, Icon: User },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label={t.nav.home}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
      // Keeps the bar clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-content grid-cols-4 items-end">
        {tabs.slice(0, 2).map(({ href, label, Icon }) => (
          <TabLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}

        {/* Raised centre button for the primary action. */}
        <div className="flex justify-center">
          <Link
            href="/requests/new"
            className="-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-pill bg-primary text-primary-foreground shadow-lift transition-transform duration-150 ease-out active:scale-95"
          >
            <Plus className="h-6 w-6" strokeWidth={2} />
            <span className="sr-only">{t.nav.post}</span>
          </Link>
        </div>

        {tabs.slice(2).map(({ href, label, Icon }) => (
          <TabLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors duration-150",
        active ? "text-primary" : "text-subtle hover:text-foreground",
      )}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.75} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
