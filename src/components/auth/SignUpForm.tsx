import React from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function SignUpForm() {
  const { register } = useAuth();
  const { values, handleChange, handleSubmit, isLoading, error } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      await register(values);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        icon={<User className="h-5 w-5 text-gray-400" />}
        label="Full name"
        type="text"
        name="name"
        value={values.name}
        onChange={handleChange}
        required
      />

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

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Button
          variant="link"
          onClick={() => window.location.hash = '#login'}
          type="button"
        >
          Sign in
        </Button>
      </p>
    </form>
  );
}