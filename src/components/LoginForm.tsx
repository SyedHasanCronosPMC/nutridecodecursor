import React from 'react';
import { useLocation } from '../hooks/useLocation';
import GoogleButton from './auth/GoogleButton';
import EmailForm from './auth/EmailForm';
import SignUpForm from './auth/SignUpForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import Divider from './auth/Divider';
import Header from './auth/Header';
import { useAuth } from '../context/AuthContext';
import type { CredentialResponse } from '../types/google-one-tap';

export default function LoginForm() {
  const { hash } = useLocation();
  const { loginWithGoogle } = useAuth();
  
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      await loginWithGoogle(response.credential);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGoogleError = (error: Error) => {
    console.error('Google button error:', error);
  };

  const renderForm = () => {
    switch (hash) {
      case '#signup':
        return <SignUpForm />;
      case '#forgot-password':
        return <ForgotPasswordForm />;
      default:
        return (
          <>
            <GoogleButton 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <Divider />
            <EmailForm />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <Header />
        <div className="mt-8 space-y-6">
          {renderForm()}
        </div>
      </div>
    </div>
  );
}