import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/cart";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Orders — Kabab Jee" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/account" } });
  }, [loading, user, nav]);

  const { data: orders } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,created_at,status,payment_method,payment_status,total,order_items(item_name,quantity,line_total)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track your recent orders and their status.</p>
      <div className="mt-8 space-y-4">
        {(orders ?? []).length === 0 && (
          <Card><CardContent className="p-6 text-center text-muted-foreground">You haven't placed any orders yet.</CardContent></Card>
        )}
        {(orders ?? []).map((o) => (
          <Card key={o.id}>
            <CardContent className="space-y-3 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{o.status}</Badge>
                  <Badge variant="outline">{o.payment_method.toUpperCase()} · {o.payment_status}</Badge>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {o.order_items?.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.quantity}× {it.item_name}</span>
                    <span>{formatPKR(Number(it.line_total))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                <span>Total</span><span className="text-primary">{formatPKR(Number(o.total))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}