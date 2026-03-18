"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartBadge() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? totalItems() : 0;

  return (
    <Button variant="ghost" size="icon" className="relative" nativeButton={false} render={<Link href="/marketplace/cart" />}>
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand text-brand-foreground text-xs flex items-center justify-center font-medium">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
