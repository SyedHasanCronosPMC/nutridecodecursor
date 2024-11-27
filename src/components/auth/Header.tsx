import React from 'react';
import { Chrome } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';

export default function Header() {
  const { hash } = useLocation();

  const getTitle = () => {
    switch (hash) {
      case '#signup':
        return 'Create an account';
      case '#forgot-password':
        return 'Reset password';
      default:
        return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (hash) {
      case '#signup':
        return 'Sign up to get started';
      case '#forgot-password':
        return 'Enter your email to reset your password';
      default:
        return 'Sign in to your account';
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
        <Chrome className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{getTitle()}</h2>
      <p className="mt-2 text-sm text-gray-600">{getSubtitle()}</p>
    </div>
  );
}