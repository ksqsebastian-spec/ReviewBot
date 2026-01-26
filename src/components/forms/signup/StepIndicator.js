/*
  StepIndicator Component

  Visual progress indicator for multi-step forms.
  Shows current step and completion status.
*/

export default function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= s.num
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
              }
            `}
          >
            {currentStep > s.num ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              s.num
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-1 ${
                currentStep > s.num ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
