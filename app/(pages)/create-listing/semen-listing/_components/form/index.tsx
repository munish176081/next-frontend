"use client";

import { Heading, Text } from "@/_components/ui/typegraphy";
import {
  MultiStepFormProvider,
  useMultiStepFormContext,
} from "@/(pages)/create-listing/_context/multi-step-form-context";
import { useIsClient } from "usehooks-ts";
import { UnknownRecord } from "@/_types/global";
import { localStorageKeys } from "@/_config/constants";
import {
  SemenDetailsForm,
  semenDetailsSchema,
} from "./_steps/semen-details-form";
import FinalPayment from "./_steps/final-payment";
import {
  contactDetailsSchema,
  ContactInformationForm,
} from "@/(pages)/create-listing/_form/contact-information";

const formSteps = [
  {
    title: "Semen Listing",
    description: "Create a new semen listing",
    form: <SemenDetailsForm />,
    validationSchema: semenDetailsSchema,
  },
  {
    title: "Contact Information",
    description: "",
    form: <ContactInformationForm />,
    validationSchema: contactDetailsSchema,
  },
  {
    title: "Checkout",
    description: "",
    form: <FinalPayment />,
  },
];

const SemenListingForm = () => {
  const { stepIdx } = useMultiStepFormContext();

  const step = formSteps[stepIdx] ?? {};

  return (
    <div className="w-full max-w-5xl mx-auto">
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

const SemenListingFormWrapper = () => {
  const isClient = useIsClient();

  if (!isClient) return null;

  const formData = localStorage.getItem(
    localStorageKeys.SEMEN_LISTING_FORM_DATA
  );

  const initialFormData = formData ? JSON.parse(formData) : {};

  const setFormData = (data: UnknownRecord) => {
    localStorage.setItem(
      localStorageKeys.SEMEN_LISTING_FORM_DATA,
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
      <SemenListingForm />
    </MultiStepFormProvider>
  );
};

export { SemenListingFormWrapper as SemenListingForm };
