"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { axios } from "@/_lib/axios";
import { LoadingButton } from "@/_components/ui/loading-button";
import { toast } from "@/_hooks/use-toast";
import { subscribeSchema, SubscribeFormType } from "@/_config/validate-schema";

// Handle form submission
export default function SubscribeBox() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscribeFormType>({
    resolver: zodResolver(subscribeSchema),
  });

  const onSubmit = async (data: SubscribeFormType) => {
    try {
      const response = await axios.post("/newsletter/subscribe", data);
    
      if (response.data.success) {
        toast({
          description: "Subscribed successfully 🎉",
          variant: "success",
        });
        reset();
      } else {
        toast({
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Error subscribing! Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="rounded-40 container max-md:w-auto max-md:mb-0 mb-10 py-8 overflow-hidden border border-black/20 bg-white flex flex-col relative justify-center max-md:py-4 max-md:mx-0">
      <div className="backdrop-blur-2xl bg-[#FAFAFA]/50 border border-black/20 rounded-3xl p-8 absolute max-md:static max-md:w-auto max-md:mx-4 max-md:p-4 max-md:gap-3 max-md:mb-4 top-4 z-20 m-auto right-4 flex flex-col gap-5 h-[calc(100%-32px)] w-[540px]">
        <span className="text-3xl max-md:text-[20px] max-md:leading-tight font-medium">
          Subscribe and get exclusive deals & offer
        </span>
        <span className="max-md:text-xs">
          Subscribe to our email & get updates right in your inbox
        </span>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Full Name"
            {...register("name")}
            className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12"
          />
          {errors.name && (
            <span className="text-red-500 text-sm px-2">
              {errors.name.message}
            </span>
          )}

          <input
            type="text"
            placeholder="Email"
            {...register("email")}
            className="text-base placeholder:text-[#4B4A4A] bg-transparent font-normal outline-none px-6 w-full h-[70px] rounded-full border border-black max-md:h-12"
          />
          {errors.email && (
            <span className="text-red-500 text-sm px-2">
              {errors.email.message}
            </span>
          )}

          <LoadingButton
            loading={isSubmitting}
            type="submit"
            className="w-full h-20 bg-black text-white text-[22px] rounded-full mt-7 max-md:h-12 max-md:text-base"
          >
            Subscribe
          </LoadingButton>
        </form>
      </div>
      <div className="max-md:h-[300px] w-full max-md:flex max-md:justify-center">
        <img
          className="h-full max-w-max"
          src="/images/cta-block/background.png"
        />
      </div>
    </section>
  );
}
