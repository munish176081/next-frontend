import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { useMultiStepFormContext } from "@/(pages)/create-listing/_context/multi-step-form-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, Input } from "@/_components/ui/form-fields";
import { Button, Divider, FormStepper } from "@/_components/ui";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import clsx from "clsx";
import { Text } from "@/_components/ui/typegraphy";
import { ConfirmationModal } from "@/_components/ui/modals/confirmation-modal";
import { useBoolean } from "usehooks-ts";
import { hasEmptyOrAllUndefinedValues, isEmptyObj } from "@/_utils/common";
import { FileUploader } from "@/_components/common/file-uploader";
import { ImagePreview } from "@/_components/common/image-preview";

const MAX_PUPPIES_PRICE = 100_000_000;
const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const puppyDetailsSchema = z.object({
  puppies: z
    .array(
      z.object({
        name: z
          .string({ message: "Please enter puppy name" })
          .min(1, { message: "Please enter puppy name" }),
        description: z
          .string({ message: "Please enter puppy description" })
          .max(1000, { message: "Description is too long" }),
        price: z.coerce
          .number({ message: "Please enter price" })
          .min(1, { message: "Please enter minimum $1 price" })
          .max(MAX_PUPPIES_PRICE, { message: "Price is too high" }),
        gender: z.enum(["male", "female"], {
          message: "Please select puppy gender",
        }),
        images: z
          .array(
            z
              .any()
              .refine((file) => {
                return file?.size <= MAX_FILE_SIZE;
              }, `Max image size is 1MB.`)
              .refine(
                (file) => file?.type?.includes("image"),
                "Only image files are supported."
              )
          )
          .min(1, { message: "At least one image is required!" })
          .max(10, {
            message: "Maximum of 10 images are allowed",
          }),
      })
    )
    .min(1, { message: "At least one puppy is required!" }),
});

export type PuppyDetailsStepType = z.infer<typeof puppyDetailsSchema>;

