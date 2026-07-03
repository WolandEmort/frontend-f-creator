import { forwardRef, type InputHTMLAttributes } from "react";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = "", ...props }, ref) => {
        const baseClasses = "h-4 w-4 shrink-0 cursor-pointer accent-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

        return (
            <input
                type="checkbox"
                ref={ref}
                className={`${baseClasses} ${className}`}
                {...props}
            />
        );
    }
);

Checkbox.displayName = "Checkbox";