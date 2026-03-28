"use client";

import { useState, FormEvent } from "react";
import config, { isLiveMode } from "@/lib/config";
import {
  ArrowRight,
  Check,
  AlertCircle,
  Zap,
  Target,
  Layers,
  Sparkles,
  Shield,
  TrendingUp,
  Loader2,
} from "lucide-react";

type FormStatus = "idle" | "loading" | "success" | "error";

/* ─── Shared sub-components ─── */

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div id="waitlist" className="mx-auto mt-10 max-w-md">
      {status === "success" ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-emerald-400">
          <Check className="h-5 w-5" />
          <span className="font-medium">
            You&apos;re on the list! We&apos;ll be in touch.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-primary/50 focus:bg-white/[0.06]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-60"
            style={{
              background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
            }}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isLiveMode ? "Try it Free" : "Join Waitlist"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
      )}
      <p className="mt-4 text-xs text-zinc-600">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

function LiveCtaButtons() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a
        href="/signup"
        className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:shadow-lg"
        style={{
          background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
        }}
      >
        {isLiveMode ? "Try it Free" : "Get Started Free"}
        <ArrowRight className="h-4 w-4" />
      </a>
      <a
        href="#pricing"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium transition-all hover:bg-white/5"
      >
        View Pricing
      </a>
    </div>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
      }}
    >
      {children}
    </span>
  );
}

