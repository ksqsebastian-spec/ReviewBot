/*
  LoadingSpinner Component

  Reusable loading indicator used throughout the app.
  Consistent styling and sizing options.

  ACCESSIBILITY:
  - role="status" announces loading state to screen readers
  - aria-label provides context
  - Screen-reader-only text for additional clarity
  - Respects prefers-reduced-motion (handled in globals.css)
*/

/**
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - Spinner size
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Custom loading label for screen readers
 */
export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Wird geladen'
}) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`
        animate-spin rounded-full
        border-primary-200 border-t-primary-600
        dark:border-primary-800 dark:border-t-primary-400
        ${sizes[size]}
        ${className}
      `}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
