"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CreditCard, ExternalLink } from "lucide-react";

const PLANS = [
  { name: "Free", price: "£0", period: "/mo", features: ["10,000 chars/mo", "5 voice min", "600 MB storage", "PDF export only"] },
  { name: "Pro", price: "£15", period: "/mo", features: ["500,000 chars/mo", "60 voice min", "7 GB storage", "All export formats"], highlighted: true },
  { name: "Team", price: "£49", period: "/mo", features: ["2,000,000 chars/mo", "300 voice min", "35 GB storage", "Batch exports"] },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited usage", "API access", "SSO/SCIM", "Dedicated support"] },
];

export default function BillingPage() {
  const user = useQuery(api.users.getCurrent);
  const subscription = useQuery(api.subscriptions.getCurrent);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Billing
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your subscription and billing.</p>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-200">Current Plan</h2>
        </div>
        <p className="text-2xl font-bold text-white capitalize">{user?.plan ?? "Free"}</p>
        {subscription && (
          <p className="text-xs text-zinc-500 mt-1">
            Status: <span className="text-zinc-300">{subscription.status}</span>
            {subscription.currentPeriodEnd && (
              <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
            )}
          </p>
        )}

        {user?.stripeCustomerId && (
          <a
            href={`https://billing.stripe.com/p/login/test`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Manage in Stripe <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 ${
              plan.highlighted
                ? "border-blue-500/30 ring-1 ring-blue-500/15"
                : "border-zinc-800/60"
            }`}
            style={plan.highlighted ? { background: "rgba(59,130,246,0.03)" } : { background: "rgba(24,24,27,0.3)" }}
          >
            <h3 className="text-sm font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-0.5 mb-4 mt-1">
              <span className="text-2xl font-bold text-white">{plan.price}</span>
              <span className="text-zinc-500 text-xs">{plan.period}</span>
            </div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full mt-5 py-2 rounded-lg text-xs font-medium transition-all ${
                user?.plan === plan.name.toLowerCase()
                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                  : plan.highlighted
                    ? "text-white hover:brightness-110"
                    : "border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200"
              }`}
              style={
                plan.highlighted && user?.plan !== plan.name.toLowerCase()
                  ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)" }
                  : {}
              }
              disabled={user?.plan === plan.name.toLowerCase()}
            >
              {user?.plan === plan.name.toLowerCase() ? "Current Plan" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
