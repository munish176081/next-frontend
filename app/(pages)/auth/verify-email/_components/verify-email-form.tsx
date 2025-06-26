"use client";

import { Button } from "@/_components/ui/button";
import { toast } from "@/_hooks/use-toast";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { useQueryClient } from "@tanstack/react-query";

export function VerifyEmailForm() {
  const queryClient = useQueryClient();
  const { mutate: requestEmailVerifyCode, isPending } =
    useRequestEmailVerifyCode();

  return (
    <div className="h-100 mx-auto my-auto w-full max-w-[600px] rounded-lg border border-gray-200 p-6 sm:p-12">
      <h2 className="mb-3 text-3xl font-bold uppercase leading-[48px] text-primary">
        Please verify your email
      </h2>
      <span>
        We have sent you an email to verify your account. If you have not
        received yet, please
      </span>{" "}
      <button
        disabled={isPending}
        className="underline"
        type="submit"
        onClick={() => {
          requestEmailVerifyCode(undefined, {
            onSuccess() {
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
        Resend email
      </button>
      <Button
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        }}
        className="!block mt-4"
      >
        Refresh
      </Button>
    </div>
  );
}
