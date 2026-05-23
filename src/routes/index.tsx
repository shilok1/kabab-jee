import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Utensils, Clock, Star, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPKR, useCart } from "@/lib/cart";
import { toast } from "sonner";
import hero from "@/assets/hero-bbq.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { add } = useCart();
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id,name,description,price,image_url")
        .eq("featured", true)
        .eq("available", true)
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="container relative mx-auto grid min-h-[78vh] items-center px-4 py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Flame className="h-3.5 w-3.5" /> Char-grilled. Slow-cooked. Always fresh.
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              The taste of <span className="text-primary">Lahore</span>,
              <br /> delivered to your door.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              From smoky seekh kababs to slow-simmered karahi — Kabab Jee brings authentic Pakistani BBQ to your table.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu"><Button size="lg">Order Now <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/reservations"><Button size="lg" variant="outline">Book a Table</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-3">
        {[
          { icon: Flame, t: "Authentic Recipes", d: "Family recipes passed down three generations." },
          { icon: Clock, t: "Fast Delivery", d: "Hot from the tandoor to your door in 30–45 minutes." },
          { icon: Star, t: "Premium Ingredients", d: "Halal-certified meat, fresh herbs, hand-ground spices." },
        ].map((f) => (
          <Card key={f.t} className="border-border/60">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary"><f.icon className="h-5 w-5" /></div>
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Signature Dishes</h2>
            <p className="mt-1 text-muted-foreground">Our chefs' most-loved plates.</p>
          </div>
          <Link to="/menu" className="hidden text-sm font-medium text-primary hover:underline md:inline-flex">
            View full menu →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(featured ?? []).map((m) => (
            <Card key={m.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
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
                  <span className="text-primary font-bold">{formatPKR(Number(m.price))}</span>
                </div>
                {m.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>}
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    add({ id: m.id, name: m.name, price: Number(m.price), image_url: m.image_url });
                    toast.success(`${m.name} added to cart`);
                  }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
