"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Input } from "@/_components/ui/form-fields";
import { Combobox, FormStepper } from "@/_components/ui";
import { DOG_BREEDS_OPTIONS } from "@/_config/data";
import { FileUploader } from "@/_components/common/file-uploader";
import { ImagePreview } from "@/_components/common/image-preview";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { useEffect } from "react";
import { isEmptyObj } from "@/_utils/common";
import { DatePicker } from "@/_components/ui/date-picker";
import { getImagesSchema, videoUrlSchema } from "@/_config/validate-schema";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_PUPPY_PRICE = 100_000_000;

export const futureDetailsSchema = z.object({
  title: z.string({ message: "Please enter title" }).min(1, {
    message: "Please enter title",
  }),
  breed: z
    .string({ message: "Please select breed" })
    .min(1, { message: "Please select breed" }),
  expectedDueDate: z.coerce
    .date({ message: "Please enter date of birth" })
    .refine(
      (date) => {
        const today = new Date();
        return date >= today; // Ensure the date is in the future
      },
      {
        message: "Date should not be in the past.",
      }
    ),
  reservationFee: z.coerce
    .number()
    .min(1, { message: "Please enter reservation fee" })
    .max(MAX_PUPPY_PRICE, {
      message: "Please enter valid reservation fee",
    }),
  pricePerPuppy: z.coerce
    .number()
    .min(1, { message: "Please enter fee" })
    .max(MAX_PUPPY_PRICE, {
      message: "Please enter valid future fee",
    }),
  expectedNumberOfPuppies: z.coerce
    .number({ message: "Please enter expected number of puppies" })
    .int({ message: "please enter valid number" })
    .min(1, {
      message: "Atleast 1 is required",
    }),
  availibilityDate: z.coerce
    .date({ message: "Please enter availibity date" })
    .refine(
      (date) => {
        const today = new Date();
        return date >= today; // Ensure the date is in the future
      },
      {
        message: "Date should be in the future.",
      }
    ),
  images: getImagesSchema({
    maxFileSize: MAX_FILE_SIZE,
    maxImages: 10,
    minImages: 0,
  })
    .optional()
    .default([]),
  videoUrls: z.array(videoUrlSchema).optional().default([]),
});

export type FutureDetailsType = z.infer<typeof futureDetailsSchema>;

export const FutureDetailsForm = () => {
  const {
    stepIdx,
    totalSteps,
    formData,
    goToNextStep,
    goToPreviousStep,
    appendFormData,
  } = useMultiStepFormContext();

  const {
    handleSubmit,
    watch,
    register,
    control,
    formState: { errors },
  } = useForm<FutureDetailsType>({
    defaultValues: {
      title: (formData as FutureDetailsType).title,
      breed: (formData as FutureDetailsType).breed,
      expectedDueDate: (formData as FutureDetailsType).expectedDueDate,
      pricePerPuppy: (formData as FutureDetailsType).pricePerPuppy,
      reservationFee: (formData as FutureDetailsType).reservationFee,
      availibilityDate: (formData as FutureDetailsType).availibilityDate,
      expectedNumberOfPuppies: (formData as FutureDetailsType)
        .expectedNumberOfPuppies,
      images: (formData as FutureDetailsType).images,
      videoUrls: (formData as FutureDetailsType).videoUrls,
    },
    mode: "onChange",
    resolver: zodResolver(futureDetailsSchema),
  });

  const values = watch();

  function handleFormSubmit(data: FutureDetailsType) {
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
      <Input
        type="text"
        label="Listing title"
        className="mb-4"
        error={errors?.title?.message}
        required
        {...register("title")}
      />

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-start justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <Controller
            name="breed"
            control={control}
            render={({ field }) => (
              <Combobox
                label="Select breed"
                value={field.value}
                setValue={(value) => field.onChange(value)}
                options={DOG_BREEDS_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                btnClassName="w-full active:!scale-100"
                popoverClassName="w-[--radix-popover-trigger-width] "
                error={errors?.breed?.message}
              />
            )}
          />
        </div>

        <Controller
          name="expectedDueDate"
          control={control}
          render={({ field }) => (
            <label className="flex-1">
              <span className="mb-2 block font-bold text-sm">
                Expected Due Date
              </span>

              <DatePicker
                mode="single"
                date={field.value}
                setDate={(value) => {
                  field.onChange(value);
                }}
                error={errors?.expectedDueDate?.message}
                disabled={{ before: new Date() }}
              />
            </label>
          )}
        />
      </div>

      <Input
        type="number"
        label="Reservation Fee"
        error={errors?.reservationFee?.message}
        className="mb-4"
        required
        {...register("reservationFee")}
      />

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-center justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Input
          type="number"
          label="Expected Number of puppies"
          className="flex-1"
          error={errors?.expectedNumberOfPuppies?.message}
          required
          {...register("expectedNumberOfPuppies")}
        />

        <Input
          type="number"
          label="Price per puppy"
          className="flex-1"
          error={errors?.pricePerPuppy?.message}
          required
          {...register("pricePerPuppy")}
        />
      </div>

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-center justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Controller
          name="availibilityDate"
          control={control}
          render={({ field }) => (
            <label className="flex-1">
              <span className="block font-bold text-sm mb-1.5">
                Availibility date
              </span>

              <DatePicker
                mode="single"
                date={field.value}
                setDate={(value) => {
                  field.onChange(value);
                }}
                error={errors?.availibilityDate?.message}
                disabled={{ before: new Date() }}
              />
            </label>
          )}
        />
      </div>

      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload previous Litters images"
              accept="image/*"
              multiple
              onChange={(files) => {
                field.onChange([...(field.value ?? []), ...Array.from(files)]);
              }}
            />

            {field.value && (
              <ImagePreview
                className="mb-4"
                images={field.value.map((image, imageIdx) => ({
                  url: image instanceof File ? URL.createObjectURL(image) : "",
                  error: errors?.images?.[imageIdx]?.message as
                    | string
                    | undefined,
                }))}
                onDelete={(idx) => {
                  field.value.splice(idx, 1);
                  field.onChange(field.value);
                }}
              />
            )}
          </>
        )}
      />

      {errors?.images && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.images?.message}
        />
      )}

      <Controller
        name="videoUrls"
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="text"
              label="Enter previous litter video URLs (comma separated)"
              className="flex-1 mb-4"
              error={errors?.videoUrls?.message}
              required
              value={field.value?.join(",") ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value ? value.split(",") : []);
              }}
            />
          </>
        )}
      />

      {errors?.videoUrls?.length && errors?.videoUrls?.length > 0 && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.videoUrls?.find?.((e) => Boolean(e?.message))?.message}
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
