import { useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { CredentialResponse } from '../../types/google-one-tap';

interface GoogleButtonProps {
  onSuccess?: (response: CredentialResponse) => void;
  onError?: (error: Error) => void;
}

export default function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  const { loginWithGoogle } = useAuth();

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      await loginWithGoogle(response.credential);
      onSuccess?.(response);
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error instanceof Error ? error : new Error('Google login failed'));
    }
  }, [loginWithGoogle, onSuccess, onError]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not found');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
      }
    }

    return () => {
      window.google?.accounts?.id?.cancel();
    };
  }, [handleCredentialResponse]);

  return (
    <div 
      id="google-signin-button"
      className="w-full h-10 flex justify-center items-center"
      role="button"
      tabIndex={0}
      aria-label="Sign in with Google"
    />
  );
}