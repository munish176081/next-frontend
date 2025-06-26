import { UnknownRecord } from "@/_types/global";
import clsx from "clsx";

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return clsx(classes);
};

export const parseNumber = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || isNaN(+value)) return undefined;

  if (typeof value === "number") return value;
  if (typeof value === "string") return +value;

  return undefined;
};

export const isValidNumber = (value: string | number | undefined | null) => {
  return (
    value !== null &&
    value !== undefined &&
    typeof +value === "number" &&
    !isNaN(+value)
  );
};

export const isEmptyObj = (obj: UnknownRecord) => {
  return Object.keys(obj).length === 0;
};

export const hasEmptyOrAllUndefinedValues = (obj: UnknownRecord) => {
  if (Object.keys(obj).length === 0) return true;
  return Object.values(obj).every((value) => !value);
};
