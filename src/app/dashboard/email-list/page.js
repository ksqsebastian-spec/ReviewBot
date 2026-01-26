'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/*
  Email List Dashboard

  View and manage email subscribers across all companies.
  Includes manual trigger for sending reminders (export for now).

  FEATURES:
  - View all subscribers
  - Filter by company
  - Export list as CSV
  - Delete subscribers
*/

export default function EmailListPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      // Handle case when Supabase isn't initialized (during build)
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch companies for filter dropdown
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');

        setCompanies(companyData || []);

        // Fetch subscribers with company info
        const { data: subscriberData } = await supabase
          .from('email_subscribers')
          .select(`
            *,
            companies (
              id,
              name
            )
          `)
          .eq('is_active', true)
          .order('subscribed_at', { ascending: false });

        setSubscribers(subscriberData || []);
      } catch (err) {
        // Error handled by state
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter subscribers by company
  const filteredSubscribers = selectedCompany === 'all'
    ? subscribers
    : subscribers.filter((s) => s.company_id === selectedCompany);

  // Export to CSV
  function handleExport() {
    const headers = ['Email', 'Name', 'Company', 'Subscribed Date'];
    const rows = filteredSubscribers.map((s) => [
      s.email,
      s.name || '',
      s.companies?.name || '',
      formatDate(s.subscribed_at),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Unsubscribe (soft delete)
  async function handleUnsubscribe(subscriberId) {
    if (!confirm('Remove this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ is_active: false })
        .eq('id', subscriberId);

      if (error) throw error;

      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
    } catch (err) {
      // Silently fail - user can retry
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email List</h1>
          <p className="text-gray-600 mt-1">
            {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 && 's'}
          </p>
        </div>
        <Button onClick={handleExport} disabled={filteredSubscribers.length === 0}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by company:</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubscribers.length === 0 && (
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No subscribers yet
          </h3>
          <p className="text-gray-500">
            Share your signup link or QR code to start collecting emails.
          </p>
        </Card>
      )}

      {/* Subscribers Table */}
      {!loading && filteredSubscribers.length > 0 && (
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscriber.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscriber.companies?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscriber.subscribed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleUnsubscribe(subscriber.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Manual Reminder Info */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Sending Reminders</h3>
        <p className="text-gray-700 text-sm">
          To send review reminders to your subscribers:
        </p>
        <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 space-y-1">
          <li>Export the email list as CSV</li>
          <li>Import into your email tool (Gmail, Mailchimp, etc.)</li>
          <li>Send a friendly reminder with the review link</li>
        </ol>
        <p className="text-sm text-gray-500 mt-3">
          Automated email reminders coming in a future update!
        </p>
      </Card>
    </div>
  );
}
