import { InputHTMLAttributes } from 'react';

export type CheckboxParams = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className = "", ...rest }: CheckboxParams) {
    return (
        <label className='relative'>
            <input
                type='checkbox'
                className={`spaned-check h-5 w-5 align-middle appearance-none bg-primary bg-opacity-20 rounded checked:bg-opacity-100 ${className}`}
                {...rest}
            />
            <span className="spanned-check-tick absolute z-10 border-r-4 border-b-4 left-[6px] top-[5px] border-white w-2 h-3 rotate-45"></span>
        </label>
    );
}