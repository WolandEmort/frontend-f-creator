import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "destructive" | "secondary";
    size?: "default" | "sm" | "lg";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", ...props }, ref) => {

        const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
        const variantClasses = variantStyles[variant];
        const sizeClasses = sizeStyles[size];

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";