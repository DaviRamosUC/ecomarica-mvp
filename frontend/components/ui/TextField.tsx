import { InputHTMLAttributes, forwardRef } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightSlot?: React.ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, rightSlot, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold text-gov-navy/70"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gov-navy placeholder:text-gov-navy/35 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
              error ? "border-gov-red" : "border-gov-navy/15"
            } ${rightSlot ? "pr-11" : ""} ${className}`}
            {...props}
          />
          {rightSlot && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {rightSlot}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs font-medium text-gov-red">{error}</p>}
      </div>
    );
  }
);

TextField.displayName = "TextField";
export default TextField;
