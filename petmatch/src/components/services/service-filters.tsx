"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

function FilterFields({
  maxPrice, setMaxPrice, minRating, setMinRating, sort, setSort,
  verified, setVerified, clearFilters, applyFilters,
}: {
  maxPrice: string; setMaxPrice: (v: string) => void;
  minRating: string; setMinRating: (v: string) => void;
  sort: string; setSort: (v: string) => void;
  verified: boolean; setVerified: (v: boolean) => void;
  clearFilters: () => void; applyFilters: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Precio maximo ($/hr)</Label>
        <Input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Ej: 10000"
          min={0}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Rating minimo</Label>
        <Select value={minRating} onValueChange={(v) => v !== null && setMinRating(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Cualquiera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3+ estrellas</SelectItem>
            <SelectItem value="4">4+ estrellas</SelectItem>
            <SelectItem value="4.5">4.5+ estrellas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Ordenar por</Label>
        <Select value={sort} onValueChange={(v) => v !== null && setSort(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mas recientes</SelectItem>
            <SelectItem value="rating">Mejor valorados</SelectItem>
            <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Solo verificados</Label>
        <div className="flex items-center gap-2 pt-1">
          <Switch checked={verified} onCheckedChange={setVerified} />
          <span className="text-sm">{verified ? "Si" : "No"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
          Limpiar
        </Button>
        <Button size="sm" onClick={applyFilters} className="flex-1 bg-brand hover:bg-brand-hover">
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
}

export function ServiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [verified, setVerified] = useState(searchParams.get("verified") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");

  function applyFilters() {
    const params = new URLSearchParams();
    const type = searchParams.get("type");
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (verified) params.set("verified", "true");
    if (sort && sort !== "recent") params.set("sort", sort);

    router.push(`/services?${params.toString()}`);
    setSheetOpen(false);
  }

  function clearFilters() {
    const type = searchParams.get("type");
    router.push(type ? `/services?type=${type}` : "/services");
    setSheetOpen(false);
  }

  const filterProps = {
    maxPrice, setMaxPrice, minRating, setMinRating,
    sort, setSort, verified, setVerified,
    clearFilters, applyFilters,
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Buscar por ciudad..."
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <Button onClick={applyFilters} className="bg-brand hover:bg-brand-hover">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop: toggle inline filters */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="hidden sm:flex"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Filtros
        </Button>

        {/* Mobile: open sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" className="sm:hidden" />}>
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filtros
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <FilterFields {...filterProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop inline filters */}
      {showFilters && (
        <div className="hidden sm:grid gap-4 sm:grid-cols-4 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label className="text-xs">Precio maximo ($/hr)</Label>
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Ej: 10000"
              min={0}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Rating minimo</Label>
            <Select value={minRating} onValueChange={(v) => v !== null && setMinRating(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3+ estrellas</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="4.5">4.5+ estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Ordenar por</Label>
            <Select value={sort} onValueChange={(v) => v !== null && setSort(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mas recientes</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Solo verificados</Label>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={verified} onCheckedChange={setVerified} />
              <span className="text-sm">{verified ? "Si" : "No"}</span>
            </div>
          </div>

          <div className="sm:col-span-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button size="sm" onClick={applyFilters} className="bg-brand hover:bg-brand-hover">
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
