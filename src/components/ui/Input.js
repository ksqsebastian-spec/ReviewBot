'use client';

import { forwardRef, useId } from 'react';

/*
  Input Component

  A styled text input with label and error handling.

  WHY forwardRef?
  React Hook Form and other form libraries need to attach refs to inputs.
  forwardRef allows parent components to get a reference to the actual
  <input> element inside this component.

  ACCESSIBILITY:
  - Label properly associated with input via htmlFor/id
  - Error messages linked via aria-describedby
  - Error messages announced with role="alert"
  - aria-invalid indicates validation state

  USAGE:
  <Input label="Email" type="email" placeholder="you@example.com" />
  <Input label="Name" error="Name is required" />
*/

/**
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message to display
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Optional custom id (auto-generated if not provided)
 */
const Input = forwardRef(function Input(
  { label, error, type = 'text', className = '', id: customId, ...props },
  ref
) {
  // Generate unique ID for accessibility if not provided
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-3 py-2 border rounded-lg bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          placeholder-gray-400
          dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
          ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
