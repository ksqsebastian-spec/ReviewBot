'use client';

/*
  Button Component

  WHY A CUSTOM BUTTON COMPONENT?
  1. Consistent styling across the entire app
  2. Built-in loading state handling
  3. Variants (primary, secondary, danger) in one place
  4. Accessible by default (focus states, disabled states)

  USAGE:
  <Button>Click me</Button>
  <Button variant="secondary">Cancel</Button>
  <Button loading>Saving...</Button>
*/

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'danger'} props.variant - Button style variant
 * @param {boolean} props.loading - Shows loading spinner
 * @param {boolean} props.disabled - Disables the button
 * @param {string} props.className - Additional CSS classes
 * @param {'button' | 'submit' | 'reset'} props.type - Button type
 * @param {Function} props.onClick - Click handler
 */
export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  // Base styles that apply to all variants
  const baseStyles = `
    inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Variant-specific styles
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && (
        // Simple CSS spinner
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
