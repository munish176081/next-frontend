"use client";

import { Heading, Text } from "@/_components/ui/typegraphy";
import {
  SelectListingTypeStep,
  selectListingTypeSchema,
} from "./steps/select-listing-type";
import {
  MultiStepFormProvider,
  useMultiStepFormContext,
} from "@/(pages)/create-listing/_context/multi-step-form-context";
import {
  BasicInformationStep,
  basicInformationSchema,
} from "./steps/basic-information";
import { PuppyDetails, puppyDetailsSchema } from "./steps/puppy-details";
import FinalPayment from "./steps/final-payment";
import { useIsClient } from "usehooks-ts";
import { UnknownRecord } from "@/_types/global";
import { localStorageKeys } from "@/_config/constants";
import {
  contactDetailsSchema,
  ContactInformationForm,
} from "@/(pages)/create-listing/_form/contact-information";

const formSteps = [
  {
    title: "Create Puppy Listing",
    description: "Create a new puppy listing",
    form: <SelectListingTypeStep />,
    validationSchema: selectListingTypeSchema,
  },
  {
    title: "Basic Information",
    form: <BasicInformationStep />,
    validationSchema: basicInformationSchema,
  },
  {
    title: "Puppy Details",
    form: <PuppyDetails />,
    validationSchema: puppyDetailsSchema,
  },
  {
    title: "Contact Information",
    description: "",
    form: <ContactInformationForm />,
    validationSchema: contactDetailsSchema,
  },
  {
    title: "Checkout",
    description: "Only 1 step away from listing your puppy",
    form: <FinalPayment />,
  },
];

const PuppyListingForm = () => {
  const { stepIdx } = useMultiStepFormContext();

  const step = formSteps[stepIdx] ?? {};

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="container-fluid">
        <Heading>{step.title}</Heading>

        {step.description && (
          <Text className="text-base md:text-xl mt-4">{step.description}</Text>
        )}

        {step.form}
      </div>
    </div>
  );
};

const PuppyListingFormWrapper = () => {
  const isClient = useIsClient();

  if (!isClient) return null;

  const formData = localStorage.getItem(
    localStorageKeys.PUPPY_LISTING_FORM_DATA
  );

  const initialFormData = formData ? JSON.parse(formData) : {};

  const setFormData = (data: UnknownRecord) => {
    localStorage.setItem(
      localStorageKeys.PUPPY_LISTING_FORM_DATA,
      JSON.stringify(data)
    );
  };

  return (
    <MultiStepFormProvider
      totalSteps={formSteps.length}
      initialData={initialFormData}
      onChangeData={setFormData}
      validationSchemas={formSteps.map((step) => step.validationSchema)}
    >
      <PuppyListingForm />
    </MultiStepFormProvider>
  );
};

export { PuppyListingFormWrapper as PuppyListingForm };
