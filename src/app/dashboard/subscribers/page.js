'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { NOTIFICATION_INTERVALS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

/*
  Subscribers Management Page

  View and manage all email subscribers (person-centric view).
  Shows which companies each person is subscribed to.

  Features:
  - View all subscribers
  - See companies per subscriber
  - Edit notification preferences
  - Global unsubscribe (deactivate)
  - View notification history
  - Export to CSV
*/

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch subscribers with their company subscriptions
  useEffect(() => {
    async function fetchSubscribers() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch from new subscribers table
        const { data: subscriberData, error: subError } = await supabase
          .from('subscribers')
          .select(`
            *,
            subscriber_companies (
              id,
              company_id,
              subscribed_at,
              next_notification_at,
              companies (
                id,
                name,
                slug
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (subError) {
          // If new table doesn't exist, fall back to old email_subscribers
          // Fallback to old table
          const { data: oldData, error: oldError } = await supabase
            .from('email_subscribers')
            .select(`
              *,
              companies (
                id,
                name,
                slug
              )
            `)
            .eq('is_active', true)
            .order('subscribed_at', { ascending: false });

          if (oldError) throw oldError;

          // Transform old data to new format
          const transformed = (oldData || []).map((sub) => ({
            id: sub.id,
            email: sub.email,
            name: sub.name,
            preferred_language: 'de',
            notification_interval_days: 30,
            created_at: sub.subscribed_at,
            is_active: sub.is_active,
            subscriber_companies: [{
              id: sub.id,
              company_id: sub.company_id,
              subscribed_at: sub.subscribed_at,
              next_notification_at: sub.last_notified_at,
              companies: sub.companies,
            }],
          }));
          setSubscribers(transformed);
        } else {
          setSubscribers(subscriberData || []);
        }
      } catch (err) {
        // Error handled by state
      } finally {
        setLoading(false);
      }
    }

    fetchSubscribers();
  }, []);

  // Deactivate subscriber (global unsubscribe)
  const handleDeactivate = async (subscriberId) => {
    if (!confirm('Diesen Abonnenten deaktivieren? Sie erhalten keine E-Mails mehr.')) return;

    try {
      // Try new table first
      let error = null;
      const { error: newError } = await supabase
        .from('subscribers')
        .update({ is_active: false })
        .eq('id', subscriberId);

      if (newError) {
        // Fall back to old table
        const { error: oldError } = await supabase
          .from('email_subscribers')
          .update({ is_active: false })
          .eq('id', subscriberId);
        error = oldError;
      }

      if (error) throw error;

      setSubscribers((prev) =>
        prev.map((s) => (s.id === subscriberId ? { ...s, is_active: false } : s))
      );
    } catch (err) {
      // Silently fail - user can retry
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['E-Mail', 'Name', 'Unternehmen', 'Intervall (Tage)', 'Angemeldet am', 'Status'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.subscriber_companies?.map((sc) => sc.companies?.name).join(', ') || '',
      s.notification_interval_days,
      formatDate(s.created_at),
      s.is_active ? 'Aktiv' : 'Inaktiv',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnenten-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get interval label
  const getIntervalLabel = (days) => {
    const interval = NOTIFICATION_INTERVALS.find((i) => i.value === days);
    return interval ? interval.label.de : `${days} Tage`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnenten</h1>
          <p className="text-gray-600 mt-1">
            {subscribers.filter((s) => s.is_active).length} aktive Abonnenten
          </p>
        </div>
        <Button onClick={handleExport} disabled={subscribers.length === 0}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV exportieren
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && subscribers.length === 0 && (
        <Card className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Noch keine Abonnenten
          </h3>
          <p className="text-gray-500">
            Teilen Sie Ihren Anmelde-Link oder QR-Code, um Abonnenten zu gewinnen.
          </p>
        </Card>
      )}

      {/* Subscribers List */}
      {!loading && subscribers.length > 0 && (
        <div className="space-y-4">
          {subscribers.map((subscriber) => (
            <Card key={subscriber.id} className={`${!subscriber.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                {/* Subscriber Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {(subscriber.name || subscriber.email).charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Name and email */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {subscriber.name || 'Ohne Namen'}
                      </p>
                      <p className="text-sm text-gray-500">{subscriber.email}</p>
                    </div>

                    {/* Status badge */}
                    {!subscriber.is_active && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        Inaktiv
                      </span>
                    )}
                  </div>

                  {/* Subscribed companies */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subscriber.subscriber_companies?.map((sc) => (
                      <span
                        key={sc.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {sc.companies?.name || 'Unbekannt'}
                      </span>
                    ))}
                  </div>

                  {/* Meta info */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Intervall: {getIntervalLabel(subscriber.notification_interval_days)}
                    </span>
                    <span>
                      Angemeldet: {formatDate(subscriber.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {subscriber.is_active && (
                    <button
                      onClick={() => handleDeactivate(subscriber.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Deaktivieren"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Hinweis zur E-Mail-Versand</h3>
        <p className="text-sm text-gray-700">
          Die automatische E-Mail-Versand-Funktion wird nach Einrichtung von Resend aktiviert.
          Bis dahin können Sie die Abonnentenliste exportieren und manuell E-Mails versenden.
        </p>
      </Card>
    </div>
  );
}
