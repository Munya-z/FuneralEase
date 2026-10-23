"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { subscriptions as subscriptionsApi } from "@/lib/api";
import { getToken, getHouseholdId } from "@/lib/auth";
import { Text, Button } from "@/partials";
;

type State = "polling" | "success" | "timeout" | "error";

const POLL_INTERVAL_MS = 2500;
const POLL_MAX_ATTEMPTS = 12;

function PaymentCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [state, setState] = useState<State>("polling");
  const [tier, setTier] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const attempts = useRef(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) {
      setState("error");
      setMessage("Please sign in again to confirm your payment.");
      return;
    }

    const markSuccess = (nextTier: string) => {
      setTier(nextTier);
      setState("success");
    };

    const verifyThenPoll = async () => {
      // 1) Prefer direct Paystack verify (works without webhook)
      if (reference) {
        try {
          const verified = await subscriptionsApi.verify(token, householdId, reference);
          if (verified.tier && verified.tier !== "Free") {
            markSuccess(verified.tier);
            return;
          }
        } catch {
          // Fall through to polling — webhook may still land
        }
      }

      // 2) Poll subscription until tier changes or timeout
      const poll = async () => {
        try {
          const sub = await subscriptionsApi.get(token, householdId);
          if (sub.tier !== "Free") {
            markSuccess(sub.tier);
            return;
          }

          attempts.current += 1;
          if (attempts.current >= POLL_MAX_ATTEMPTS) {
            setState("timeout");
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        } catch {
          setState("error");
          setMessage("We couldn't verify your payment status.");
        }
      };

      poll();
    };

    verifyThenPoll();
  }, [reference]);

  if (state === "polling") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center">
          <svg className="animate-spin text-dusk-ink/40" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
          </svg>
        </div>
        <Text as="h2" variant="heading_small">Confirming payment…</Text>
        <Text superFaded className=" leading-relaxed">
          We&apos;re confirming your Paystack payment. This usually takes a few seconds.
        </Text>
        {reference && (
          <Text variant="body_sec" superFaded>Ref: {reference}</Text>
        )}
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-sage">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <Text as="h2" variant="heading_small">Payment confirmed!</Text>
        <Text faded className="leading-relaxed">
          Your plan has been upgraded to{" "}
          <span className="font-semibold text-dusk-ink">{tier}</span>.
          All new features are available immediately.
        </Text>
        <Button
          onClick={() => router.push("/home")}
          className="w-full "
        >
          Go to home
        </Button>
      </div>
    );
  }

  if (state === "timeout") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-candlewick/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-candlewick">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <Text as="h2" variant="heading_sub" >Still processing…</Text >
        <Text faded >
          Your payment may still be settling. Refresh this page, or check your plan under Account in a minute.
        </Text >
        {reference && (
          <Text variant="body_small_sec" superFaded>Reference: {reference}</Text >
        )}
        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Try again
        </Button>
        <Button
          variant="sec"
          type="button"
          onClick={() => router.push("/more")}
          className="w-full "
        >
          View my account
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-ember/10 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ember">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <Text as="h2" variant="heading_small">Something went wrong</Text>
      <Text className="font-sans text-sm text-dusk-ink/60 leading-relaxed">
        {message || "We couldn't verify your payment status. If you were charged, refresh this page or check Account shortly."}
      </Text>
      <Button
        type="button"
        onClick={() => window.location.reload()}

      >
        Try again
      </Button>
      <Button
        variant="sec"
        type="button"
        onClick={() => router.push("/more")}
      >
        View my account
      </Button>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center">
            <svg className="animate-spin text-dusk-ink/40" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
            </svg>
          </div>
          <Text as="h2" className="heading_small">Confirming payment…</Text>
        </div>
      }
    >
      <PaymentCompleteContent />
    </Suspense>
  );
}
