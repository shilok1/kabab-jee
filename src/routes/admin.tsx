import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/cart";
import { Shield, Package, CalendarDays, Utensils } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Kabab Jee" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/admin" } });
  }, [loading, user, nav]);

  const { data: orders, refetch } = useQuery({
    queryKey: ["admin-orders"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,created_at,customer_name,customer_phone,status,payment_method,payment_status,total")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as never }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Order ${status}`);
    refetch();
  };

  if (loading) return <div className="container mx-auto px-4 py-24 text-center">Loading...</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have admin privileges. Contact the restaurant owner to be promoted.
        </p>
        <Link to="/" className="mt-6 inline-block"><Button>Go home</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-6"><Package className="h-8 w-8 text-primary" /><div><div className="text-2xl font-bold">{orders?.length ?? 0}</div><div className="text-sm text-muted-foreground">Recent orders</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-6"><Utensils className="h-8 w-8 text-primary" /><div><div className="text-sm text-muted-foreground">Manage menu</div><div className="text-xs">Coming soon</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-6"><CalendarDays className="h-8 w-8 text-primary" /><div><div className="text-sm text-muted-foreground">Reservations</div><div className="text-xs">Coming soon</div></div></CardContent></Card>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Recent Orders</h2>
      <div className="mt-4 space-y-3">
        {(orders ?? []).map((o) => (
          <Card key={o.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="font-medium">{o.customer_name} · {o.customer_phone}</div>
                <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}</div>
                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary">{o.status}</Badge>
                  <Badge variant="outline">{o.payment_method.toUpperCase()} · {o.payment_status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{formatPKR(Number(o.total))}</span>
                <select
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                >
                  {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
        {(orders ?? []).length === 0 && (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No orders yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}