export const PuppyDetails = () => {
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
    reset,
    setValue,
    formState: { errors },
  } = useForm<PuppyDetailsStepType>({
    defaultValues: {
      puppies: (formData as PuppyDetailsStepType).puppies,
    },
    mode: "onChange",
    resolver: zodResolver(puppyDetailsSchema),
  });
  const [selectedPuppyIdx, setSelectedPuppyIdx] = useState(0);

  const values = watch();

  function handleFormSubmit(data: PuppyDetailsStepType) {
    goToNextStep(data);
  }

  const onCopySelectedPuppyValuesToAllOther = (currentPuppyIdx: number) => {
    if (currentPuppyIdx !== selectedPuppyIdx) {
      return;
    }

    const details = values.puppies[selectedPuppyIdx];

    if (hasEmptyOrAllUndefinedValues(details)) {
      return;
    }

    const newPuppies = Array.from({
      length: (formData.numberOfPuppies as number) ?? 1,
    }).map(() => ({ ...details }));

    reset({ puppies: newPuppies });
  };

  const onCopyValuesFromOtherPuppyToSelected = (copyPuppyIdx: number) => {
    if (copyPuppyIdx === selectedPuppyIdx || copyPuppyIdx < 0) {
      return;
    }

    const updatedPuppies = values.puppies;

    const toCopyPuppy = values.puppies[copyPuppyIdx];

    if (hasEmptyOrAllUndefinedValues(toCopyPuppy)) {
      return;
    }

    updatedPuppies[selectedPuppyIdx] = toCopyPuppy;

    reset({ puppies: updatedPuppies });
  };

  useEffect(() => {
    // if there are errors in the form, show the puppy form with the error
    if (errors.puppies?.length && errors.puppies.length > 0) {
      if (errors.puppies[selectedPuppyIdx]) {
        return;
      }

      for (let i = 0; i < errors.puppies.length; i++) {
        if (errors.puppies[i]) {
          setSelectedPuppyIdx(i);
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  useEffect(() => {
    if (
      values.puppies &&
      values.puppies.length > (formData.numberOfPuppies as number)
    ) {
      const newPuppies = values.puppies.slice(
        0,
        formData.numberOfPuppies as number
      );

      setValue("puppies", newPuppies);
    }
  }, [formData.numberOfPuppies, values.puppies, setValue]);

  useEffect(() => {
    if (!isEmptyObj(values)) {
      appendFormData(values);
    }
  }, [values, appendFormData]);

  return (
    <>
      <form
        className="pt-10 pb-40"
        noValidate
        onSubmit={handleSubmit((d) => handleFormSubmit(d))}
      >
        <label className="block mb-4 flex-1">
          <span className="block text-base font-bold leading-7">
            Select puppy
          </span>

          <Select
            value={selectedPuppyIdx.toString()}
            onValueChange={(value) => setSelectedPuppyIdx(+value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select puppy" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({
                length: (formData.numberOfPuppies as number) ?? 1,
              }).map((_, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  Puppy {idx + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <Divider className="mt-6" />

        <PuppyDetailsActions
          selectedPuppyIdx={selectedPuppyIdx}
          numberOfPuppies={formData.numberOfPuppies as number}
          onCopySelectedPuppyValuesToAllOther={
            onCopySelectedPuppyValuesToAllOther
          }
          onCopyValuesFromOtherPuppyToSelected={
            onCopyValuesFromOtherPuppyToSelected
          }
          onNextPuppy={() => {
            if (selectedPuppyIdx < (formData.numberOfPuppies as number) - 1) {
              setSelectedPuppyIdx(selectedPuppyIdx + 1);
            }
          }}
          onPreviousPuppy={() => {
            if (selectedPuppyIdx > 0) {
              setSelectedPuppyIdx(selectedPuppyIdx - 1);
            }
          }}
        />

        <Divider className="mb-6" />

        {Array.from({
          length: (formData.numberOfPuppies as number) ?? 1,
        }).map((_, idx) => (
          <div
            className={clsx(selectedPuppyIdx === idx ? "block" : "hidden")}
            key={idx}
          >
            <Input
              type="text"
              label="Puppy name"
              className="mb-4"
              size="lg"
              required
              {...register(`puppies.${idx}.name`)}
              error={errors?.puppies?.[idx]?.name?.message}
            />

            <Input
              type="text"
              label="Puppy description (max 1000 characters)"
              className="mb-4"
              size="lg"
              required
              {...register(`puppies.${idx}.description`)}
              error={errors?.puppies?.[idx]?.description?.message}
            />

            <Input
              type="number"
              label="Puppy price"
              size="lg"
              className="mb-4"
              required
              {...register(`puppies.${idx}.price`)}
              error={errors?.puppies?.[idx]?.price?.message}
            />

            <Controller
              name={`puppies.${idx}.gender`}
              control={control}
              render={({ field }) => (
                <label className="block mb-4">
                  <span className="block text-base font-bold leading-7 mb-2">
                    Gender
                  </span>

                  <Select
                    {...field}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  {errors?.puppies?.[idx]?.gender?.message && (
                    <FieldError
                      size="lg"
                      error={errors?.puppies?.[idx]?.gender?.message}
                    />
                  )}
                </label>
              )}
            />

            <Controller
              name={`puppies.${idx}.images`}
              control={control}
              render={({ field }) => (
                <>
                  <FileUploader
                    label="Upload puppy images"
                    accept="image/*"
                    multiple
                    onChange={(files) => {
                      field.onChange([
                        ...(field.value ?? []),
                        ...Array.from(files),
                      ]);
                    }}
                  />

                  {field.value && (
                    <ImagePreview
                      images={field.value.map((image, imageIdx) => ({
                        url:
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : "",
                        error: errors?.puppies?.[idx]?.images?.[imageIdx]
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

            {errors?.puppies?.[idx]?.images && (
              <FieldError
                size="lg"
                error={errors?.puppies?.[idx]?.images?.message}
              />
            )}
          </div>
        ))}

        <FormStepper
          currentStepIdx={stepIdx}
          totalSteps={totalSteps}
          goToPreviousStep={goToPreviousStep}
        />
      </form>
    </>
  );
};

function PuppyDetailsActions({
  selectedPuppyIdx,
  numberOfPuppies,
  onCopySelectedPuppyValuesToAllOther,
  onCopyValuesFromOtherPuppyToSelected,
  onNextPuppy,
  onPreviousPuppy,
}: {
  selectedPuppyIdx: number;
  numberOfPuppies: number;
  onCopySelectedPuppyValuesToAllOther: (currentPuppyIdx: number) => void;
  onCopyValuesFromOtherPuppyToSelected: (puppyIdx: number) => void;
  onNextPuppy: () => void;
  onPreviousPuppy: () => void;
}) {
  const { value: isOpenCopyToAll, setValue: setIsOpenCopyToAll } =
    useBoolean(false);

  const {
    value: isOpenCopyToCurrent,
    setValue: setIsOpenCopyToCurrent,
    setFalse: onCloseCopyToCurrent,
  } = useBoolean(false);

  const [copyPuppyIdx, setCopyPuppyIdx] = useState(-1);

  return (
    <div className="flex items-center justify-between space-x-3 my-4">
      <div className="flex items-center">
        <button
          className="px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedPuppyIdx === 0}
          onClick={onPreviousPuppy}
          type="button"
        >
          <ChevronLeft />
        </button>

        <Text>Selected puppy: {selectedPuppyIdx + 1}</Text>

        <button
          className="px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedPuppyIdx === numberOfPuppies - 1}
          onClick={onNextPuppy}
          type="button"
        >
          <ChevronRight />
        </button>
      </div>

      <ConfirmationModal
        title="Are you sure?"
        description={`This action will replace all other pupies values with currenct selected puppy ${
          selectedPuppyIdx + 1
        }.`}
        onConfirm={() => onCopySelectedPuppyValuesToAllOther(selectedPuppyIdx)}
        isOpenDialog={isOpenCopyToAll}
        setIsOpenDialog={setIsOpenCopyToAll}
      />

      <Dialog open={isOpenCopyToCurrent} onOpenChange={setIsOpenCopyToCurrent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>

          <div>
            This action will copy below puppy data to current puppy{" "}
            {selectedPuppyIdx + 1} data
          </div>

          <label className="block mb-4 flex-1">
            <span className="block text-base font-bold leading-7">
              Select puppy
            </span>

            <Select
              value={copyPuppyIdx.toString()}
              onValueChange={(value) => setCopyPuppyIdx(+value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select puppy" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({
                  length: (numberOfPuppies as number) ?? 1,
                })
                  .map((_, puppyIdx) =>
                    puppyIdx === selectedPuppyIdx ? null : (
                      <SelectItem key={puppyIdx} value={puppyIdx.toString()}>
                        Puppy {puppyIdx + 1}
                      </SelectItem>
                    )
                  )
                  .filter(Boolean)}
              </SelectContent>
            </Select>
          </label>

          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onCloseCopyToCurrent}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                if (copyPuppyIdx < 0) return;

                onCopyValuesFromOtherPuppyToSelected(copyPuppyIdx);
                onCloseCopyToCurrent();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center space-x-2">
            <span>Actions</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpenCopyToAll(true);
              }}
            >
              Copy current puppy values to all other puppies
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpenCopyToCurrent(true);
              }}
            >
              Copy values from other puppy
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
