/*
  SuccessIcon Component

  Green checkmark in a circle, used for success states.
  Consistent styling across the app.
*/

export default function SuccessIcon({ size = 'md', className = '' }) {
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
      className={`
        bg-green-100 rounded-full flex items-center justify-center
        ${sizes[size]}
        ${className}
      `}
    >
      <svg
        className={`text-green-600 ${iconSizes[size]}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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
