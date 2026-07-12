"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { RossiyaniBrandMark } from "@/components/brand/RossiyaniBrandMark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface INavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  badge?: number;
}

interface AppNavProps {
  reviewDueCount: number;
  userInitial: string;
}

function buildNavItems(reviewDueCount: number): INavItem[] {
  return [
    {
      href: "/",
      label: "Accueil",
      match: (pathname) => pathname === "/",
    },
    {
      href: "/library",
      label: "Bibliothèque",
      match: (pathname) =>
        pathname === "/library" ||
        pathname.startsWith("/library/") ||
        pathname.startsWith("/reader/"),
    },
    {
      href: "/lessons",
      label: "Leçons",
      match: (pathname) =>
        pathname === "/lessons" || pathname.startsWith("/lessons/"),
    },
    {
      href: "/vocabulary",
      label: "Vocabulaire",
      match: (pathname) =>
        pathname === "/vocabulary" ||
        pathname.startsWith("/vocabulary/") ||
        pathname === "/review" ||
        pathname.startsWith("/review/"),
      badge: reviewDueCount,
    },
    {
      href: "/practice",
      label: "Pratique",
      match: (pathname) => pathname.startsWith("/practice"),
    },
  ];
}

export function AppNav({ reviewDueCount, userInitial }: AppNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = buildNavItems(reviewDueCount);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-surface">
      <div className="relative mx-auto flex h-14 max-w-dashboard items-center px-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <RossiyaniBrandMark size="md" />
          <span className="text-[15px] font-bold text-ink">Rossiyani</span>
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              isActive={item.match(pathname)}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ProfileMenu userInitial={userInitial} />

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink md:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] bg-surface p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="text-base font-bold text-ink">
              Menu
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-4" aria-label="Navigation mobile">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors",
                  item.match(pathname)
                    ? "font-semibold text-ink"
                    : "font-medium text-ink-3",
                )}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-border p-4">
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-2 hover:text-ink"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function NavLink({
  item,
  isActive,
}: {
  item: INavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative rounded-[7px] px-3 py-2 text-[13px] font-medium transition-all duration-150",
        isActive
          ? "font-semibold text-ink"
          : "text-ink-3 hover:bg-bg hover:text-ink",
      )}
    >
      <span className="flex items-center gap-1.5">
        {item.label}
        {item.badge !== undefined && item.badge > 0 && (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {item.badge}
          </span>
        )}
      </span>
      {isActive && (
        <span
          className="absolute -bottom-[13px] left-2 right-2 h-0.5 rounded-sm bg-accent"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

function ProfileMenu({ userInitial }: { userInitial: string }) {
  const profileMenuItemClassName = cn(
    "p-0 text-ink-2",
    "focus:bg-bg focus:text-ink data-[highlighted]:bg-bg data-[highlighted]:text-ink",
    "focus:**:text-ink data-[highlighted]:**:text-ink",
  );

  const profileMenuTriggerClassName = cn(
    "hidden size-8 items-center justify-center rounded-full bg-accent-light text-xs font-bold text-accent outline-none transition-colors md:inline-flex",
    "hover:bg-bg data-popup-open:bg-accent-light",
    "focus-visible:ring-2 focus-visible:ring-accent/30",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={profileMenuTriggerClassName}
        aria-label="Menu profil"
      >
        {userInitial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem className={profileMenuItemClassName}>
          <form action="/api/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-inherit"
            >
              Se déconnecter
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
