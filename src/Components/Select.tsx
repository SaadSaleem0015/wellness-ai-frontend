import { SelectHTMLAttributes } from "react"

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ children, className = "", ...args }: SelectProps) {
    return (
        <select {...args} className={`w-full p-4 border rounded-lg outline-none ring-1 ring-gray-300 focus:ring-primary appearance-none relative after::content-['>'] after::absolute after::right-3 ${className}`}>
            { children }
        </select>
    )
}