import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button, ProgressBar } from "@/_components/ui";

interface FormStepperProps {
  currentStepIdx: number;
  totalSteps: number;
  goToNextStep?: () => void;
  goToPreviousStep: () => void;
}

export function FormStepper({
  currentStepIdx,
  totalSteps,
  goToNextStep,
  goToPreviousStep,
}: FormStepperProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 w-full bg-white">
      <ProgressBar step={currentStepIdx} totalSteps={totalSteps} />
      <div className="container-fluid flex items-center justify-between py-3 lg:py-4">
        <Button
          type="button"
          variant="ghost"
          className="text-sm !font-bold capitalize focus:!ring-0 lg:text-base disabled:bg-transparent"
          onClick={() => {
            if (currentStepIdx > 0) {
              goToPreviousStep();
            }
          }}
          disabled={currentStepIdx === 0}
        >
          <ChevronLeftIcon className="mr-2 h-auto w-4" />
          Back
        </Button>

        {currentStepIdx !== totalSteps - 1 && (
          <Button
            type="submit"
            className="text-sm !font-bold capitalize focus:!ring-0 lg:text-base"
            onClick={() => {
              if (goToNextStep && currentStepIdx < totalSteps - 1) {
                goToNextStep();
              }
            }}
            disabled={currentStepIdx === totalSteps - 1}
          >
            Next <ChevronRightIcon className="ml-2 h-auto w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
