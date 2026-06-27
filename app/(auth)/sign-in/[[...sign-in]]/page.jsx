"use client";

import { useState, useCallback, Suspense } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Loader2,
  ShieldCheck, KeyRound, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { PasswordStrength, evaluatePassword } from "@/components/auth/password-strength";

// ─── Shared UI atoms ─────────────────────────────────────────────────────────
function InputWrapper({ label, htmlFor, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete = "current-password" }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function PrimaryButton({ loading, loadingText, children, disabled, id }) {
  return (
    <button
      type="submit"
      id={id}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> {loadingText}</>
      ) : children}
    </button>
  );
}

// ─── Screen 1: Sign-in form ───────────────────────────────────────────────────
function SignInForm({ onForgot }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email address is required.";
    if (!form.password)     errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        toast.error("Sign-in incomplete. Please try again.");
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Incorrect email or password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <InputWrapper label="Email address" htmlFor="signin-email" error={errors.email}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="signin-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@example.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
      </InputWrapper>

      <InputWrapper label="Password" htmlFor="signin-password" error={errors.password}>
        <PasswordInput
          id="signin-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Your password"
        />
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-primary font-semibold hover:underline underline-offset-4"
          >
            Forgot password?
          </button>
        </div>
      </InputWrapper>

      <PrimaryButton loading={loading} loadingText="Signing in…" id="signin-submit">
        <ArrowRight className="w-4 h-4" /> Sign in
      </PrimaryButton>
    </form>
  );
}

// ─── Screen 2: Forgot-password → request reset code ─────────────────────────
function ForgotRequestForm({ onBack, onCodeSent }) {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email address is required."); return; }
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signIn.create({ identifier: email });
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: signIn.supportedFirstFactors.find(
          (f) => f.strategy === "reset_password_email_code"
        )?.emailAddressId,
      });
      toast.success("Reset code sent! Check your inbox.");
      onCodeSent(email);
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || "Could not send reset code. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
          <KeyRound className="w-5 h-5" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the email linked to your account and we'll send a reset code.
        </p>
      </div>

      <InputWrapper label="Email address" htmlFor="forgot-email" error={error}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
      </InputWrapper>

      <PrimaryButton loading={loading} loadingText="Sending code…" id="forgot-submit">
        <Mail className="w-4 h-4" /> Send reset code
      </PrimaryButton>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to sign-in
      </button>
    </form>
  );
}

// ─── Screen 3: Reset password (code + new password) ─────────────────────────
function ResetPasswordForm({ email, onBack }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [form, setForm] = useState({ code: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = useCallback(() => {
    const errs = {};
    if (form.code.length !== 6)             errs.code = "Enter the 6-digit code from your email.";
    const { score } = evaluatePassword(form.password);
    if (score < 5)                           errs.password = "Password must satisfy all requirements.";
    if (form.confirm !== form.password)     errs.confirm = "Passwords do not match.";
    return errs;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: form.code,
        password: form.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password updated! You're now signed in. 🔐");
        router.push("/dashboard");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || "Invalid code or password. Please retry.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const { score } = evaluatePassword(form.password);
  const allMet = score === 5;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Code sent to <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      {/* OTP code */}
      <InputWrapper label="Reset code" htmlFor="reset-code" error={errors.code}>
        <input
          id="reset-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
          placeholder="000000"
          className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 rounded-lg border border-border bg-background placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
        />
      </InputWrapper>

      {/* New password */}
      <InputWrapper label="New password" htmlFor="reset-password" error={errors.password}>
        <PasswordInput
          id="reset-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Create a strong new password"
          autoComplete="new-password"
        />
        <PasswordStrength password={form.password} />
      </InputWrapper>

      {/* Confirm password */}
      <InputWrapper label="Confirm new password" htmlFor="reset-confirm" error={errors.confirm}>
        <PasswordInput
          id="reset-confirm"
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat your new password"
          autoComplete="new-password"
        />
      </InputWrapper>

      <PrimaryButton
        loading={loading}
        loadingText="Resetting…"
        disabled={!allMet || form.confirm !== form.password || form.code.length !== 6}
        id="reset-submit"
      >
        <ShieldCheck className="w-4 h-4" /> Set new password
      </PrimaryButton>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
    </form>
  );
}

// ─── Page shell ──────────────────────────────────────────────────────────────
const STEPS = {
  signin:        { title: "Welcome back",         sub: "Sign in to your PathFinder AI account." },
  forgot_request:{ title: "Reset your password",  sub: "We'll email you a secure reset code." },
  forgot_reset:  { title: "Create new password",  sub: "Enter your code and choose a new password." },
};

function SignInContent() {
  const [screen, setScreen] = useState("signin");
  const [resetEmail, setResetEmail] = useState("");

  const { title, sub } = STEPS[screen];

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              PathFinder AI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-3">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{sub}</p>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-8">
          {screen === "signin" && (
            <SignInForm onForgot={() => setScreen("forgot_request")} />
          )}
          {screen === "forgot_request" && (
            <ForgotRequestForm
              onBack={() => setScreen("signin")}
              onCodeSent={(email) => { setResetEmail(email); setScreen("forgot_reset"); }}
            />
          )}
          {screen === "forgot_reset" && (
            <ResetPasswordForm
              email={resetEmail}
              onBack={() => setScreen("forgot_request")}
            />
          )}
        </div>
      </div>

      {/* Footer link */}
      {screen === "signin" && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            Create one free
          </Link>
        </p>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