function BrandIconBox({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "h-8 w-8 rounded-lg" : "h-12 w-12 rounded-xl";
  return (
    <div
      className={`inline-flex items-center justify-center ${sizeClasses}`}
      style={{
        background: `linear-gradient(to bottom right, color-mix(in srgb, var(--brand-primary) 20%, transparent), color-mix(in srgb, var(--brand-accent) 20%, transparent))`,
        borderWidth: 1,
        borderColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Layout sections ─── */

const stepIcons = [Target, Layers, Sparkles];
const painIcons = [AlertCircle, Shield, TrendingUp, Zap, Target, Layers];

function PainStatsSection() {
  const { landing } = config;
  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {landing.painStats.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 px-8 py-12 text-center">
            <GradientText>
              <span className="text-4xl font-bold">{item.stat}</span>
            </GradientText>
            <span className="text-sm text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { landing } = config;
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it <GradientText>works</GradientText>
          </h2>
          <p className="mt-4 text-zinc-400">
            Get started in minutes, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {landing.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="mb-5">
                  <BrandIconBox>
                    <Icon className="h-5 w-5 text-brand-primary" />
                  </BrandIconBox>
                </div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const { landing } = config;
  return (
    <section className="px-6 py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Problems we <GradientText>solve</GradientText>
          </h2>
          <p className="mt-4 text-zinc-400">
            Say goodbye to the frustrations holding you back.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landing.painPoints.map((point, i) => {
            const Icon = painIcons[i % painIcons.length];
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <BrandIconBox size="sm">
                  <Icon className="h-4 w-4 text-brand-primary" />
                </BrandIconBox>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {point}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { landing } = config;
  const waitlistMode = config.flags?.waitlistMode ?? true;
  if (waitlistMode && !isLiveMode) return null;

  return (
    <section id="pricing" className="px-6 py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, <GradientText>transparent</GradientText> pricing
          </h2>
          <p className="mt-4 text-zinc-400">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {landing.pricing.map((tier, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                tier.highlighted
                  ? "border-brand-primary/30 shadow-2xl"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
              style={
                tier.highlighted
                  ? {
                      background: `linear-gradient(to bottom, color-mix(in srgb, var(--brand-primary) 8%, transparent), color-mix(in srgb, var(--brand-accent) 4%, transparent))`,
                      boxShadow: `0 25px 50px -12px color-mix(in srgb, var(--brand-primary) 10%, transparent)`,
                    }
                  : undefined
              }
            >
              {tier.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white"
                  style={{
                    background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
                  }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.plan}</h3>
                <p className="mt-1 text-sm text-zinc-400">{tier.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-zinc-500">{tier.period}</span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/signup"
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? "text-white hover:shadow-lg"
                    : "border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
                style={
                  tier.highlighted
                    ? {
                        background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
                      }
                    : undefined
                }
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const { landing } = config;
  const waitlistMode = config.flags?.waitlistMode ?? true;

  return (
    <section className="relative px-6 py-32 overflow-hidden">
      {/* Glow effects */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-[120px] opacity-10"
        style={{ background: "var(--brand-primary)" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 right-1/3 h-[300px] w-[300px] rounded-full blur-[100px] opacity-10"
        style={{ background: "var(--brand-accent)" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          <GradientText>{landing.finalCta.headline}</GradientText>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          {landing.finalCta.subheadline}
        </p>

        <div className="mt-10">
          <a
            href={waitlistMode && !isLiveMode ? "#waitlist" : "/signup"}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition-all hover:shadow-xl"
            style={{
              background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
            }}
          >
            {isLiveMode ? "Try it Free" : "Join the Waitlist"}
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function NavBar() {
  const waitlistMode = config.flags?.waitlistMode ?? true;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-brand-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-accent))",
            }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {config.name}
          </span>
        </div>
        <a
          href={waitlistMode && !isLiveMode ? "#waitlist" : "/signup"}
          className="rounded-full px-5 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
          style={{
            background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
          }}
        >
          {isLiveMode ? "Try it Free" : "Get Early Access"}
        </a>
      </div>
    </nav>
  );
}

function FooterBar() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-md flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-accent))",
            }}
          >
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium">{config.name}</span>
        </div>
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Layout variants ─── */

function CenteredHero() {
  const { landing } = config;
  const waitlistMode = config.flags?.waitlistMode ?? true;
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-36 pb-24 text-center overflow-hidden">
      {/* Glow effects */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full blur-[120px] opacity-10"
        style={{ background: "var(--brand-primary)" }}
      />
      <div
        className="pointer-events-none absolute top-20 left-1/3 h-[400px] w-[400px] rounded-full blur-[100px] opacity-10"
        style={{ background: "var(--brand-accent)" }}
      />

      <div className="relative z-10 max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span>{isLiveMode ? "Now available" : "Now in early access"}</span>
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <GradientText>{landing.headline}</GradientText>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {landing.subheadline}
        </p>

        {waitlistMode && !isLiveMode ? <WaitlistForm /> : <LiveCtaButtons />}
      </div>
    </section>
  );
}

function SplitHero() {
  const { landing } = config;
  const waitlistMode = config.flags?.waitlistMode ?? true;
  return (
    <section className="relative px-6 pt-36 pb-24 overflow-hidden">
      {/* Glow effects */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full blur-[120px] opacity-10"
        style={{ background: "var(--brand-primary)" }}
      />
      <div
        className="pointer-events-none absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px] opacity-10"
        style={{ background: "var(--brand-accent)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            <span>{isLiveMode ? "Now available" : "Now in early access"}</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <GradientText>{landing.headline}</GradientText>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
            {landing.subheadline}
          </p>

          {!waitlistMode || isLiveMode ? (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
                }}
              >
                Try it Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium transition-all hover:bg-white/5"
              >
                View Pricing
              </a>
            </div>
          ) : null}
        </div>

        {/* Right: form or feature highlights */}
        <div className="flex justify-center">
          {waitlistMode && !isLiveMode ? (
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
              <h3 className="text-xl font-semibold mb-2">Get early access</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Be among the first to try {config.name}.
              </p>
              <WaitlistForm />
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              {landing.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <BrandIconBox size="sm">
                      <Icon className="h-4 w-4 text-brand-primary" />
                    </BrandIconBox>
                    <div>
                      <h4 className="text-sm font-semibold">{step.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MinimalHero() {
  const { landing } = config;
  const waitlistMode = config.flags?.waitlistMode ?? true;
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-28 text-center overflow-hidden">
      {/* Single centered glow */}
      <div
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full blur-[140px] opacity-10"
        style={{
          background: `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`,
        }}
      />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <GradientText>{landing.headline}</GradientText>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {landing.subheadline}
        </p>

        {waitlistMode && !isLiveMode ? <WaitlistForm /> : <LiveCtaButtons />}
      </div>
    </section>
  );
}

/* ─── Main page ─── */

export default function LandingPage() {
  const layout = (config as Record<string, unknown>).layout as string || "centered";

  return (
    <div className="min-h-screen bg-brand-surface text-white">
      <NavBar />

      {/* Hero variant */}
      {layout === "split" && <SplitHero />}
      {layout === "minimal" && <MinimalHero />}
      {layout !== "split" && layout !== "minimal" && <CenteredHero />}

      {/* Pain stats — hidden in minimal layout */}
      {layout !== "minimal" && <PainStatsSection />}

      {/* How it works — always shown */}
      <HowItWorksSection />

      {/* Pain points — hidden in minimal layout */}
      {layout !== "minimal" && <PainPointsSection />}

      {/* Pricing */}
      <PricingSection />

      {/* Final CTA */}
      <FinalCtaSection />

      {/* Footer */}
      <FooterBar />
    </div>
  );
}
