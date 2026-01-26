/*
  SignupStep2Companies Component

  Second step of signup wizard - company selection.
*/

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SignupStep2Companies({
  formData,
  companies,
  loadingCompanies,
  existingSubscriber,
  initialCompanyId,
  error,
  onToggleCompany,
  onToggleAll,
  onBack,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Unternehmen auswählen
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Von welchen Unternehmen möchten Sie Erinnerungen erhalten?
        </p>
      </div>

      {existingSubscriber && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          Willkommen zurück! Wir haben Ihre bestehenden Einstellungen geladen.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loadingCompanies ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Select All button */}
          <button
            type="button"
            onClick={onToggleAll}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {formData.selectedCompanies.length === companies.length
              ? 'Auswahl aufheben'
              : 'Alle auswählen'}
          </button>

          {/* Company list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {companies.map((company) => {
              const isCompleted = formData.completedCompanies?.includes(company.id);
              return (
                <label
                  key={company.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-colors
                    ${isCompleted
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                      : formData.selectedCompanies.includes(company.id)
                        ? 'border-primary-500 bg-primary-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedCompanies.includes(company.id)}
                    onChange={() => !isCompleted && onToggleCompany(company.id)}
                    disabled={isCompleted}
                    className="w-4 h-4 text-primary-600 rounded disabled:opacity-50"
                  />
                  <span className={`font-medium ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                    {company.name}
                  </span>
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Bereits bewertet
                    </span>
                  )}
                  {company.id === initialCompanyId && !isCompleted && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      Aktuell
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Zurück
        </Button>
        <Button type="submit" className="flex-1">
          Weiter
        </Button>
      </div>
    </form>
  );
}
