"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, HeartHandshake, FileText, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

/**
 * Avatar menu in the header.
 *
 * Replaces a truncated email that took most of the header width on mobile and
 * told the user nothing they did not already know. The full address still
 * appears inside the menu.
 *
 * The initial comes from the email rather than the donor's name on purpose: the
 * header renders on every page, and reading the donors table here would add a
 * database round trip to pages that otherwise need none.
 */
export function UserMenu({ email, t }: { email: string; t: Dictionary }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const initial = (email.trim()[0] ?? "?").toUpperCase();

  const links = [
    { href: "/donor", label: t.nav.profile, Icon: User },
    { href: "/for-you", label: t.nav.forYou, Icon: HeartHandshake },
    { href: "/my-requests", label: t.nav.myRequests, Icon: FileText },
  ];

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          // 44px tap target, matching the rest of the app.
          className="flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface text-sm font-bold text-primary-hover shadow-soft transition-colors duration-150 ease-out hover:border-primary/30 hover:bg-primary-tint"
          aria-label={email}
        >
          <span aria-hidden="true">{initial}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 rounded-card p-1.5">
        {/* The address lives here instead of in the header bar. */}
        <p className="truncate px-2.5 py-2 text-xs text-subtle" title={email}>
          {email}
        </p>

        <DropdownMenuSeparator />

        {links.map(({ href, label, Icon }) => (
          <DropdownMenuItem key={href} asChild className="rounded-button">
            <Link href={href} className="flex min-h-11 items-center gap-2.5 text-sm">
              <Icon className="h-[18px] w-[18px] text-subtle" strokeWidth={1.75} />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            // Keep the menu open while the sign-out request is in flight.
            e.preventDefault();
            void signOut();
          }}
          className="flex min-h-11 items-center gap-2.5 rounded-button text-sm font-medium text-critical-ink focus:bg-critical-tint focus:text-critical-ink"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {signingOut ? t.common.loading : t.common.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
