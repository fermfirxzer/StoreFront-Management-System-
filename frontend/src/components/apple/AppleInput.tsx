import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  ForwardedRef,
} from "react";
import { forwardRef } from "react";

type SharedProps = {
  label: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  containerClassName?: string;
  fieldClassName?: string;
  labelClassName?: string;
  as?: "input" | "textarea";
};

type AppleInputProps = SharedProps &
  InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

const AppleInput = forwardRef(function AppleInput(
  {
    label,
    error,
    hint,
    prefix,
    containerClassName = "",
    fieldClassName = "",
    labelClassName = "",
    as = "input",
    className,
    rows = 4,
    ...props
  }: AppleInputProps,
  ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
  const fieldClasses = [
    "w-full rounded-apple-input border border-transparent bg-apple-gray-light px-4 py-3 text-[17px] text-apple-black outline-none transition-all duration-150 ease-apple placeholder:text-apple-gray focus:border-apple-blue focus:bg-white focus:shadow-apple-focus",
    prefix ? "pl-14" : "",
    error ? "border-apple-red focus:border-apple-red focus:shadow-[0_0_0_3px_rgba(255,59,48,0.12)]" : "",
    fieldClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={["block", containerClassName].filter(Boolean).join(" ")}>
      <span
        className={[
          "mb-2 block text-[13px] font-medium uppercase tracking-[0.2px] text-apple-black",
          labelClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] font-medium text-apple-gray">
            {prefix}
          </span>
        ) : null}
        {as === "textarea" ? (
          <textarea
            ref={ref as ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            className={fieldClasses}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as ForwardedRef<HTMLInputElement>}
            className={fieldClasses}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {hint ? <p className="mt-2 text-[12px] text-apple-gray">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-[12px] text-apple-red animate-shake">{error}</p>
      ) : null}
    </label>
  );
});

export default AppleInput;
