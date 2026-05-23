import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { formatPKR, useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Kabab Jee" },
      { name: "description", content: "Browse our full menu of BBQ, karahi, biryani, breads and beverages." },
      { property: "og:title", content: "Menu — Kabab Jee" },
      { property: "og:description", content: "Order char-grilled kababs, karahi, biryani and more." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const { add } = useCart();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["menu-items", activeCat],
    queryFn: async () => {
      let q = supabase.from("menu_items").select("*").eq("available", true);
      if (activeCat !== "all") q = q.eq("category_id", activeCat);
      const { data, error } = await q.order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Our Menu</h1>
      <p className="mt-2 text-muted-foreground">Fresh from the tandoor and the karahi pan.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant={activeCat === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCat("all")}>All</Button>
        {(categories ?? []).map((c) => (
          <Button key={c.id} variant={activeCat === c.id ? "default" : "outline"} size="sm" onClick={() => setActiveCat(c.id)}>
            {c.name}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((m) => (
          <Card key={m.id} className="overflow-hidden border-border/60">
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15">
              {m.image_url ? (
                <img src={m.image_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <Utensils className="h-12 w-12 text-primary/60" />
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{m.name}</h3>
                <span className="font-bold text-primary">{formatPKR(Number(m.price))}</span>
              </div>
              {m.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>}
              <Button size="sm" className="mt-4 w-full" onClick={() => { add({ id: m.id, name: m.name, price: Number(m.price), image_url: m.image_url }); toast.success(`${m.name} added to cart`); }}>
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
        {items?.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">No items in this category yet.</p>}
      </div>
    </div>
  );
}