"use client";

import { LogoIcon } from "@/_components/icons";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/_config/routes";
import { LoadingButton } from "@/_components/ui/loading-button";
import { useToast } from "@/_hooks/use-toast";
import { useRequestEmailVerifyCode } from "@/_services/hooks/auth/use-request-email-verify-code";
import { useRequestEmailVerifyByEmail } from "@/_services/hooks/auth/use-request-email-verify-by-email";
import { useForgotPassword } from "@/_services/hooks/auth/use-forgot-password";
import { useVerifyOtp } from "@/_services/hooks/auth/use-verify-otp";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { useUser } from "@/_services/hooks/user/use-user";
import { CountdownTimer } from "@/_components/ui/countdown-timer";
import { useResendWithCountdown } from "@/_hooks/use-resend-with-countdown";
import { useQueryClient } from "@tanstack/react-query";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import GoBackButton from "@/_components/common/go-back-button";

export function VerifyEmailPage({ noshow = false }: { noshow?: boolean }) {
  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [email, setEmail] = useState<string>("");
  const [verificationType, setVerificationType] = useState<"email" | "password-reset">("email");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { mutate: requestVerifyEmailCode, isPending: isRequestPending } = useRequestEmailVerifyCode();
  const { mutate: requestVerifyEmailByEmail, isPending: isRequestByEmailPending } = useRequestEmailVerifyByEmail();
  const { mutate: forgotPassword, isPending: isForgotPasswordPending } = useForgotPassword();
  const { mutate: verifyEmailOTP, isPending: isEmailVerificationPending } = useVerifyOtp();
  const { data: user } = useUser();
  const queryClient = useQueryClient();

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

  // Detect Apple devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const platform = window.navigator.platform.toLowerCase();
      
      // Check for iOS, iPadOS, macOS, or other Apple devices
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isMacOS = /macintosh|mac os x/.test(userAgent) || platform.includes('mac');
      const isSafari = /safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent);
      
      setIsAppleDevice(isIOS || isMacOS || isSafari);
    }
  }, []);

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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    // Extract only digits from pasted content
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 5);
    
    if (digits.length > 0) {
      const newValues = [...values];
      // Fill the inputs with pasted digits
      digits.forEach((digit, index) => {
        if (index < 5) {
          newValues[index] = digit;
        }
      });
      setValues(newValues);
      
      // Focus the last filled input or the verify button
      if (digits.length === 5) {
        const lastInput = document.getElementById(`otp-input-4`) as HTMLInputElement;
        if (lastInput) {
          lastInput.focus();
        }
      } else {
        const nextInput = document.getElementById(`otp-input-${digits.length}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
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
              // Registration flow - check if user was logged in automatically
              if (data?.user || data?.id || data?.email) {
                // User was logged in by backend, redirect to dashboard
                toast({
                  title: "Email Verified",
                  description: "Your email has been verified successfully!",
                });
                // Invalidate user query to refresh user data
                queryClient.invalidateQueries({ queryKey: ["current-user"] });
                router.replace("/dashboard");
              } else {
                // Fallback: redirect to sign in (shouldn't happen with new flow)
                toast({
                  title: "Email Verified",
                  description: "Your email has been verified successfully!",
                });
                router.replace(Routes.auth.signIn);
              }
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
    return new Promise((resolve, reject) => {
      if (verificationType === 'password-reset') {
        forgotPassword(email, {
          onSuccess: () => {
            toast({
              title: "Code Sent",
              description: "A new password reset code has been sent to your email",
            });
            resolve(true);
          },
          onError: (error) => {
            reject(error);
          },
        });
      } else {
        // Use different endpoint based on whether user is logged in
        if (userLoggedIn) {
          // User is logged in, use the protected endpoint
          requestVerifyEmailCode(undefined, {
            onSuccess: () => {
              toast({
                title: "Code Sent",
                description: "A new verification code has been sent to your email",
              });
              resolve(true);
            },
            onError: (error) => {
              reject(error);
            },
          });
        } else {
          // User is not logged in (registration flow), use the email-based endpoint
          if (!email) {
            reject(new Error('Email is required'));
            return;
          }
          requestVerifyEmailByEmail(email, {
            onSuccess: () => {
              toast({
                title: "Code Sent",
                description: "A new verification code has been sent to your email",
              });
              resolve(true);
            },
            onError: (error) => {
              reject(error);
            },
          });
        }
      }
    });
  }, [email, verificationType, userLoggedIn, forgotPassword, requestVerifyEmailCode, requestVerifyEmailByEmail, toast]);

  // Generate unique storage key based on email and verification type
  const storageKey = email 
    ? `resend-cooldown-${verificationType}-${email}` 
    : undefined;

  const {
    isPending: isResendPending,
    cooldownSeconds,
    error: resendError,
    handleResend,
    resetCooldown,
    canResend
  } = useResendWithCountdown({
    onResend: handleResendOtp,
    onSuccess: () => {
      // Success is handled in the individual handlers
    },
    onError: (error) => {
      const err = parseAxiosError(error);
      toast({
        title: "Error",
        description: err?.message || "Failed to send code",
        variant: "destructive",
      });
    },
    defaultCooldown: 60, // 1 minute default
    storageKey // Pass storage key for persistence
  });

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

  const handleOpenGmail = () => {
    // Try to open Gmail app first, fallback to web
    const gmailAppUrl = 'googlegmail://';
    const gmailWebUrl = 'https://mail.google.com';
    
    // Try app first, then fallback to web after a short delay
    window.location.href = gmailAppUrl;
    setTimeout(() => {
      window.open(gmailWebUrl, '_blank');
    }, 500);
  };

  const handleOpenAppleMail = () => {
    // Try to open Apple Mail app first, fallback to mailto
    const mailAppUrl = 'message://';
    const mailtoUrl = `mailto:${email}`;
    
    // Try app first, then fallback to mailto
    window.location.href = mailAppUrl;
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 500);
  };

  const handleOpenOutlook = () => {
    // Try to open Outlook app first, fallback to web
    const outlookAppUrl = 'ms-outlook://';
    const outlookWebUrl = 'https://outlook.live.com';
    
    // Try app first, then fallback to web after a short delay
    window.location.href = outlookAppUrl;
    setTimeout(() => {
      window.open(outlookWebUrl, '_blank');
    }, 500);
  };

  return (
    <section className="flex p-10 h-screen container items-center justify-center max-lg:p-4 max-3xl:h-auto max-md:!h-screen overflow-auto">
      <div className={`w-full rounded-max flex ${noshow ? '' : 'pl-0 bg-white  p-8 '} h-full max-lg:p-4 max-md:p-4 max-md:rounded-40  max-h-[900px] relative max-md:!h-full overflow-hidden`}>
       

        <div className={`${noshow ? 'w-full mx-auto max-w-[600px]' : 'w-1/2 max-lg:w-full px-10 max-lg:px-6 max-md:px-4'} h-full flex flex-col items-start text-xs max-md:pt-12 justify-center overflow-y-auto`}>
          {!noshow && (
            <div className=" left-10 top-8 max-lg:top-4 max-lg:left-4 max-md:top-4 max-md:left-4 z-10 mb-4">
              <GoBackButton />
            </div>
          )}
          <div className="flex flex-col w-full max-w-full">
            <span className="w-[70px] h-[70px] max-md:w-14 max-md:h-14 rounded-full bg-[#F3F3F3] flex items-center justify-center">
              <img src="/images/vectors/mail.svg" alt="Email icon" className="max-md:w-8 max-md:h-8" />
            </span>
            <span className="text-[33px] max-lg:text-2xl max-md:text-xl max-sm:text-lg font-medium flex leading-normal mt-3">{getTitle()}</span>
            <span className="text-[#9C9C9C] text-sm max-md:text-xs max-sm:text-[11px] mt-2 break-words pr-2">
              {getDescription()}
            </span>

            <div className="flex gap-4 max-lg:gap-3 max-md:gap-2 max-sm:gap-1.5 mt-6 max-md:mt-4 w-full">
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
                  onPaste={handlePaste}
                  className={`h-28 max-lg:h-20 max-md:h-16 max-sm:h-14 max-md:rounded-lg max-lg:text-4xl max-md:text-3xl max-sm:text-2xl w-full border-2 ${value ? 'border-yellow-400' : 'border-[#D8DADC]'
                    } focus:border-CSecondary focus:outline-none rounded-[27px] max-md:rounded-lg text-center text-[43px] max-lg:text-4xl max-md:text-3xl`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 max-md:gap-2 mt-6 max-md:mt-4 w-full">
              <button
                onClick={handleOpenGmail}
                className="flex items-center gap-3 max-md:gap-2 px-4 py-3 max-md:px-3 max-md:py-2 border border-[#D8DADC] rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 max-md:w-6 max-md:h-6">
                  <img src="/icons/gmail.png" alt="Gmail icon" className="w-8 h-8 max-md:w-6 max-md:h-6" />
                </div>
                <span className="text-base max-md:text-sm font-medium text-gray-900">Open Gmail</span>
              </button>

              {isAppleDevice && (
                <button
                  onClick={handleOpenAppleMail}
                  className="flex items-center gap-3 max-md:gap-2 px-4 py-3 max-md:px-3 max-md:py-2 border border-[#D8DADC] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 max-md:w-6 max-md:h-6">
                    <img src="/icons/apple.png" alt="Apple icon" className="w-8 h-8 max-md:w-6 max-md:h-6" />
                  </div>
                  <span className="text-base max-md:text-sm font-medium text-gray-900">Open Apple Mail</span>
                </button>
              )}

              <button
                onClick={handleOpenOutlook}
                className="flex items-center gap-3 max-md:gap-2 px-4 py-3 max-md:px-3 max-md:py-2 border border-[#D8DADC] rounded-lg hover:bg-gray-50 transition-colors"
              >
                 <img src="/icons/outlook.png" alt="Outlook icon" className="w-8 h-8 max-md:w-6 max-md:h-6" />
                <span className="text-base max-md:text-sm font-medium text-gray-900">Open Outlook</span>
              </button>
            </div>

            <LoadingButton
              onClick={handleVerifyOtp}
              loading={isEmailVerificationPending || isForgotPasswordPending}
              className="w-full h-16 max-lg:h-14 max-md:h-12 bg-black text-white text-lg max-md:text-base rounded-full mt-7 max-md:mt-4"
            >
              {getButtonText()}
            </LoadingButton>

            <span className="text-gray-500 text-lg max-md:text-sm font-medium flex items-center justify-center text-center mt-4 max-md:mt-3 space-x-1 flex-wrap">
            
            {cooldownSeconds >0 ? (
              <span className="text-gray-600 ml-1 max-md:text-xs">
                (Resend available in <CountdownTimer 
                  seconds={cooldownSeconds} 
                  onComplete={resetCooldown}
                  className="text-gray-800 font-semibold"
                />)
              </span>
            ) : (
              <span className="max-md:text-xs">
                I didn't receive a code
              <button
                onClick={handleResend}
                disabled={!canResend || isResendPending}
                className={`ml-1 text-gray-800 font-semibold underline decoration-2 underline-offset-2 hover:text-gray-900 transition-colors max-md:text-xs ${
                  (!canResend || isResendPending) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isResendPending ? 'Sending...' : 'Resend'}
              </button>
              </span>
            )}
          </span>
            
            {/* {resendError && (
              <span className="text-red-500 text-sm text-center mt-2">
                {resendError}
              </span>
            )} */}
             {!noshow && (
            <div className="flex h-7 gap-4 w-full max-lg:w-full items-center justify-center mt-4  bottom-8 max-lg:bottom-4 left-0 max-md:relative max-md:bottom-0 max-md:mt-6 max-md:mb-4">
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-[#878484] rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
              <span className="w-3.5 h-3.5 bg-black rounded-full"></span>
            </div>
          )}
          </div>

         
        </div>

        {!noshow && (
          <div className="w-1/2 max-lg:hidden min-h-full bg-[#F5F5F5] rounded-40 flex flex-col items-center py-8 min-h-[810px] overflow-hidden">
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