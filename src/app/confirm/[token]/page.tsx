"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const searchParams = useSearchParams();
  const confirm = useMutation(api.translations.confirm);
  const cancel = useMutation(api.translations.cancel);

  const [status, setStatus] = useState<"loading" | "confirmed" | "cancelled" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function run() {
      const { token } = await params;
      const id = searchParams.get("id") as Id<"translations"> | null;
      const action = searchParams.get("action");

      if (!id || !token) {
        setStatus("error");
        setErrorMsg("Invalid confirmation link");
        return;
      }

      try {
        if (action === "cancel") {
          await cancel({ id });
          setStatus("cancelled");
        } else {
          await confirm({ id, token });
          setStatus("confirmed");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Confirmation failed");
      }
    }

    run();
  }, [params, searchParams, confirm, cancel]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#060a13" }}>
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white">Processing...</h1>
            <p className="text-sm text-zinc-500 mt-2">Confirming your translation request.</p>
          </>
        )}

        {status === "confirmed" && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white">Translation Confirmed</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Your translation is now being processed. You&apos;ll receive a receipt email when complete.
            </p>
            <a
              href="/app/translate"
              className="inline-block mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >
              Back to Translate
            </a>
          </>
        )}

        {status === "cancelled" && (
          <>
            <XCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white">Translation Cancelled</h1>
            <p className="text-sm text-zinc-400 mt-2">Your translation request has been cancelled. No charges were made.</p>
            <a
              href="/app/translate"
              className="inline-block mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Back to Translate
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white">Error</h1>
            <p className="text-sm text-red-400 mt-2">{errorMsg}</p>
            <a
              href="/app/translate"
              className="inline-block mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Back to Translate
            </a>
          </>
        )}
      </div>
    </div>
  );
}
