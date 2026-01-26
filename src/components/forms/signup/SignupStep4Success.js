/*
  SignupStep4Success Component

  Final step of signup wizard - success confirmation.
*/

import { NOTIFICATION_INTERVALS } from '@/lib/constants';
import SuccessIcon from '@/components/ui/SuccessIcon';

export default function SignupStep4Success({ formData, selectedCompanyNames }) {
  const intervalLabel = NOTIFICATION_INTERVALS.find(
    (i) => i.value === formData.notificationInterval
  )?.label;

  return (
    <div className="text-center py-8">
      <SuccessIcon className="mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Erfolgreich angemeldet!
      </h3>
      <p className="text-gray-600 mb-4">
        Sie erhalten jetzt Bewertungserinnerungen für:
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {selectedCompanyNames.map((name) => (
          <span
            key={name}
            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
          >
            {name}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        {formData.preferredLanguage === 'de'
          ? `Sie werden etwa ${intervalLabel?.de.toLowerCase()} erinnert.`
          : `You will be reminded approximately ${intervalLabel?.en.toLowerCase()}.`}
      </p>
    </div>
  );
}
