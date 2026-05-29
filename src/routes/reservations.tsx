import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Book a Table — Kabab Jee" }] }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { data: tables } = useQuery({
    queryKey: ["public-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("id,label,seats,status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = (() => {
    const list = tables ?? [];
    const by = (s: string) => list.filter((t) => t.status === s);
    const seatsOf = (s: string) => by(s).reduce((sum, t) => sum + (t.seats || 0), 0);
    return {
      total: list.length,
      free: by("free").length,
      booked: by("booked").length,
      reserved: by("reserved").length,
      freeSeats: seatsOf("free"),
      bookedSeats: seatsOf("booked"),
      reservedSeats: seatsOf("reserved"),
    };
  })();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    reservation_at: "",
    party_size: 2,
    special_requests: "",
    table_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const freeTables = (tables ?? []).filter((t) => t.status === "free").sort((a, b) => a.seats - b.seats);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/reservations" } });
  }, [loading, user, nav]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.table_id) return toast.error("Please choose a table");
    void submitReservation();
  };

  const submitReservation = async () => {
    if (!user) return;
    setSubmitting(true);
    const chosen = freeTables.find((t) => t.id === form.table_id);
    const tableNote = chosen ? `Table: ${chosen.label} (${chosen.seats} seats)` : "";
    const notes = [tableNote, form.special_requests].filter(Boolean).join(" — ");
    const { error } = await supabase.from("reservations").insert({
      user_id: user.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      reservation_at: new Date(form.reservation_at).toISOString(),
      party_size: Number(form.party_size),
      special_requests: notes || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Reservation requested! We'll confirm shortly.");
    setForm({ customer_name: "", customer_phone: "", reservation_at: "", party_size: 2, special_requests: "", table_id: "" });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Book a Table</h1>
      <p className="mt-1 text-sm text-muted-foreground">Reserve your spot — we'll have the kababs ready.</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Free</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.free}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {stats.freeSeats} seats
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Booked</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.booked}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {stats.bookedSeats} seats
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Reserved</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.reserved}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {stats.reservedSeats} seats
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full name</Label><Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
              <div><Label>Date & time</Label><Input type="datetime-local" required value={form.reservation_at} onChange={(e) => setForm({ ...form, reservation_at: e.target.value })} /></div>
              <div><Label>Party size</Label><Input type="number" min={1} max={30} required value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Choose your table</Label>
              <Select value={form.table_id} onValueChange={(v) => setForm({ ...form, table_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={freeTables.length ? "Select an available table" : "No free tables right now"} />
                </SelectTrigger>
                <SelectContent>
                  {freeTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label} — {t.seats} seats
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Only free tables are shown.</p>
            </div>
            <div><Label>Special requests (optional)</Label><Textarea rows={3} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} /></div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Request reservation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}