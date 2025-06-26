"use client";

import clsx from "clsx";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
  hideAtStep?: number;
}

export function ProgressBar({
  step,
  totalSteps,
  hideAtStep,
}: ProgressBarProps) {
  return (
    <div
      className={clsx(
        "w-full bg-gray-lighter",
        step === hideAtStep && "hidden"
      )}
    >
      <span
        className="block h-[3px] bg-gray-dark transition-all duration-200"
        style={{ width: `${(100 / totalSteps) * step}%` }}
      ></span>
    </div>
  );
}
