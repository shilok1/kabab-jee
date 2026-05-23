import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPKR, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Kabab Jee" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const deliveryFee = items.length > 0 ? 150 : 0;

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some delicious kababs to get started.</p>
        <Link to="/menu" className="mt-6"><Button>Browse Menu</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <Card key={it.id} className="border-border/60"><CardContent className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 rounded-md bg-gradient-to-br from-primary/15 to-secondary/15" />
              <div className="flex-1"><div className="font-medium">{it.name}</div><div className="text-sm text-muted-foreground">{formatPKR(it.price)}</div></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQty(it.id, it.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center">{it.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQty(it.id, it.quantity + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <div className="w-24 text-right font-semibold">{formatPKR(it.price * it.quantity)}</div>
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent></Card>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-4" onClick={clear}>Clear cart</Button>
      </div>
      <Card className="h-fit border-border/60"><CardContent className="p-6">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPKR(deliveryFee)}</span></div>
          <div className="border-t border-border/60 pt-2" />
          <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-primary">{formatPKR(subtotal + deliveryFee)}</span></div>
        </div>
        <Link to="/checkout"><Button className="mt-6 w-full">Proceed to Checkout</Button></Link>
      </CardContent></Card>
    </div>
  );
}