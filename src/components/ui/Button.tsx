'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#28D96D] text-[#0F3D36] hover:bg-[#00F06A] focus-visible:ring-[#28D96D] disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-[#7426E8] border-2 border-[#7426E8] hover:bg-[#F3F0FB] focus-visible:ring-[#7426E8] disabled:opacity-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 disabled:opacity-50',
  ghost:
    'bg-transparent text-[#8B8299] hover:bg-[#F3F0FB] hover:text-[#12051F] focus-visible:ring-[#7426E8] disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm font-medium',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-8 py-3.5 text-base font-bold',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold rounded-full',
          'transition-all duration-150 ease-out',
          'active:scale-[0.94] active:duration-75',
          'hover:brightness-[1.06]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:active:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
