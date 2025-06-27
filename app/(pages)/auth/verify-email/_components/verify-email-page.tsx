"use client";

import { LogoIcon } from "@/_components/icons";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/_config/routes";
import { LoadingButton } from "@/_components/ui/loading-button";
import { useToast } from "@/_hooks/use-toast";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { useForgotPassword } from "@/_services/hooks/auth/use-forgot-password";
import { useVerifyOtp } from "@/_services/hooks/auth/use-verify-otp";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { useUser } from "@/_services/hooks/user/use-user";

export function VerifyEmailPage({ noshow = false }: { noshow?: boolean }) {
  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [email, setEmail] = useState<string>("");
  const [verificationType, setVerificationType] = useState<"email" | "password-reset">("email");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { mutate: requestVerifyEmailCode, isPending: isRequestPending } = useRequestEmailVerifyCode();
  const { mutate: forgotPassword, isPending: isForgotPasswordPending } = useForgotPassword();
  const { mutate: verifyEmailOTP, isPending: isEmailVerificationPending } = useVerifyOtp();
  const { data: user } = useUser();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');

    // Set email from URL param or from user data if available
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
      setUserLoggedIn(true);
    }

    if (typeParam === 'password-reset') {
      setVerificationType('password-reset');
    }
  }, [searchParams, user?.email]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newValues = [...values];
      newValues[index] = val;
      setValues(newValues);

      if (val && index < 4) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = values.join('');

    if (otp.length !== 5) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 5-digit code",
        variant: "destructive",
      });
      return;
    }

    try {
      verifyEmailOTP(
        { email, otp, userLoggedIn },
        {
          onSuccess: (data: any) => {
            if (verificationType === 'password-reset') {
              if (data?.userId) {
                router.replace(`/auth/reset-password?userId=${data?.userId}&token=${data?.token}`);
              } else {
                toast({
                  title: "Verification Failed",
                  description: "User ID not returned from server.",
                  variant: "destructive",
                });
              }
            } else {
              toast({
                title: "Email Verified",
                description: "Your email has been verified successfully!",
              });
              router.replace(Routes.auth.signIn);
            }
          },
          onError: (error: any) => {
            toast({
              title: "Verification Failed",
              description: error?.response?.data?.message || "Invalid or expired OTP",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = useCallback(async () => {
    try {
      if (verificationType === 'password-reset') {
        await forgotPassword(email);
      } else {
        await requestVerifyEmailCode();
      }
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      const err = parseAxiosError(error);
      toast({
        title: "Error",
        description: err?.message || "Failed to send code",
        variant: "destructive",
      });
    }
  }, [email, verificationType, forgotPassword, requestVerifyEmailCode, toast]);

  const getTitle = () => {
    return verificationType === 'password-reset' ? 'Password Reset' : 'Email Verification';
  };

  const getDescription = () => {
    return verificationType === 'password-reset'
      ? `We have sent a code to ${email}`
      : `We have sent a verification code to ${email}`;
  };

  const getButtonText = () => {
    return verificationType === 'password-reset' ? 'Continue' : 'Verify Email';
  };

  return (
    <section className="flex p-10 h-screen container items-center justify-center max-md:p-4 max-3xl:h-auto max-md:!h-screen">
      <div className={`w-full bg-white rounded-max p-8 flex ${noshow ? '' : 'pl-0'} h-full max-md:p-4 max-md:rounded-40 max-md:h-auto max-h-[900px] relative max-md:!h-full`}>
        {!noshow && (
          <button
            onClick={() => router.back()}
            className="absolute left-10 top-8 text-xs flex items-center bg-[#F3F3F3] p-0.5 rounded-full pr-2 gap-1 font-medium max-md:top-4 max-md:left-4"
          >
            <span className="flex size-6 bg-black rounded-full items-center justify-center">
              <img src="/images/vectors/arrowLeftWhite.svg" alt="Back arrow" />
            </span>
            Go Back
          </button>
        )}

        <div className={`${noshow ? 'w-full mx-auto max-w-md' : 'w-1/2'} h-full flex flex-col items-start text-xs px-10 h-full max-md:w-full max-md:px-0 my-auto max-md:pt-4`}>
          <div className="flex flex-col w-full my-auto">
            <span className="w-[70px] h-[70px] rounded-full bg-[#F3F3F3] flex items-center justify-center">
              <img src="/images/vectors/mail.svg" alt="Email icon" />
            </span>
            <span className="text-[33px] font-medium flex leading-normal mt-3">{getTitle()}</span>
            <span className="text-[#9C9C9C] text-sm mt-2">
              {getDescription()}
            </span>

            <div className="flex gap-4 mt-6">
              {values.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-28 max-md:h-16 max-md:rounded-lg max-md:text-3xl w-full border-2 ${value ? 'border-yellow-400' : 'border-[#D8DADC]'
                    } focus:border-CSecondary focus:outline-none rounded-[27px] text-center text-[43px]`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <LoadingButton
              onClick={handleVerifyOtp}
              loading={isEmailVerificationPending}
              className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
            >
              {getButtonText()}
            </LoadingButton>

            <span className="text-[#999999] text-lg font-medium flex items-center w-full justify-center text-center mt-4">
              I didn't receive a code&nbsp;
              <button
                onClick={handleResendOtp}
                disabled={verificationType === 'password-reset' ? isForgotPasswordPending : isRequestPending}
                className="text-black underline decoration-[3px] underline-offset-[3px] decoration-CSecondary disabled:opacity-50"
              >
                {(verificationType === 'password-reset' ? isForgotPasswordPending : isRequestPending) ? 'Sending...' : 'Resend'}
              </button>
            </span>
          </div>

          {!noshow && (
            <div className="flex h-7 gap-4 w-1/2 items-center justify-center absolute bottom-8 left-0 max-md:w-full max-md:bottom-4">
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-[#878484] rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            </div>
          )}
        </div>

        {!noshow && (
          <div className="w-1/2 min-h-full bg-[#F5F5F5] rounded-40 flex flex-col items-center py-8 min-h-[810px] max-md:hidden">
            <span className="w-44 flex"><LogoIcon width="100%" height="100%" /></span>
            <span className="text-[45px] mt-8 relative">
              <img alt="Paws decoration" className="absolute -left-14 -top-7 w-[68px] h-[63px]" src="/images/home/paws-indigo.svg" />
              <img alt="Paws decoration" className="absolute -right-10 -top-8 w-[51px] h-[48px]" src="/images/home/paws-green.svg" />
              Welcome to <strong className="font-semibold">Pups4Sale</strong>
            </span>
            <span className="text-lg mt-1">Join the <strong className="font-semibold">largest community</strong> of responsible <strong className="font-semibold">pet lovers.</strong></span>
            <img className="mt-6" src="/images/vectors/signUp.png" alt="Sign up illustration" />
            <div className="flex flex-col w-full items-start px-8 gap-4">
              <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#F0EBF4] rounded-full">Find your perfect furry companion</span>
              <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#E7F5F7] rounded-full ml-auto">Connect with trusted breeders & adopters</span>
              <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#FCF4DC] rounded-full">List puppies safely and easily</span>
            </div>
            <span className="text-5xl font-normal text-center mt-auto"><strong className="font-semibold">Start</strong>&nbsp;your&nbsp;<strong className="relative font-semibold">journey<img className="absolute right-0 -bottom-1 w-full" src="/images/vectors/line-8.svg" /></strong>&nbsp;today!</span>
          </div>
        )}
      </div>
    </section>
  );
} 