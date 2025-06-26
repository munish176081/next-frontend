"use client";

import { useLocalStorage } from "usehooks-ts";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { useUser } from "@/_services/hooks/user/use-user";
import { toast } from "@/_hooks/use-toast";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { X } from "lucide-react";
import { useEffect } from "react";

export function VerifyEmailBanner() {
  const { data: user, isPending, isError } = useUser();
  const { mutate: requestEmailVerifyCode, isPending: isRequestPending } =
    useRequestEmailVerifyCode();
  const [hideTillTime, setHideTillTime, removeItem] = useLocalStorage<
    number | undefined
  >("hide-email-banner-time", undefined, {
    initializeWithValue: false,
  });

  const todayTimeStamp = +new Date();

  function hideBanner() {
    setHideTillTime(todayTimeStamp + 10 * 60 * 1000);
  }

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
      <button
        disabled={isRequestPending}
        className="underline"
        type="submit"
        onClick={() => {
          requestEmailVerifyCode(undefined, {
            onSuccess() {
              hideBanner();
              toast({
                title: "Email verification code sent",
                description: "Please check your email",
              });
            },
            onError(error) {
              const err = parseAxiosError(error);

              toast({
                title: "Error",
                description: err?.message ?? "Something went wrong",
              });
            },
          });
        }}
      >
        Verify here
      </button>
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
