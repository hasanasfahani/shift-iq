'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <label
        htmlFor={checkId}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <input
          ref={ref}
          id={checkId}
          type="checkbox"
          className={[
            'w-4 h-4 rounded border-[#E7E2EF] text-[#7426E8] accent-[#7426E8]',
            'focus:ring-2 focus:ring-[#7426E8] focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        <span className="text-sm text-[#12051F] group-hover:text-[#0F3D36] transition-colors select-none">
          {label}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
