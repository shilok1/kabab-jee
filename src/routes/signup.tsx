import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Kabab Jee" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("We sent a 6-digit code to your email");
    setStep("otp");
  };

  const verify = async () => {
    if (code.length !== 6) return toast.error("Enter the 6-digit code");
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    setVerifying(false);
    if (error) return toast.error(error.message);
    toast.success("Account verified! Welcome.");
    nav({ to: "/" });
  };

  const resend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) return toast.error(error.message);
    toast.success("New code sent");
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-6">
          {step === "form" ? (<>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join Kabab Jee to order and book tables</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Full name</Label><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
          </>) : (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Verify your email</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code sent to<br /><span className="font-medium text-foreground">{email}</span></p>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verify} disabled={verifying || code.length !== 6} className="w-full">
              {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & create account"}
            </Button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <button onClick={() => { setStep("form"); setCode(""); }} className="hover:text-primary">← Change email</button>
              <button onClick={resend} disabled={resending} className="hover:text-primary disabled:opacity-50">{resending ? "Sending..." : "Resend code"}</button>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}