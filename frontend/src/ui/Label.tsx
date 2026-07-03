import { forwardRef, type LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className = "", required, children, ...props }, ref) => {
        const baseClasses = "text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

        return (
            <label
                ref={ref}
                className={`${baseClasses} ${className}`}
                {...props}
            >
                {children}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
        );
    }
);

Label.displayName = "Label";