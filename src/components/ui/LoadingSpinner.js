/*
  LoadingSpinner Component

  Reusable loading indicator used throughout the app.
  Consistent styling and sizing options.
*/

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`
        animate-spin rounded-full
        border-primary-200 border-t-primary-600
        ${sizes[size]}
        ${className}
      `}
    />
  );
}
