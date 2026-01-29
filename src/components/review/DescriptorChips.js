'use client';

/*
  DescriptorChips Component

  Displays clickable "chips" (pill-shaped buttons) for service descriptors.
  Users click to select/deselect descriptors that will be combined into a review.

  WHY CHIPS?
  1. Visual and intuitive - users see all options at once
  2. Multi-select is natural (unlike dropdowns)
  3. Selected state is immediately visible
  4. Works great on mobile (tap targets)

  PROPS:
  - categories: Array of { id, name, descriptors: [{ id, text }] }
  - selected: Set of selected descriptor IDs
  - onToggle: Function called when a chip is clicked
  - maxSelections: Maximum allowed selections (shows warning)
*/

/**
 * @param {Object} props
 * @param {Array} props.categories - Descriptor categories with their descriptors
 * @param {Set} props.selected - Set of selected descriptor IDs
 * @param {Function} props.onToggle - Called with descriptor ID when clicked
 * @param {number} props.maxSelections - Maximum selections allowed
 */
export default function DescriptorChips({
  categories = [],
  selected = new Set(),
  onToggle,
  maxSelections = 6,
}) {
  const selectionCount = selected.size;
  const isAtMax = selectionCount >= maxSelections;

  return (
    <div className="space-y-6">
      {/* Selection counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Wählen Sie Beschreibungen, die Ihre Erfahrung beschreiben:
        </span>
        <span className={`font-medium ${selectionCount > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
          {selectionCount}/{maxSelections} ausgewählt
        </span>
      </div>

      {/* Categories and their descriptors */}
      {categories.map((category) => (
        <div key={category.id}>
          {/* Category header */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {category.name}
          </h3>

          {/* Descriptor chips */}
          <div className="flex flex-wrap gap-2">
            {category.descriptors.map((descriptor) => {
              const isSelected = selected.has(descriptor.id);
              // Disable unselected chips if at max
              const isDisabled = !isSelected && isAtMax;

              return (
                <button
                  key={descriptor.id}
                  onClick={() => !isDisabled && onToggle(descriptor.id)}
                  disabled={isDisabled}
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded-full text-sm
                    font-medium cursor-pointer transition-all duration-200
                    border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                    ${isSelected
                      ? 'bg-primary-100 text-primary-700 border-primary-500'
                      : isDisabled
                        ? 'bg-gray-50 text-gray-400 border-transparent cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                    }
                  `}
                >
                  {/* Checkmark for selected items */}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 mr-1.5 -ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {descriptor.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Hint when at max */}
      {isAtMax && (
        <p className="text-sm text-amber-600">
          Maximale Auswahl erreicht. Wählen Sie eine Option ab, um eine andere auszuwählen.
        </p>
      )}
    </div>
  );
}
