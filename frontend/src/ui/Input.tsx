import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", type = "text", ...props }, ref) => {
        const baseClasses = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

        return (
            <input
                type={type}
                className={`${baseClasses} ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";