/*
  SignupStep3Preferences Component

  Third step of signup wizard - notification preferences.
*/

import { NOTIFICATION_INTERVALS, TEST_INTERVALS, TIME_SLOTS } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function SignupStep3Preferences({
  formData,
  setFormData,
  error,
  loading,
  onBack,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Ihre Einstellungen
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Wie oft möchten Sie erinnert werden?
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Notification interval */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Erinnerungsintervall
        </label>
        <select
          value={formData.notificationInterval}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              notificationInterval: parseFloat(e.target.value),
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {NOTIFICATION_INTERVALS.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label.de}
            </option>
          ))}
          {/* Test intervals - for testing email delivery */}
          <optgroup label="--- Test ---">
            {TEST_INTERVALS.map((interval) => (
              <option key={`test-${interval.value}`} value={interval.value}>
                {interval.label.de}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Preferred time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bevorzugte Tageszeit
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, preferredTimeSlot: slot.value }))
              }
              className={`
                p-3 rounded-lg border-2 text-sm font-medium transition-colors
                ${formData.preferredTimeSlot === slot.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {slot.label.de}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Zurück
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Anmelden
        </Button>
      </div>
    </form>
  );
}
