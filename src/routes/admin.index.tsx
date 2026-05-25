import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,created_at,customer_name,customer_phone,status,payment_method,payment_status,total")
        .order("created_at", { ascending: false })
        .limit(100);
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

  return (
    <div>
      <h2 className="text-xl font-semibold">Recent Orders</h2>
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