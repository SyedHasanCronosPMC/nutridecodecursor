import React from 'react';
import { Mail } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const { values, handleChange, handleSubmit, isLoading, error, success } = useForm({
    initialValues: {
      email: '',
    },
    onSubmit: async (values) => {
      await resetPassword(values.email);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <InputField
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        label="Email address"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        required
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600 mt-1">
          Check your email for reset instructions
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        Send reset link
      </Button>

      <Button
        variant="link"
        onClick={() => window.location.hash = '#login'}
        type="button"
        className="w-full"
      >
        Back to sign in
      </Button>
    </form>
  );
}