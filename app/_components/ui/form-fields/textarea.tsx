import clsx from "clsx";
import { forwardRef } from "react";
import { FieldHelperText, FieldError } from "@/_components/ui/form-fields";

const containerClasses = {
  base: "flex flex-col",
};

const labelClasses = {
  size: {
    sm: "text-xs mb-1",
    DEFAULT: "text-sm mb-1.5",
    lg: "text-sm mb-2",
    xl: "text-base mb-2",
  },
};

const textareaClasses = {
  base: "block w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-50 disabled:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 resize-none",
  error: "border-red-500 focus:ring-red-500 focus:border-red-500",
  size: {
    sm: "px-2.5 py-1 text-xs",
    DEFAULT: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base",
    xl: "px-5 py-3 text-base",
  },
  rounded: {
    none: "rounded-none",
    sm: "rounded-sm",
    DEFAULT: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  },
};

export interface TextareaProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  /** Set custom rows */
  rows?: number;
  /** Set custom cols */
  cols?: number;
  /** Set custom max length of character */
  maxLength?: number;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Default value in textarea */
  children?: React.ReactNode;
  /** The size of the component. `"sm"` is equivalent to the dense input styling. */
  size?: keyof typeof labelClasses.size;
  /** Set field label */
  label?: string;
  /** The rounded variants are: */
  rounded?: keyof typeof textareaClasses.rounded;
  /** Show error message using this prop */
  error?: string;
  /** Use labelClassName prop to do some addition style for the field label */
  labelClassName?: string;
  /** Add custom classes for the input filed extra style */
  textareaClassName?: string;
  /** This prop allows you to customize the helper message style */
  helperClassName?: string;
  /** This prop allows you to customize the error message style */
  errorClassName?: string;
  /** Add helper text. It could be string or a React component */
  helperText?: React.ReactNode;
}

/**
 * A basic widget for getting the user textarea. Here is the API documentation of the Textarea component.
 * And the rest of the props are the same as the original html textarea field.
 * You can use props like `disabled`, `placeholder`, `rows`, `cols`, `maxLength` etc.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "DEFAULT",
      rounded = "DEFAULT",
      label,
      error,
      className,
      labelClassName,
      textareaClassName,
      helperClassName,
      errorClassName,
      helperText,
      ...textareaProps
    },
    ref
  ) => {
    return (
      <div className={clsx(containerClasses.base, className)}>
        <label className="block">
          {label && (
            <span
              className={clsx("block font-bold", labelClasses.size[size], labelClassName)}
            >
              {label}
            </span>
          )}
          <textarea
            ref={ref}
            className={clsx(
              textareaClasses.base,
              textareaClasses.size[size],
              textareaClasses.rounded[rounded],
              error && textareaClasses.error,
              textareaClassName
            )}
            {...textareaProps}
          />
        </label>
        {!error && helperText && (
          <FieldHelperText size={size} className={helperClassName}>
            {helperText}
          </FieldHelperText>
        )}
        {error && (
          <FieldError size={size} error={error} className={errorClassName} />
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
