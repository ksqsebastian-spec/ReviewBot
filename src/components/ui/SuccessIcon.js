/*
  SuccessIcon Component

  Green checkmark in a circle, used for success states.
  Consistent styling across the app.

  ACCESSIBILITY:
  - role="img" with aria-label when used as standalone indicator
  - aria-hidden="true" when decorative (accompanying text)
*/

/**
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - Icon size
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.decorative - If true, hides from screen readers
 * @param {string} props.label - Accessible label (used when not decorative)
 */
export default function SuccessIcon({
  size = 'md',
  className = '',
  decorative = false,
  label = 'Erfolgreich'
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? 'true' : undefined}
      className={`
        bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center
        ${sizes[size]}
        ${className}
      `}
    >
      <svg
        className={`text-green-600 dark:text-green-400 ${iconSizes[size]}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}
