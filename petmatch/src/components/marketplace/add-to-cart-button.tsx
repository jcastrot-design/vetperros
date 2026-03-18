"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: number;
  image?: string;
}

export function AddToCartButton({ productId, productTitle, price, image }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    addItem({ productId, title: productTitle, price, image, quantity });
    toast.success(`${productTitle} agregado al carrito`, {
      description: `${quantity}x — $${(price * quantity).toLocaleString("es-CL")}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQuantity(1);
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-20 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          Total: <span className="font-semibold text-foreground">${(price * quantity).toLocaleString("es-CL")}</span>
        </span>
      </div>
      <Button
        onClick={handleAddToCart}
        className="w-full bg-brand hover:bg-brand-hover"
      >
        {added ? (
          <Check className="h-4 w-4 mr-1.5" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-1.5" />
        )}
        {added ? "Agregado!" : "Agregar al carrito"}
      </Button>
    </div>
  );
}
