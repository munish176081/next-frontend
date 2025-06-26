"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Input } from "@/_components/ui/form-fields";
import { Combobox, FormStepper } from "@/_components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { DOG_BREEDS_OPTIONS } from "@/_config/data";
import { FileUploader } from "@/_components/common/file-uploader";
import { ImagePreview } from "@/_components/common/image-preview";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { useEffect } from "react";
import { isEmptyObj } from "@/_utils/common";
import { DatePicker } from "@/_components/ui/date-picker";
import { getImagesSchema, videoUrlSchema } from "@/_config/validate-schema";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_SEMEN_PRICE = 100_000_000;
const SEMEN_TYPES = ["frozen", "chilled", "fresh"] as const;

export const semenDetailsSchema = z.object({
  title: z.string({ message: "Please enter title" }).min(1, {
    message: "Please enter title",
  }),
  breed: z
    .string({ message: "Please select breed" })
    .min(1, { message: "Please select breed" }),
  semenType: z.enum(SEMEN_TYPES, {
    message: "Please select semen type",
  }),
  dateOfBirth: z.coerce.date({ message: "Please enter date of birth" }).refine(
    (date) => {
      const today = new Date();
      return date <= today; // Ensure the date is not in the future
    },
    {
      message: "Date should not be in the future.",
    }
  ),
  healthCertificatesText: z.string({
    message: "Please enter health certificates",
  }),
  healthCertificatesImages: getImagesSchema({
    maxFileSize: MAX_FILE_SIZE,
    maxImages: 3,
    minImages: 0,
  }),
  studFee: z.coerce
    .number()
    .min(1, { message: "Please enter fee" })
    .max(MAX_SEMEN_PRICE, {
      message: "Please enter valid stud fee",
    }),
  dogName: z.string({ message: "Please enter dog name" }).min(1, {
    message: "Please enter dog name",
  }),
  ankcNumber: z.string({ message: "Please enter ANKC number" }).min(1, {
    message: "Please enter ANKC number",
  }),
  collectionDate: z.coerce
    .date({ message: "Please enter collection date" })
    .refine(
      (date) => {
        const today = new Date();
        return date >= today; // Ensure the date is in the future
      },
      {
        message: "Date should be in the future.",
      }
    ),
  shippingAvailibility: z.coerce
    .date({ message: "Please enter shipping availibility date" })
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
  provenLittersImages: getImagesSchema({
    maxFileSize: MAX_FILE_SIZE,
    maxImages: 10,
    minImages: 1,
  }),
  provenLittersVideoUrls: z.array(videoUrlSchema).optional(),
  videoUrls: z.array(videoUrlSchema),
});

export type SemenDetailsType = z.infer<typeof semenDetailsSchema>;

