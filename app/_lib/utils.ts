import { UnknownRecord } from "@/_types/global";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function objectToFormData(
  obj: UnknownRecord,
  form = new FormData(),
  namespace = ""
) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      const formKey = namespace ? `${namespace}[${property}]` : property;
      const data = obj[property];

      if (data === undefined) {
        continue;
      }

      if (data instanceof Date) {
        form.append(formKey, data.toISOString());
      } else if (
        typeof data === "object" &&
        !(data instanceof Date) &&
        !(data instanceof File) &&
        !(data instanceof Blob)
      ) {
        objectToFormData(data as UnknownRecord, form, formKey); // Recursively process nested objects
      } else {
        form.append(formKey, data as string);
      }
    }
  }
  return form;
}
