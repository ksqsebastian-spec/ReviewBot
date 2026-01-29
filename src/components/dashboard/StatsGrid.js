'use client';

import Card from '@/components/ui/Card';

/*
  StatsGrid Component

  Displays a grid of stat cards with icons, labels, and values.
  Extracted from Dashboard page to keep components under 150 lines.

  Props:
  - stats: Object with stat values (companies, subscribers, reviews, pendingReviews)
  - loading: Boolean indicating if data is loading
  - selectedCompanyId: UUID or null to filter displayed cards
*/

// Icon components for cleaner JSX
const BuildingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const COLOR_CLASSES = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function StatsGrid({ stats, loading, selectedCompanyId }) {
  const statCards = [
    {
      label: 'Unternehmen',
      value: stats.companies,
      icon: <BuildingIcon />,
      color: 'blue',
      hideWhenFiltered: true,
    },
    {
      label: 'Abonnenten',
      value: stats.subscribers,
      icon: <UsersIcon />,
      color: 'green',
    },
    {
      label: 'Ausstehende Bewertungen',
      value: stats.pendingReviews,
      icon: <ClockIcon />,
      color: 'purple',
    },
    {
      label: 'Bewertungen generiert',
      value: stats.reviews,
      icon: <StarIcon />,
      color: 'amber',
    },
  ];

  const displayedCards = selectedCompanyId
    ? statCards.filter((s) => !s.hideWhenFiltered)
    : statCards;

  return (
    <div className={`grid grid-cols-1 gap-6 ${selectedCompanyId ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
      {displayedCards.map((stat) => (
        <Card key={stat.label}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${COLOR_CLASSES[stat.color]}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stat.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