export const SemenDetailsForm = () => {
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
  } = useForm<SemenDetailsType>({
    defaultValues: {
      title: (formData as SemenDetailsType).title,
      breed: (formData as SemenDetailsType).breed,
      semenType: (formData as SemenDetailsType).semenType,
      dateOfBirth: (formData as SemenDetailsType).dateOfBirth,
      healthCertificatesText: (formData as SemenDetailsType)
        .healthCertificatesText,
      healthCertificatesImages: (formData as SemenDetailsType)
        .healthCertificatesImages,
      studFee: (formData as SemenDetailsType).studFee,
      collectionDate: (formData as SemenDetailsType).collectionDate,
      shippingAvailibility: (formData as SemenDetailsType).shippingAvailibility,
      dogName: (formData as SemenDetailsType).dogName,
      ankcNumber: (formData as SemenDetailsType).ankcNumber,
      images: (formData as SemenDetailsType).images,
      videoUrls: (formData as SemenDetailsType).videoUrls,
      provenLittersImages: (formData as SemenDetailsType).provenLittersImages,
      provenLittersVideoUrls: (formData as SemenDetailsType)
        .provenLittersVideoUrls,
    },
    mode: "onChange",
    resolver: zodResolver(semenDetailsSchema),
  });

  const values = watch();

  function handleFormSubmit(data: SemenDetailsType) {
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
          name="dateOfBirth"
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

      <Controller
        name="semenType"
        control={control}
        render={({ field }) => (
          <label>
            <span className="mb-2 block font-bold text-sm">Semen Type</span>

            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
            >
              <SelectTrigger className="mb-4 h-auto [&>span]:block [&_.select-box]:border-none text-start disabled:!opacity-100 capitalize">
                <SelectValue placeholder="Select semen type" />
              </SelectTrigger>
              <SelectContent>
                {SEMEN_TYPES.map((type) => (
                  <SelectItem
                    className="w-full flex-1 [&_span[id^='radix-']]:block [&_span[id^='radix-']]:w-full capitalize"
                    value={type}
                    key={type}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      />

      {errors?.semenType && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.semenType?.message}
        />
      )}

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-center justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Input
          type="text"
          label="Dog name"
          className="flex-1"
          error={errors?.dogName?.message}
          required
          {...register("dogName")}
        />

        <Input
          type="number"
          label="Stud Fee"
          className="flex-1"
          error={errors?.studFee?.message}
          required
          {...register("studFee")}
        />
      </div>

      <div className="mb-4 flex-col sm:flex-row space-x-0 flex sm:items-center justify-between sm:space-x-5 space-y-4 sm:space-y-0">
        <Controller
          name="collectionDate"
          control={control}
          render={({ field }) => (
            <label className="flex-1">
              <span className="mb-2 block font-bold text-sm">
                Collection date
              </span>

              <DatePicker
                mode="single"
                date={field.value}
                setDate={(value) => {
                  field.onChange(value);
                }}
                error={errors?.collectionDate?.message}
                disabled={{ before: new Date() }}
              />
            </label>
          )}
        />

        <Controller
          name="shippingAvailibility"
          control={control}
          render={({ field }) => (
            <label className="flex-1">
              <span className="mb-2 block font-bold text-sm">
                Shipping Availibility
              </span>

              <DatePicker
                mode="single"
                date={field.value}
                setDate={(value) => {
                  field.onChange(value);
                }}
                error={errors?.shippingAvailibility?.message}
                disabled={{ before: new Date() }}
              />
            </label>
          )}
        />
      </div>

      <Input
        type="text"
        label="ANKC / State Breeder Registration Number"
        className="mb-4"
        error={errors?.ankcNumber?.message}
        required
        {...register("ankcNumber")}
      />

      <Input
        type="text"
        label="Health certificate"
        className="mb-4"
        error={errors?.healthCertificatesText?.message}
        required
        {...register("healthCertificatesText")}
      />

      <Controller
        name="healthCertificatesImages"
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

      {errors?.healthCertificatesImages && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.healthCertificatesImages?.message}
        />
      )}

      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload semen images"
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
              label="Enter semen video URLs (comma separated)"
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

      <Controller
        name="provenLittersImages"
        control={control}
        render={({ field }) => (
          <>
            <FileUploader
              label="Upload proven litter images"
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
                  error: errors?.provenLittersImages?.[imageIdx]?.message as
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

      {errors?.provenLittersImages && (
        <FieldError
          className="mb-4"
          size="lg"
          error={errors?.provenLittersImages?.message}
        />
      )}

      <Controller
        name="provenLittersVideoUrls"
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="text"
              label="Enter proven litter video URLs (comma separated)"
              className="flex-1 mb-4"
              error={errors?.provenLittersVideoUrls?.message}
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

      {errors?.provenLittersVideoUrls?.length &&
        errors?.provenLittersVideoUrls?.length > 0 && (
          <FieldError
            className="mb-4"
            size="lg"
            error={
              errors?.provenLittersVideoUrls?.find?.((e) => Boolean(e?.message))
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
