import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "@/components/common/motion";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_HOME, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or join SkillSwap" },
      {
        name: "description",
        content:
          "Create your SkillSwap account as a student, mentor or local business and start exchanging skills near you.",
      },
      { property: "og:title", content: "Sign in or join SkillSwap" },
      { property: "og:description", content: "Join the hyperlocal skill exchange marketplace." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Minimum 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72)
    .regex(/[0-9]/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
  fullName: z.string().trim().min(2, "Tell us your name").max(100),
  role: z.enum(["student", "mentor", "msme"]),
  city: z.string().trim().max(80).optional(),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

function friendlyAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Wrong email or password. Please try again.";
  if (msg.includes("email not confirmed")) return "Please confirm your email, then sign in again.";
  if (msg.includes("weak") || msg.includes("pwned"))
    return "That password appears in known data breaches. Pick a more unique one.";
  if (msg.includes("already registered") || msg.includes("user already"))
    return "An account with this email already exists. Try signing in instead.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  return raw;
}


function AuthPage() {
  const { mode = "signin", redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [tab, setTab] = useState(mode);

  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect ?? (role ? ROLE_HOME[role] : null) ?? "/dashboard", replace: true });
    }
  }, [loading, user, role, navigate, redirect]);

  return (
    <div className="hero-surface flex min-h-screen items-center justify-center px-5 py-12">
      <FadeIn className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground transition-transform duration-300 hover:scale-105">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">SkillSwap</span>
        </Link>

        <div className="surface-card p-7">
          {tab !== "forgot" ? (
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {tab === "signin" ? (
                      <SignInForm onForgot={() => setTab("forgot")} />
                    ) : (
                      <SignUpForm />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <GoogleButton />
            </Tabs>
          ) : (
            <ForgotForm onBack={() => setTab("signin")} />
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to SkillSwap's community guidelines.
        </p>
      </FadeIn>

    </div>
  );
}

function GoogleButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="mt-4 w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if ("error" in result && result.error) {
          toast.error("Google sign-in failed. Please try again.");
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="animate-spin" /> : null} Continue with Google
    </Button>
  );
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof signInSchema>) => {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Welcome back!"),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="button"
          onClick={onForgot}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Forgot password?
        </button>
        <Button type="submit" variant="hero" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "", role: "student", city: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof signUpSchema>) => {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: values.fullName, role: values.role, city: values.city },
        },
      });
      if (error) throw error;
    },
    onSuccess: () =>
      toast.success("Account created", {
        description: "Check your inbox to verify your email, then sign in.",
      }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Ananya Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" placeholder="At least 6 characters" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student / learner</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="msme">Local business</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Bengaluru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
    </Form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof forgotSchema>) => {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Reset link sent", { description: "Check your email inbox." }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Reset your password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll email you a secure link to choose a new password.
          </p>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="hero" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" />} Send reset link
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Back to sign in
        </Button>
      </form>
    </Form>
  );
}
