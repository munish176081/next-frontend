"use client";

import { LoadingButton } from "@/_components/ui/loading-button";
import { CountdownTimer } from "@/_components/ui/countdown-timer";
import { toast } from "@/_hooks/use-toast";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { useQueryClient } from "@tanstack/react-query";
import { useResendWithCountdown } from "@/_hooks/use-resend-with-countdown";

export function VerifyEmailForm() {
  const queryClient = useQueryClient();
  const { mutate: requestEmailVerifyCode, isPending } =
    useRequestEmailVerifyCode();

  const handleResendEmail = async () => {
    return new Promise((resolve, reject) => {
      requestEmailVerifyCode(undefined, {
        onSuccess() {
          toast({
            title: "Email verification code sent",
            description: "Please check your email",
          });
          resolve(true);
        },
        onError(error) {
          reject(error);
        },
      });
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
      // Success is handled in the individual handler
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

  return (
    <div className="h-100 mx-auto my-auto w-full max-w-[600px] rounded-lg border border-gray-200 p-6 sm:p-12">
      <h2 className="mb-3 text-3xl font-bold uppercase leading-[48px] text-primary">
        Please verify your email
      </h2>
      <span>
        We have sent you an email to verify your account. If you have not
        received yet, please
      </span>{" "}
      {cooldownSeconds > 0 ? (
        <span className="text-gray-500">
          Resend available in <CountdownTimer 
            seconds={cooldownSeconds} 
            onComplete={resetCooldown}
            className="text-black underline"
          />
        </span>
      ) : (
        <button
          disabled={!canResend || isResendPending}
          className="underline disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          onClick={handleResend}
        >
          {isResendPending ? 'Sending...' : 'Resend email'}
        </button>
      )}
      
      {resendError && (
        <div className="text-red-500 text-sm mt-2">
          {resendError}
        </div>
      )}
      
      <LoadingButton
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        }}
        className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
      >
        Refresh
      </LoadingButton>
    </div>
  );
}
