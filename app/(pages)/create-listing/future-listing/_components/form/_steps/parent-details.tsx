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
import { DatePicker } from "@/_components/ui/date-picker";
import { getImagesSchema } from "@/_config/validate-schema";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const parentDetailsSchema = z.object({
  parentDetails: z.object({
    name: z.string({ message: "Please enter parent name" }).min(1, {
      message: "Please enter parent name",
    }),
    dateOfBirth: z.coerce
      .date({ message: "Please enter parent date of birth" })
      .refine(
        (date) => {
          const today = new Date();
          return date <= today; // Ensure the date is not in the future
        },
        {
          message: "Please enter parent date of birth",
        }
      ),
    healthCertificatesText: z
      .string({
        message: "Please enter parent health certificates",
      })
      .optional(),
    healthCertificatesImages: getImagesSchema({
      maxFileSize: MAX_FILE_SIZE,
      maxImages: 3,
      minImages: 0,
    })
      .optional()
      .default([]),
    ankcNumber: z.string({ message: "Please enter ANKC number" }).min(1, {
      message: "Please enter ANKC number",
    }),
  }),
});

export type ParentDetailsType = z.infer<typeof parentDetailsSchema>;

export const ParentDetails = () => {
  const {
    stepIdx,
    totalSteps,
    formData,
    goToNextStep,
    goToPreviousStep,
    appendFormData,
  } = useMultiStepFormContext();

  const parentDetails = (formData as ParentDetailsType)?.parentDetails ?? {};

  const {
    handleSubmit,
    watch,
    register,
    control,
    formState: {
      errors: { parentDetails: errors = {} },
    },
  } = useForm<ParentDetailsType>({
    defaultValues: {
      parentDetails: {
        name: parentDetails.name,
        dateOfBirth: parentDetails.dateOfBirth,
        healthCertificatesText: parentDetails.healthCertificatesText,
        healthCertificatesImages: parentDetails.healthCertificatesImages,
        ankcNumber: parentDetails.ankcNumber,
      },
    },
    mode: "onChange",
    resolver: zodResolver(parentDetailsSchema),
  });

  const values = watch();

  function handleFormSubmit(data: ParentDetailsType) {
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
        label="Name"
        className="mb-4"
        error={errors?.name?.message}
        required
        {...register("parentDetails.name")}
      />

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-start justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Controller
          name="parentDetails.dateOfBirth"
          control={control}
          render={({ field }) => (
            <label className="flex-1">
              <span className="mb-2 block font-bold text-sm">
                Date of birth
              </span>

              <DatePicker
                mode="single"
                date={field.value}
                setDate={(value) => {
                  field.onChange(value);
                }}
                error={errors?.dateOfBirth?.message}
                disabled={{ after: new Date() }}
              />
            </label>
          )}
        />
      </div>

      <Input
        type="text"
        label="ANKC / State Breeder Registration Number"
        className="my-4"
        error={errors?.ankcNumber?.message}
        required
        {...register("parentDetails.ankcNumber")}
      />

      <Input
        type="text"
        label="Health certificate"
        className="mb-4"
        error={errors?.healthCertificatesText?.message}
        required
        {...register("parentDetails.healthCertificatesText")}
      />

      <Controller
        name="parentDetails.healthCertificatesImages"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload health certificates"
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
                  error: errors?.healthCertificatesImages?.[imageIdx]
                    ?.message as string | undefined,
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

      {errors?.healthCertificatesImages && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.healthCertificatesImages?.message}
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
