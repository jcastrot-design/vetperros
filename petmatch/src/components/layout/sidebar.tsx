"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavGroup, ownerNav, walkerNav, vetNav, clinicNav, adminNav, insuranceProviderNav } from "@/config/nav";
import { PawPrint } from "lucide-react";

interface SidebarProps {
  role: string;
  className?: string;
}

function getNavGroups(role: string): NavGroup[] {
  switch (role) {
    case "WALKER":
      return walkerNav;
    case "VET":
      return vetNav;
    case "CLINIC":
      return clinicNav;
    case "INSURANCE_PROVIDER":
      return insuranceProviderNav;
    case "ADMIN":
      return adminNav;
    default:
      return ownerNav;
  }
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navGroups = getNavGroups(role);

  function isItemActive(href: string) {
    const [path, qs] = href.split("?");
    const noExact = ["/dashboard", "/provider", "/clinic", "/admin"];
    const pathMatch = pathname === path || (!noExact.includes(path) && pathname.startsWith(path));
    if (!qs) return pathMatch;
    // For items with query params (e.g. ?tab=domicilio), also check search params
    const params = new URLSearchParams(qs);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return pathMatch;
  }

  function isParentActive(href: string) {
    const [path] = href.split("?");
    const noExact = ["/dashboard", "/provider", "/clinic", "/admin"];
    return pathname === path || (!noExact.includes(path) && pathname.startsWith(path));
  }

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r bg-card h-screen sticky top-0",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <PawPrint className="h-7 w-7 text-orange-500" />
        <span className="text-xl font-bold text-orange-500">PetMatch</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const parentActive = isParentActive(item.href);
                const Icon = item.icon;
                const expanded = item.children && parentActive;

                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-orange-100 text-orange-700"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>

                    {expanded && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-orange-100 pl-3">
                        {item.children!.map((child) => {
                          const childActive = isItemActive(child.href);
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                                childActive
                                  ? "bg-orange-100 text-orange-700"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <ChildIcon className="h-3.5 w-3.5" />
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
