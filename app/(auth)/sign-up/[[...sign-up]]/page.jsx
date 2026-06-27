"use client";

import { useState, useCallback, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PasswordStrength, evaluatePassword } from "@/components/auth/password-strength";

// ─── Helpers ────────────────────────────────────────────────────────────────
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

function PasswordInput({ id, value, onChange, placeholder, showToggle = true }) {
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
        autoComplete="new-password"
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// ─── Step 1: Registration form ───────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const { isLoaded, signUp } = useSignUp();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = useCallback(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    const { score } = evaluatePassword(form.password);
    if (score < 5) errs.password = "Password must satisfy all requirements.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
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
      await signUp.create({
        firstName: form.name.split(" ")[0],
        lastName:  form.name.split(" ").slice(1).join(" ") || undefined,
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      onSuccess(form.email);
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const { score } = evaluatePassword(form.password);
  const allMet = score === 5;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Full name */}
      <InputWrapper label="Full name" htmlFor="signup-name" error={errors.name}>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="signup-name"
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
            autoComplete="name"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
      </InputWrapper>

      {/* Email */}
      <InputWrapper label="Email address" htmlFor="signup-email" error={errors.email}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@example.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
      </InputWrapper>

      {/* Password */}
      <InputWrapper label="Password" htmlFor="signup-password" error={errors.password}>
        <PasswordInput
          id="signup-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Create a strong password"
        />
        <PasswordStrength password={form.password} />
      </InputWrapper>

      {/* Confirm password */}
      <InputWrapper label="Confirm password" htmlFor="signup-confirm" error={errors.confirm}>
        <PasswordInput
          id="signup-confirm"
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat your password"
        />
      </InputWrapper>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !allMet || form.confirm !== form.password}
        id="signup-submit"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
        ) : (
          <><ArrowRight className="w-4 h-4" /> Create account</>
        )}
      </button>

      {!allMet && form.password && (
        <p className="text-xs text-center text-muted-foreground">
          Complete all password requirements to continue.
        </p>
      )}
    </form>
  );
}

// ─── Step 2: OTP verification ────────────────────────────────────────────────
function VerifyForm({ email }) {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded || code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        toast.success("Account created! Welcome aboard 🎉");
        router.push("/onboarding");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.longMessage || "Invalid code. Please check and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("A new code has been sent to your email.");
    } catch {
      toast.error("Could not resend the code. Please try again.");
    }
  };

  return (
    <form onSubmit={handleVerify} noValidate className="space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
          <Mail className="w-5 h-5" />
        </div>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="verify-code" className="block text-sm font-medium text-foreground">
          Verification code
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 rounded-lg border border-border bg-background placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
        />
        {error && (
          <p className="text-xs text-destructive animate-in fade-in">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        id="verify-submit"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
        ) : (
          <><ShieldCheck className="w-4 h-4" /> Verify email</>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Didn't receive a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Resend code
        </button>
      </p>
    </form>
  );
}

// ─── Page shell ──────────────────────────────────────────────────────────────
function SignUpContent() {
  const [step, setStep] = useState("register"); // "register" | "verify"
  const [email, setEmail] = useState("");

  const handleRegistered = (emailAddress) => {
    setEmail(emailAddress);
    setStep("verify");
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Card */}
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
          <h1 className="text-2xl font-bold text-foreground mt-3">
            {step === "register" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "register"
              ? "Join thousands of professionals growing their careers."
              : "Check your inbox and enter the code below."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex px-8 pt-4 gap-2">
          {["register", "verify"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === s
                    ? "bg-primary text-primary-foreground scale-110"
                    : s === "verify" && step === "verify"
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === "register" ? "Account" : "Verify"}
              </span>
              {i === 0 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-8 pt-5 pb-8">
          {step === "register" ? (
            <RegisterForm onSuccess={handleRegistered} />
          ) : (
            <VerifyForm email={email} />
          )}
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
