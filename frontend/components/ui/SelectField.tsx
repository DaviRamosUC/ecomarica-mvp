import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: readonly string[];
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, id, className = "", ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold text-gov-navy/70"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gov-navy outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
            error ? "border-gov-red" : "border-gov-navy/15"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs font-medium text-gov-red">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
export default SelectField;
