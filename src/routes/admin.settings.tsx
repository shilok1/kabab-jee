import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data, refetch } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [isOpen, setIsOpen] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (data) {
      setIsOpen(data.is_open);
      setMsg(data.closed_message ?? "");
    }
  }, [data]);

  const save = async () => {
    if (!data) return;
    const { error } = await supabase
      .from("shop_settings")
      .update({ is_open: isOpen, closed_message: msg })
      .eq("id", data.id);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    refetch();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold">Shop Settings</h2>
      <Card className="mt-4">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Shop is {isOpen ? "Open" : "Closed"}</Label>
              <p className="text-xs text-muted-foreground">
                When closed, customers see your message and cannot place orders.
              </p>
            </div>
            <Switch checked={isOpen} onCheckedChange={setIsOpen} />
          </div>
          <div>
            <Label>Closed message</Label>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
          </div>
          <Button onClick={save}>Save changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}