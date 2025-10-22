import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean,
    varient?: 'primary' | 'danger'
}

export function Button({ className = "", fullWidth = false, children, varient = 'primary', ...rest }: ButtonProps) {
    return (
        <button
            className={`${fullWidth ? "w-full" : ""} ${varient === "danger" ? "bg-red-500" : "bg-primary"} text-white py-4 px-6 rounded-lg font-medium disabled:bg-opacity-50 ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}