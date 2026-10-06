"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BLOOD_TYPES } from "@/lib/blood";
import { DISTRICTS } from "@/lib/districts";
import { Button } from "@/components/ui/button";
import type { Dictionary, Lang } from "@/lib/i18n";

const SELECT =
  "h-11 w-full rounded-input border border-border bg-surface px-3 text-sm font-medium text-foreground shadow-soft transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:w-auto";

/** Blood type and district filters, kept in the URL so the view is shareable. */
export function FeedFilters({ t, lang }: { t: Dictionary; lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const bloodType = params.get("type") ?? "";
  const district = params.get("district") ?? "";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="filter-type">
        {t.feed.filterBloodType}
      </label>
      <select
        id="filter-type"
        className={SELECT}
        value={bloodType}
        onChange={(e) => update("type", e.target.value)}
      >
        <option value="">{t.feed.allBloodTypes}</option>
        {BLOOD_TYPES.map((bt) => (
          <option key={bt} value={bt}>
            {bt}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-district">
        {t.feed.filterDistrict}
      </label>
      <select
        id="filter-district"
        className={SELECT}
        value={district}
        onChange={(e) => update("district", e.target.value)}
      >
        <option value="">{t.feed.allDistricts}</option>
        {DISTRICTS.map((d) => (
          <option key={d.value} value={d.value}>
            {d[lang]}
          </option>
        ))}
      </select>

      {bloodType || district ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          {t.feed.clearFilters}
        </Button>
      ) : null}
    </div>
  );
}
