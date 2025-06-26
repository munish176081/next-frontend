import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UnknownRecord } from "@/_types/global";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isEmptyObj, isValidNumber, parseNumber } from "@/_utils/common";
import { ConfirmationModal } from "@/_components/ui/modals/uncontrolled-confirmation-modal";
import { ZodObject } from "zod";

type NextStepType = (data?: UnknownRecord) => void;
type PreviousStepType = (data?: UnknownRecord) => void;
type AppendFormDataType = (data: UnknownRecord) => void;
type ReplaceFormDataType = (data: UnknownRecord) => void;

interface MultiStepFormContextType {
  stepIdx: number;
  totalSteps: number;
  setStepIdx: (stepIdx: number) => void;
  goToNextStep: NextStepType;
  goToPreviousStep: PreviousStepType;
  formData: UnknownRecord;
  appendFormData: AppendFormDataType;
  replaceFormData: ReplaceFormDataType;
  getFormData: () => UnknownRecord;
}

const MultiStepFormContext = createContext<
  MultiStepFormContextType | undefined
>(undefined);

const getStepIdx = (routerStep: string | null, totalSteps: number) => {
  const parsedStep = parseNumber(routerStep);

  if (!isValidNumber(parsedStep)) return 0;

  const parsedIdx = (parsedStep as number) - 1;

  if (parsedIdx >= 0 && parsedIdx < totalSteps) return parsedIdx;

  return 0;
};

export const MultiStepFormProvider = ({
  children,
  totalSteps,
  initialData = {},
  onChangeData,
  validationSchemas = [],
}: {
  children: React.ReactNode;
  totalSteps: number;
  initialData?: UnknownRecord;
  onChangeData?: (data: UnknownRecord) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchemas?: (ZodObject<any, any> | undefined)[];
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const routerStep = searchParams.get("step");
  const parsedStepIdx = getStepIdx(routerStep, totalSteps);

  const [stepIdx, setStepIdx] = useState(parsedStepIdx);
  const formData = useRef<UnknownRecord>(initialData);
  const showStartOverModal = useRef(true);

  const isFirstStep = stepIdx === 0;
  const isLastStep = stepIdx === totalSteps - 1;

  const pushStepToUrl = (step: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", step.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const goToNextStep: NextStepType = (data) => {
    if (data) {
      appendFormData(data);
    }

    if (isLastStep) return;
    const newStepIdx = stepIdx + 1;
    setStepIdx(newStepIdx);

    pushStepToUrl(newStepIdx + 1);
  };

  const goToPreviousStep: PreviousStepType = (data) => {
    if (data) {
      appendFormData(data);
    }

    if (isFirstStep) return;
    const newStepIdx = stepIdx - 1;
    setStepIdx(newStepIdx);

    pushStepToUrl(newStepIdx + 1);
  };

  const appendFormData: AppendFormDataType = (data) => {
    formData.current = { ...formData.current, ...data };

    if (onChangeData) {
      onChangeData(formData.current);
    }
  };

  const replaceFormData: ReplaceFormDataType = (data) => {
    formData.current = data;

    if (onChangeData) {
      onChangeData(formData.current);
    }
  };

  const getFormData = () => {
    return formData.current;
  };

  // do not allow to move to next step if previous steps are not valid
  useEffect(() => {
    showStartOverModal.current = false;

    if (validationSchemas.length > 0 && stepIdx > 0) {
      for (let i = 0; i < stepIdx; i++) {
        const schema = validationSchemas[i];

        if (!schema) continue;

        const result = schema.safeParse(formData.current);

        if (!result.success) {
          setStepIdx(i);

          pushStepToUrl(i + 1);
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense>
      <MultiStepFormContext.Provider
        value={{
          stepIdx,
          totalSteps,
          formData: formData.current,
          setStepIdx,
          goToNextStep,
          goToPreviousStep,
          getFormData,
          appendFormData,
          replaceFormData,
        }}
      >
        {children}

        {!isEmptyObj(initialData) &&
          !isFirstStep &&
          showStartOverModal.current && (
            <ConfirmationModal
              title="There is already a listing in progress"
              description="You can continue from where you left off or start over"
              cancelButtonText="Start over"
              confirmButtonText="Continue"
              onCancel={() => {
                showStartOverModal.current = false;
                replaceFormData({});
                setStepIdx(0);
                pushStepToUrl(1);
              }}
              onConfirm={() => {
                showStartOverModal.current = false;
              }}
            />
          )}
      </MultiStepFormContext.Provider>
    </Suspense>
  );
};

export const useMultiStepFormContext = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepFormContext must be used within a MultiStepFormProvider"
    );
  }
  return context;
};
