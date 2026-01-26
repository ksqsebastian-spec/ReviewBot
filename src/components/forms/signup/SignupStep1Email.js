/*
  SignupStep1Email Component

  First step of signup wizard - email and name entry.
*/

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignupStep1Email({
  formData,
  setFormData,
  error,
  loading,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Für Bewertungserinnerungen anmelden
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Geben Sie Ihre E-Mail-Adresse ein, um zu beginnen
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        label="E-Mail-Adresse *"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        placeholder="ihre@email.de"
        required
        autoFocus
      />

      <Input
        label="Name (optional)"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Ihr Name"
      />

      <Button type="submit" loading={loading} className="w-full">
        Weiter
      </Button>
    </form>
  );
}
