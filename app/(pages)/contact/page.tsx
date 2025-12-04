"use client";

import { Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, PhoneInput } from "@/_components/ui/form-fields";
import { LoadingButton } from "@/_components/ui/loading-button";
import { toast } from "@/_hooks/use-toast";
import { useContact } from "@/_services/hooks/contact/use-contact";
import { parseAxiosError } from "@/_utils/parse-axios-error";
import { contactFormSchema, ContactFormType } from "@/_config/validate-schema";
import PhoneNumber from "@/_components/ui/form-fields/phone-number";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { useRef } from "react";
import SubscribeBox from "@/_components/SubscribeBox";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
function Contact() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
  });

  const { mutate: submitContact, isPending } = useContact();

  async function handleFormSubmit(data: ContactFormType) {
    const { recaptchaToken } = data;

    // Only require reCAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    await submitContact(data, {
      onSuccess: () => {
        reset();
        recaptchaRef.current?.reset();
        toast({
          title: "Success",
          description: "Your message has been sent successfully!",
        });
      },
      onError: (error: any) => {
        const err = parseAxiosError(error);
        toast({
          title: "Error",
          description: err?.message ?? "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <>
      <div className="container flex flex-col gap-16 pt-16 max-2xl:p-4 max-md:gap-4">
        <section className="flex gap-6 max-md:flex-col max-md:gap-4">
          <div className="flex w-7/12 max-md:w-full rounded-40 p-8 bg-white flex-col items-start max-md:p-4">
            <span className="text-5xl font-light max-md:text-[32px] max-md:leading-snug">
              <strong className="font-medium relative">
                Get in touch
                <img
                  className="absolute w-full max-w-60 max-md:-bottom-2"
                  src="/images/vectors/contactTypeLine.svg"
                />
              </strong>{" "}
              with <strong className="font-semibold">Pups4Sale</strong>
            </span>
            <span className="text-lg leading-normal mt-6 relative max-md:text-xs max-md:mt-2">
              Need <strong className="font-semibold">help</strong> with{" "}
              <strong className="font-semibold">buying, selling,</strong> or{" "}
              <strong className="font-semibold">listing</strong> a puppy?
              <br />
              Our <strong className="font-semibold">team</strong> is available{" "}
              <strong className="font-semibold">24/7</strong> to assist you.
              <img
                className="absolute -right-24 top-3 max-md:w-[35px] max-md:-top-[75px] max-md:-right-[15px]"
                src="/images/vectors/line-9.svg"
              />
            </span>
            <span className="text-[40px] font-medium mt-10 max-md:text-[28px] max-md:mt-4">
              Send Us a Message
            </span>

            <form
              noValidate
              onSubmit={handleSubmit((d) => handleFormSubmit(d))}
              className="w-full"
            >
              <div className="flex gap-6 w-full max-md:flex-col max-md:gap-0">
                <div className="flex flex-col w-full">
                  <Input
                    unstyled
                    type="text"
                    label="Your First Name"
                    labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
                    inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
                    error={errors?.firstName?.message}
                    required
                    placeholder="Enter your First Name"
                    {...register("firstName")}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Input
                    unstyled
                    type="text"
                    label="Your Last Name"
                    labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
                    inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
                    error={errors?.lastName?.message}
                    required
                    placeholder="Enter your Last Name"
                    {...register("lastName")}
                  />
                </div>
              </div>

              <Input
                unstyled
                type="email"
                label="Your Email"
                labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
                inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
                error={errors?.email?.message}
                required
                placeholder="Enter your Email"
                {...register("email")}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label="Phone Number"
                    unstyled
                    labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
                    inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors?.phone?.message}
                    required
                    placeholder="Enter your Phone Number"
                  />
                )}
              />
              <Input
                unstyled
                type="text"
                label="Your Subject"
                labelClassName="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm"
                inputClassName="text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12"
                error={errors?.subject?.message}
                placeholder="Enter your Subject"
                {...register("subject")}
              />

              <div className="flex flex-col w-full">
                <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
                  Your Message <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  placeholder="Enter your Message"
                  className={`text-base max-md:text-xs max-md:p-4 max-md:rounded-2xl placeholder:text-[#4B4A4A8C] font-normal outline-none p-6 w-full h-60 rounded-40 border ${
                    errors?.message ? "border-red-500" : "border-[#B5B5B5]"
                  }`}
                  {...register("message")}
                />
                {errors?.message && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </span>
                )}
              </div>
              {RECAPTCHA_SITE_KEY && (
                <div className="mt-4 mb-4">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => {
                      setValue("recaptchaToken", token || "", {
                        shouldValidate: true,
                      });
                    }}
                    onExpired={() => {
                      setValue("recaptchaToken", "", { shouldValidate: true });
                    }}
                    onError={() => {
                      setValue("recaptchaToken", "", { shouldValidate: true });
                    }}
                  />
                  {errors?.recaptchaToken && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.recaptchaToken.message}
                    </p>
                  )}
                </div>
              )}

              <LoadingButton
                loading={isPending}
                type="submit"
                className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base"
              >
                Send Message
              </LoadingButton>
            </form>
          </div>

          <div className="flex w-5/12 max-md:w-full flex-col gap-6">
            <div className="flex w-full rounded-40 bg-white flex-col items-start overflow-hidden min-h-max">
              <img src="/images/vectors/contact.png" />
            </div>
            <div className="flex w-full h-full rounded-40 bg-white flex-col items-start overflow-hidden px-16 justify-between pt-14 pb-8 relative max-md:gap-6 max-md:px-4 max-md:py-6">
              <img
                className="absolute left-0 top-0"
                src="/images/vectors/contactVector.png"
              />
              <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
                <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center">
                  <img src="/images/vectors/message.png" />
                </span>
                <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]">
                  <strong className="text-black font-medium">Email</strong>{" "}
                  <Link href="mailto:admin@pups4sale.com.au">
                    admin@pups4sale.com.au
                  </Link>
                </span>
              </div>
              <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
                <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center">
                  <img src="/images/vectors/phone.png" />
                </span>
                <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]">
                  <strong className="text-black font-medium">Phone</strong>{" "}
                  <Link href="tel:0425408058">0425408058</Link>
                </span>
              </div>
              <div className="flex gap-4 items-center max-md:flex-col max-md:text-center max-md:w-full max-md:gap-2">
                <span className="w-[70px] h-[70px] rounded-full bg-CPrimary/20 flex items-center justify-center">
                  <img src="/images/vectors/address.png" />
                </span>
                <span className="flex flex-col text-[#555555] text-[22px] max-md:text-[18px]">
                  <strong className="text-black font-medium">Address</strong>{" "}
                  5/337 Settlement Rd, Thomastown, VIC, 3074
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SubscribeBox />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Contact />
    </Suspense>
  );
}
