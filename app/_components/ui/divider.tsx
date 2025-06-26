import clsx from "clsx";

interface DividerProps {
  className?: string;
}

export const Divider = ({ className }: DividerProps) => {
  return <div className={clsx("h-px w-full bg-gray-lighter", className)} />;
};
