"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  NavItem,
  ownerMobileNav,
  walkerMobileNav,
  vetMobileNav,
  adminMobileNav,
  insuranceProviderNav,
} from "@/config/nav";

function getMobileItems(role?: string): NavItem[] {
  switch (role) {
    case "WALKER":
      return walkerMobileNav;
    case "VET":
      return vetMobileNav;
    case "ADMIN":
      return adminMobileNav;
    case "INSURANCE_PROVIDER":
      return insuranceProviderNav[0].items;
    default:
      return ownerMobileNav;
  }
}

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const items = getMobileItems(role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-orange-600" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-orange-100")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
