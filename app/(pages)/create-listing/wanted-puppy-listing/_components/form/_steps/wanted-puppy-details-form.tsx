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
import {
  getImagesSchema,
  nullableNumber,
  videoUrlSchema,
} from "@/_config/validate-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import AdvancedRadio from "@/_components/ui/form-fields/advanced-radiobox";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_WANTED_PUPPY_PRICE = 100_000_000;

export const wantedPuppyDetailsSchema = z.object({
  title: z.string({ message: "Please enter title" }).min(1, {
    message: "Please enter title",
  }),
  breed: z
    .string({ message: "Please select breed" })
    .min(1, { message: "Please select breed" }),
  isHealthCeritificateRequired: z.enum(["required", "optional"], {
    message: "Please select health certificate preference",
  }),
  isAnkcNumberRequired: z.enum(["required", "optional"], {
    message: "Please select ANKC number preference",
  }),
  budget: z.coerce
    .number()
    .min(1, { message: "Please enter your budget" })
    .max(MAX_WANTED_PUPPY_PRICE, {
      message: "Please enter your budget",
    }),
  minAge: nullableNumber,
  maxAge: nullableNumber,
  genderPreference: z.enum(["male", "female"], {
    message: "Please select gender preference",
  }),
  referenceImages: getImagesSchema({
    maxFileSize: MAX_FILE_SIZE,
    maxImages: 10,
    minImages: 1,
  }),
  referenceVideoUrls: z.array(videoUrlSchema).optional().default([]),
});

export type WantedPuppyDetailsType = z.infer<typeof wantedPuppyDetailsSchema>;

export const WantedPuppyDetailsForm = () => {
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
  } = useForm<WantedPuppyDetailsType>({
    defaultValues: {
      title: (formData as WantedPuppyDetailsType).title,
      breed: (formData as WantedPuppyDetailsType).breed,
      isHealthCeritificateRequired: (formData as WantedPuppyDetailsType)
        .isHealthCeritificateRequired,
      isAnkcNumberRequired: (formData as WantedPuppyDetailsType)
        .isAnkcNumberRequired,
      budget: (formData as WantedPuppyDetailsType).budget,
      minAge: (formData as WantedPuppyDetailsType).minAge,
      maxAge: (formData as WantedPuppyDetailsType).maxAge,
      genderPreference: (formData as WantedPuppyDetailsType).genderPreference,
      referenceImages: (formData as WantedPuppyDetailsType).referenceImages,
      referenceVideoUrls: (formData as WantedPuppyDetailsType)
        .referenceVideoUrls,
    },
    mode: "onChange",
    resolver: zodResolver(wantedPuppyDetailsSchema),
  });

  const values = watch();

  console.log(values);

  function handleFormSubmit(data: WantedPuppyDetailsType) {
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
                label="Desired breed"
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
        <div className="flex-1">
          <Controller
            name="genderPreference"
            control={control}
            render={({ field }) => (
              <label className="block flex-1">
                <span className="block text-sm font-bold mb-1.5">
                  Gender Preference
                </span>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 sm:h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="h-20">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            )}
          />

          {errors.genderPreference?.message && (
            <FieldError
              className="mb-4"
              size="lg"
              error={errors?.genderPreference?.message}
            />
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold mb-2">Age Range</h4>

        <div className="flex space-x-3">
          <Input
            type="number"
            label="Min Age"
            className="flex-1"
            error={errors?.minAge?.message}
            required
            {...register("minAge")}
          />

          <Input
            type="number"
            label="Max Age"
            className="flex-1"
            error={errors?.maxAge?.message}
            required
            {...register("maxAge")}
          />
        </div>
      </div>

      <label className="block mb-4 flex-1">
        <span className="block text-sm font-bold mb-1.5">
          Health Certificate Preference
        </span>
        <div className="flex items-center space-x-3">
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="required"
            {...register("isHealthCeritificateRequired")}
          >
            <p>Required</p>
          </AdvancedRadio>
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="optional"
            {...register("isHealthCeritificateRequired")}
          >
            <p>Optional</p>
          </AdvancedRadio>
        </div>
      </label>

      {errors.isHealthCeritificateRequired?.message && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.isHealthCeritificateRequired?.message}
        />
      )}

      <label className="block mb-4 flex-1">
        <span className="block text-sm font-bold mb-1.5">
          ANKC / State Breeder Registration Number Requirement
        </span>
        <div className="flex items-center space-x-3">
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="required"
            {...register("isAnkcNumberRequired")}
          >
            <p>Required</p>
          </AdvancedRadio>
          <AdvancedRadio
            labelClassName="flex-1"
            className="card-gradient cursor-pointer rounded-lg border border-gray-lighter py-4 text-center lg:rounded-xl xl:p-6 xl:text-left"
            inputClassName="[&:checked:enabled~span]:ring-1 [&:checked:enabled~span]:ring-gray-lighter [&:checked:enabled~span]:border [&:checked:enabled~span]:border-gray-dark"
            value="optional"
            {...register("isAnkcNumberRequired")}
          >
            <p>Optional</p>
          </AdvancedRadio>
        </div>
      </label>

      {errors.isAnkcNumberRequired?.message && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.isAnkcNumberRequired?.message}
        />
      )}

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Input
          type="number"
          label="Budget"
          className="flex-1"
          error={errors?.budget?.message}
          required
          {...register("budget")}
        />
      </div>

      <Controller
        name="referenceImages"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload reference wanted puppy images"
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
                  error: errors?.referenceImages?.[imageIdx]?.message as
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

      {errors?.referenceImages && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.referenceImages?.message}
        />
      )}

      <Controller
        name="referenceVideoUrls"
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="text"
              label="Enter reference wanted puppy video URLs (comma separated)"
              className="flex-1 mb-4"
              error={errors?.referenceVideoUrls?.message}
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

      {errors?.referenceVideoUrls?.length &&
        errors?.referenceVideoUrls?.length > 0 && (
          <FieldError
            className="mb-4"
            size="lg"
            error={
              errors?.referenceVideoUrls?.find?.((e) => Boolean(e?.message))
                ?.message
            }
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
