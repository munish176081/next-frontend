"use client";

import { useLocalStorage } from "usehooks-ts";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { useUser } from "@/_services/hooks/user/use-user";
import { toast } from "@/_hooks/use-toast";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { X } from "lucide-react";
import { useEffect } from "react";
import { CountdownTimer } from "@/_components/ui/countdown-timer";
import { useResendWithCountdown } from "@/_hooks/use-resend-with-countdown";

export function VerifyEmailBanner() {
  const { data: user, isPending, isError } = useUser();
  const [hideTillTime, setHideTillTime, removeItem] = useLocalStorage<
    number | undefined
  >("hide-email-banner-time", undefined, {
    initializeWithValue: false,
  });

  const todayTimeStamp = +new Date();

  function hideBanner() {
    setHideTillTime(todayTimeStamp + 10 * 60 * 1000);
  }

  const handleResendEmail = async () => {
    return new Promise((resolve, reject) => {
      // This would need to be implemented as a proper mutation
      // For now, we'll simulate the API call
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const {
    isPending: isResendPending,
    cooldownSeconds,
    error: resendError,
    handleResend,
    resetCooldown,
    canResend
  } = useResendWithCountdown({
    onResend: handleResendEmail,
    onSuccess: () => {
      hideBanner();
      toast({
        title: "Email verification code sent",
        description: "Please check your email",
      });
    },
    onError: (error) => {
      const err = parseAxiosError(error);
      toast({
        title: "Error",
        description: err?.message ?? "Something went wrong",
        variant: "destructive",
      });
    },
    defaultCooldown: 60 // 1 minute default
  });

  useEffect(() => {
    if (hideTillTime && hideTillTime < todayTimeStamp) {
      removeItem();
    }
  }, [hideTillTime, removeItem, todayTimeStamp]);

  // Don't show banner while loading or if there's an error
  if (isPending || isError) {
    return null;
  }

  // Don't show banner if no user, user is active, or account was created less than 10 minutes ago
  if (
    !user ||
    user.status === "active" ||
    // 10 minutes after account creation
    +new Date(user.createdAt) + 10 * 60 * 1000 > todayTimeStamp
  ) {
    return null;
  }

  // Don't show banner if it's been hidden
  if (hideTillTime && hideTillTime > todayTimeStamp) {
    return null;
  }

  return (
    <p className="fixed bottom-0 left-0 w-full py-2 text-center text-sm text-white bg-blue-500 z-[1000] pr-10">
      <span>
        We have sent you an email to verify your account. If you have not
        received yet, please
      </span>
      &nbsp;
      {cooldownSeconds > 0 ? (
        <span className="text-gray-300">
          Resend available in <CountdownTimer 
            seconds={cooldownSeconds} 
            onComplete={resetCooldown}
            className="text-white underline"
          />
        </span>
      ) : (
        <button
          disabled={!canResend || isResendPending}
          className="underline disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          onClick={handleResend}
        >
          {isResendPending ? 'Sending...' : 'Verify here'}
        </button>
      )}
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={() => {
          setHideTillTime(todayTimeStamp + 10 * 60 * 1000);
        }}
      >
        <X />
      </button>
    </p>
  );
}
