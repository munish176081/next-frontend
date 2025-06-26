import { z } from "zod";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { DogIcon } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "@/_components/ui/form-fields";
import clsx from "clsx";
import { FormStepper } from "@/_components/ui";
import { useEffect } from "react";
import { isEmptyObj } from "@/_utils/common";

export const selectListingTypeSchema = z.object({
  listingType: z.enum(["individual", "litter"], {
    message: "Please select listing type",
  }),
});

export type SelectListingTypeStepType = z.infer<typeof selectListingTypeSchema>;

export const SelectListingTypeStep = () => {
  const {
    stepIdx,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    formData,
    appendFormData,
  } = useMultiStepFormContext();
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SelectListingTypeStepType>({
    defaultValues: {
      listingType: (formData as SelectListingTypeStepType).listingType,
    },
    mode: "onChange",
    resolver: zodResolver(selectListingTypeSchema),
  });

  const values = watch();
  const listingType = values.listingType;

  function handleFormSubmit(data: SelectListingTypeStepType) {
    goToNextStep(data);
  }

  useEffect(() => {
    if (!isEmptyObj(values)) {
      appendFormData(values);
    }
  }, [values, appendFormData]);

  return (
    <form noValidate onSubmit={handleSubmit((d) => handleFormSubmit(d))}>
      <button
        type="button"
        onClick={() => {
          setValue("listingType", "individual");
        }}
        className={clsx(
          "w-full card-gradient mt-4 flex cursor-pointer items-center gap-5 rounded-md border p-6 font-bold text-gray-dark transition duration-200 hover:shadow-card md:p-8 lg:mt-6 lg:p-10 lg:text-xl lg:rounded-lg",
          listingType === "individual"
            ? "border-2 border-black"
            : "border-gray-lighter"
        )}
      >
        <DogIcon />
        Individual Puppy Listings
      </button>
      <button
        type="button"
        onClick={() => {
          setValue("listingType", "litter");
        }}
        className={clsx(
          "w-full card-gradient mt-4 flex cursor-pointer items-center gap-5 rounded-md border p-6 font-bold text-gray-dark transition duration-200 hover:shadow-card md:p-8 lg:mt-6 lg:p-10 lg:text-xl lg:rounded-lg",
          listingType === "litter"
            ? "border-2 border-black"
            : "border-gray-lighter"
        )}
      >
        <span className="flex">
          <DogIcon size={18} />
          <DogIcon size={18} />
          <DogIcon size={18} />
        </span>
        Full Litter Listing
      </button>

      {errors?.listingType?.message && (
        <FieldError
          className="mt-2 absolute"
          size="xl"
          error={errors?.listingType?.message}
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
