import { z } from "zod";
import { useForm } from "react-hook-form";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/_components/ui/form-fields";
import { FormStepper } from "@/_components/ui";
import { Combobox } from "@/_components/ui/combobox";
import { useEffect } from "react";
import { DOG_BREEDS_OPTIONS } from "@/_config/data";
import { isEmptyObj } from "@/_utils/common";

const MAX_PUPPIES_COUNT = 20;

export const basicInformationSchema = z.object({
  age: z.coerce
    .number()
    .min(1, { message: "Please enter age" })
    .max(2600 /* 50 years */, {
      message: "Please enter valid age in weeks",
    }),
  breed: z
    .string({ message: "Please select breed" })
    .min(1, { message: "Please select breed" }),
  numberOfPuppies: z.coerce
    .number()
    .int({ message: "Please enter valid number of puppies" })
    .min(1, { message: "Please enter number of puppies" })
    .max(20, {
      message: `Number of puppies cannot be more than ${MAX_PUPPIES_COUNT}`,
    }),
});

export type BasicInformationStepType = z.infer<typeof basicInformationSchema>;

export const BasicInformationStep = () => {
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
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<BasicInformationStepType>({
    defaultValues: {
      age: (formData as BasicInformationStepType).age,
      breed: (formData as BasicInformationStepType).breed,
      numberOfPuppies: (formData as BasicInformationStepType).numberOfPuppies,
    },
    mode: "onChange",
    resolver: zodResolver(basicInformationSchema),
  });

  const values = watch();
  const { breed, numberOfPuppies } = values;

  function handleFormSubmit(data: BasicInformationStepType) {
    goToNextStep(data);
  }

  useEffect(() => {
    if (formData.listingType === "individual") {
      if (numberOfPuppies > 1) {
        setValue("numberOfPuppies", 1);
      }

      appendFormData({
        numberOfPuppies: 1,
        ...(Boolean(formData.puppies) &&
          (formData.puppies as unknown[]).length > 1 && {
            puppies: [(formData.puppies as unknown[])[0]],
          }),
      });
    }
  }, [
    formData.listingType,
    formData.puppies,
    numberOfPuppies,
    setValue,
    appendFormData,
  ]);

  useEffect(() => {
    if (!isEmptyObj(values)) {
      appendFormData(values);
    }
  }, [values, appendFormData]);

  return (
    <form
      className="mt-10"
      noValidate
      onSubmit={handleSubmit((d) => handleFormSubmit(d))}
    >
      <Input
        type="number"
        label="Age in weeks"
        className="mb-4"
        error={errors?.age?.message}
        required
        {...register("age")}
      />

      <Combobox
        label="Select breed"
        value={breed}
        setValue={(value) => setValue("breed", value)}
        options={DOG_BREEDS_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        btnClassName="w-full active:!scale-100"
        popoverClassName="w-[--radix-popover-trigger-width] "
        error={errors?.breed?.message}
      />

      {formData.listingType === "litter" ? (
        <Input
          type="number"
          label="Number of puppies in the litter"
          className="my-4"
          error={errors?.numberOfPuppies?.message}
          required
          {...register("numberOfPuppies")}
        />
      ) : (
        <input type="hidden" value={1} {...register("numberOfPuppies")} />
      )}

      <FormStepper
        currentStepIdx={stepIdx}
        totalSteps={totalSteps}
        goToPreviousStep={goToPreviousStep}
      />
    </form>
  );
};
