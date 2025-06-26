"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Input } from "@/_components/ui/form-fields";
import { FormStepper } from "@/_components/ui";
import { FileUploader } from "@/_components/common/file-uploader";
import { ImagePreview } from "@/_components/common/image-preview";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { useEffect } from "react";
import { isEmptyObj } from "@/_utils/common";
import { getImagesSchema, videoUrlSchema } from "@/_config/validate-schema";
import AdvancedRadio from "@/_components/ui/form-fields/advanced-radiobox";
import Textarea from "@/_components/ui/form-fields/textarea";
import { DatePicker } from "@/_components/ui/date-picker";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_SERVICES_PRICE = 100_000_000;

export const otherServicesDetailsSchema = z.object({
  title: z.string({ message: "Please enter title" }).min(1, {
    message: "Please enter title",
  }),
  serviceDescription: z.string({ message: "Please enter description" }).min(1, {
    message: "Please enter description",
  }),
  serviceType: z.enum(["grooming", "training", "boarding"], {
    message: "Please select service type",
  }),
  ankcNumber: z.string({ message: "Please enter ANKC number" }).min(1, {
    message: "Please enter ANKC number",
  }),
  serviceFee: z.coerce
    .number()
    .min(1, { message: "Please enter your service fee" })
    .max(MAX_SERVICES_PRICE, {
      message: "Please enter your service fee",
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
    minImages: 1,
  }),
  videoUrls: z.array(videoUrlSchema).optional().default([]),
});

export type OtherServicesDetailsType = z.infer<
  typeof otherServicesDetailsSchema
>;

export const OtherServicesDetailsForm = () => {
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
  } = useForm<OtherServicesDetailsType>({
    defaultValues: {
      title: (formData as OtherServicesDetailsType).title,
      serviceType: (formData as OtherServicesDetailsType).serviceType,
      serviceDescription: (formData as OtherServicesDetailsType)
        .serviceDescription,
      serviceFee: (formData as OtherServicesDetailsType).serviceFee,
      availibilityDate: (formData as OtherServicesDetailsType).availibilityDate,
      ankcNumber: (formData as OtherServicesDetailsType).ankcNumber,
      images: (formData as OtherServicesDetailsType).images,
      videoUrls: (formData as OtherServicesDetailsType).videoUrls,
    },
    mode: "onChange",
    resolver: zodResolver(otherServicesDetailsSchema),
  });

  const values = watch();

  console.log(values);

  function handleFormSubmit(data: OtherServicesDetailsType) {
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

      <label className="block mb-4">
        <span className="block text-sm font-bold mb-1.5">Service Type</span>
        <div className="flex items-center space-x-3">
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="grooming"
            {...register("serviceType")}
          >
            <p>Grooming</p>
          </AdvancedRadio>
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="training"
            {...register("serviceType")}
          >
            <p>Training</p>
          </AdvancedRadio>
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="boarding"
            {...register("serviceType")}
          >
            <p>Boarding</p>
          </AdvancedRadio>
        </div>
      </label>

      {errors.serviceType?.message && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.serviceType?.message}
        />
      )}

      <Textarea
        label="Service Description"
        labelClassName="font-bold"
        className="block w-full mb-4"
        textareaClassName="w-full h-20"
        error={errors?.serviceDescription?.message}
        {...register("serviceDescription")}
      />

      <div className="flex space-x-3 mb-4">
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

        <Input
          type="text"
          label="ANKC / State Breeder Registration Number"
          className="flex-1"
          error={errors?.ankcNumber?.message}
          required
          {...register("ankcNumber")}
        />
      </div>

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Input
          type="number"
          label="Service Fee"
          className="flex-1"
          error={errors?.serviceFee?.message}
          required
          {...register("serviceFee")}
        />
      </div>

      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload service images"
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
              label="Enter service video URLs (comma separated)"
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
