"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Input } from "@/_components/ui/form-fields";
import { FormStepper } from "@/_components/ui";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { useEffect } from "react";
import { isEmptyObj } from "@/_utils/common";
import PhoneNumber from "@/_components/ui/form-fields/phone-number";
import { locationSchema } from "@/_config/validate-schema";
import { SearchLocationInput } from "@/_components/common/search-location-input";

export const contactDetailsSchema = z.object({
  contactDetails: z.object({
    name: z.string({ message: "Please enter your name" }).min(1, {
      message: "Please enter your name",
    }),
    phoneNumber: z
      .string({ message: "Please enter your phone number" })
      .min(7, {
        message: "Please enter valid phone number",
      })
      .regex(
        /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        { message: "Invalid phone number format." }
      ),
    location: locationSchema,
    email: z
      .string({ message: "Please enter your email" })
      .email({ message: "Please enter valid email" }),
    additionalNotes: z
      .string()
      .max(300, { message: "max 300 characters are allowed" })
      .optional(),
  }),
});

export type ContactDetailsType = z.infer<typeof contactDetailsSchema>;

export const ContactInformationForm = () => {
  const {
    stepIdx,
    totalSteps,
    formData,
    goToNextStep,
    goToPreviousStep,
    appendFormData,
  } = useMultiStepFormContext();

  const contactDetails = (formData as ContactDetailsType).contactDetails ?? {};

  const {
    handleSubmit,
    watch,
    register,
    control,
    formState: {
      errors: { contactDetails: errors = {} },
    },
  } = useForm<ContactDetailsType>({
    defaultValues: {
      contactDetails,
    },
    mode: "onChange",
    resolver: zodResolver(contactDetailsSchema),
  });

  const values = watch();

  function handleFormSubmit(data: ContactDetailsType) {
    goToNextStep(data);
  }

  useEffect(() => {
    if (!isEmptyObj(values)) {
      appendFormData(values);
    }
  }, [values, appendFormData]);

  return (
    <form
      className="pt-10 pb-28"
      noValidate
      onSubmit={handleSubmit((d) => handleFormSubmit(d))}
    >
      <div className="mb-4 flex space-x-4">
        <Input
          type="text"
          label="Name"
          className="flex-1"
          error={errors?.name?.message}
          required
          {...register("contactDetails.name")}
        />
        <Controller
          name="contactDetails.phoneNumber"
          control={control}
          render={({ field: { onChange, value } }) => (
            <PhoneNumber
              country="au"
              label="Phone Number"
              onChange={onChange}
              value={value}
              error={errors?.phoneNumber?.message}
              inputClassName="!pl-12 sm:!pl-14"
              buttonClassName="step-form-phone-input"
              className="relative z-20 flex-1"
              inputProps={{ required: true }}
            />
          )}
        />
      </div>

      <div className="mb-4 flex space-x-4">
        <Input
          type="email"
          label="Email"
          className="flex-1"
          error={errors?.email?.message}
          required
          {...register("contactDetails.email")}
        />

        <Controller
          name="contactDetails.location"
          control={control}
          render={({ field }) => (
            <SearchLocationInput
              locationInputAddress={field.value?.address}
              onChangeSearchInput={(value) => {
                field.onChange({
                  address: value,
                });
              }}
              onChangePlace={(place) => {
                if (!place) return;

                field.onChange({
                  address: place.formatted_address!,
                  ...(place.geometry?.location?.toJSON() ?? {}),
                });
              }}
              error={
                errors.location?.message ||
                errors?.location?.address?.message ||
                errors?.location?.lat?.message ||
                errors?.location?.lng?.message
              }
            />
          )}
        />
      </div>

      <label>
        <span className="mb-2 block font-bold text-sm">Additional Notes</span>
        <textarea
          className="border w-full mb-4 p-2 h-40"
          required
          {...register("contactDetails.additionalNotes")}
        />
      </label>

      {errors?.additionalNotes && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.additionalNotes?.message}
        />
      )}

      <FormStepper
        currentStepIdx={stepIdx}
        totalSteps={totalSteps}
        goToPreviousStep={goToPreviousStep}
      />
    </form>
  );
};
