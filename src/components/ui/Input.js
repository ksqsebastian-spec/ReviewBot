'use client';

import { forwardRef } from 'react';

/*
  Input Component

  A styled text input with label and error handling.

  WHY forwardRef?
  React Hook Form and other form libraries need to attach refs to inputs.
  forwardRef allows parent components to get a reference to the actual
  <input> element inside this component.

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
 */
const Input = forwardRef(function Input(
  { label, error, type = 'text', className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          placeholder-gray-400
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Input;
