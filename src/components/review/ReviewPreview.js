'use client';

/*
  ReviewPreview Component

  Shows a live preview of the generated review text.
  Updates in real-time as users select/deselect descriptors.

  WHY A SEPARATE PREVIEW?
  1. Users see exactly what they'll copy before copying
  2. Real-time feedback encourages more selections
  3. Clear visual separation between input (chips) and output (preview)
*/

/**
 * @param {Object} props
 * @param {string} props.reviewText - The generated review text
 * @param {number} props.minSelections - Minimum selections needed
 * @param {number} props.currentSelections - Current number of selections
 */
export default function ReviewPreview({
  reviewText,
  minSelections = 2,
  currentSelections = 0,
}) {
  const needsMoreSelections = currentSelections < minSelections;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Ihre Bewertungsvorschau
      </h3>

      {needsMoreSelections ? (
        // Placeholder when not enough selections
        <div className="text-gray-400 italic">
          Wählen Sie mindestens {minSelections} Beschreibungen aus, um Ihre Bewertung zu erstellen...
        </div>
      ) : (
        // Actual review text
        <div className="space-y-3">
          <p className="text-gray-800 leading-relaxed">
            {reviewText}
          </p>

          {/* Visual star rating indicator */}
          <div className="flex items-center gap-1 pt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-500 ml-2">
              5-Sterne-Bewertung
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
