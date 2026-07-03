import { forwardRef, type InputHTMLAttributes } from "react";

export type RadioProps = InputHTMLAttributes<HTMLInputElement>;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ className = "", ...props }, ref) => {
        const baseClasses = "h-4 w-4 shrink-0 cursor-pointer accent-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

        return (
            <input
                type="radio"
                ref={ref}
                className={`${baseClasses} ${className}`}
                {...props}
            />
        );
    }
);

Radio.displayName = "Radio";