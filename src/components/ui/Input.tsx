'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#12051F]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute start-3 text-sm text-[#8B8299] select-none pointer-events-none z-10">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-[#F3F0FB] px-3 py-2.5 text-sm text-[#12051F]',
              'placeholder:text-[#C9C4D2] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#7426E8] focus:border-[#7426E8] focus:bg-white',
              'disabled:bg-[#F7F4FC] disabled:text-[#C9C4D2] disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-[#E7E2EF] hover:border-[#7426E8]',
              prefix ? 'ps-10' : '',
              rightElement ? 'pe-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {rightElement && (
            <div className="absolute end-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-[#8B8299]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
