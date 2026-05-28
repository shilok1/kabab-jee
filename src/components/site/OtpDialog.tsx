import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  email: string;
  /** "reauthentication" for signed-in users (checkout, reservation). "signup" for new accounts. */
  purpose: "reauthentication" | "signup";
  title?: string;
  description?: string;
  onVerified: () => void;
  onCancel: () => void;
};

export function OtpDialog({ open, email, purpose, title, description, onVerified, onCancel }: Props) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      if (purpose === "reauthentication") {
        const { error } = await supabase.auth.reauthenticate();
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) throw error;
      }
      setSent(true);
      toast.success(`Code sent to ${email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send code");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (open && !sent) void send();
    if (!open) {
      setCode("");
      setSent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const verify = async () => {
    if (code.length !== 6) return toast.error("Enter the 6-digit code");
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp(
        purpose === "reauthentication"
          ? { type: "reauthentication", token: code, email }
          : { type: "signup", token: code, email },
      );
      if (error) throw error;
      toast.success("Verified");
      onVerified();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title ?? "Verify it's you"}</DialogTitle>
          <DialogDescription className="text-center">
            {description ?? `We've sent a 6-digit code to ${email}. Enter it below to continue.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button onClick={verify} disabled={verifying || code.length !== 6} className="w-full">
            {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & continue"}
          </Button>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {sending ? "Sending..." : "Didn't get it? Resend code"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}