import { forwardRef, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", noPadding = false, ...props }, ref) => {

        const baseClasses = "rounded-lg border border-gray-200 bg-white shadow-sm";
        const paddingClass = noPadding ? "" : "p-6";

        return (
            <div
                ref={ref}
                className={`${baseClasses} ${paddingClass} ${className}`}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";