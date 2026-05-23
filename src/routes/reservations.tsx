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

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Book a Table — Kabab Jee" }] }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    reservation_at: "",
    party_size: 2,
    special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/reservations" } });
  }, [loading, user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reservations").insert({
      user_id: user.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      reservation_at: new Date(form.reservation_at).toISOString(),
      party_size: Number(form.party_size),
      special_requests: form.special_requests || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Reservation requested! We'll confirm shortly.");
    setForm({ customer_name: "", customer_phone: "", reservation_at: "", party_size: 2, special_requests: "" });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Book a Table</h1>
      <p className="mt-1 text-sm text-muted-foreground">Reserve your spot — we'll have the kababs ready.</p>
      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full name</Label><Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
              <div><Label>Date & time</Label><Input type="datetime-local" required value={form.reservation_at} onChange={(e) => setForm({ ...form, reservation_at: e.target.value })} /></div>
              <div><Label>Party size</Label><Input type="number" min={1} max={30} required value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} /></div>
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