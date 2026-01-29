'use client';

import Card from '@/components/ui/Card';

/*
  ReviewsTable Component

  Displays reviews by company in a table format.
  Shows due now, pending, and completed counts per company.
  Extracted from Dashboard page to keep components under 150 lines.

  Props:
  - reviewsByCompany: Array of company objects with review counts
*/

export default function ReviewsTable({ reviewsByCompany }) {
  if (!reviewsByCompany || reviewsByCompany.length === 0) {
    return null;
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Bewertungen pro Unternehmen
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-dark-700">
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-dark-300">
                Unternehmen
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">
                Jetzt fällig
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">
                Ausstehend
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-dark-300">
                Abgeschlossen
              </th>
            </tr>
          </thead>
          <tbody>
            {reviewsByCompany.map((company) => (
              <tr
                key={company.id}
                className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50"
              >
                <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                  {company.name}
                </td>
                <td className="py-3 px-2 text-center">
                  {company.dueNow > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {company.dueNow}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-dark-500">0</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {company.pending}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {company.completed}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
