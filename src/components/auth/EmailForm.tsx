import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';

export default function EmailForm() {
  const { login } = useAuth();
  const { values, handleChange, handleSubmit, isLoading, error } = useForm({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          label="Email address"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          required
        />

        <InputField
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>

          <Button
            variant="link"
            onClick={() => window.location.hash = '#forgot-password'}
            type="button"
          >
            Forgot password?
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Button
          variant="link"
          onClick={() => window.location.hash = '#signup'}
          type="button"
        >
          Sign up
        </Button>
      </p>
    </div>
  );
}