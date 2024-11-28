import { useEffect, useState, useCallback, useRef } from 'react';
import type { CredentialResponse, PromptNotification } from '../../types/google-one-tap';
import { getEnvVar } from '../../utils/env';

interface GoogleButtonProps {
  onSuccess?: (response: CredentialResponse) => void;
  onError?: (error: Error) => void;
}

const GoogleButton = ({ onSuccess, onError }: GoogleButtonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isInitializing = useRef(false);

  const initializeGoogleSignIn = useCallback(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const GOOGLE_CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID');
      
      if (!window.google?.accounts?.id) {
        throw new Error('Google Sign-In failed to initialize');
      }

      // Cancel any existing prompt
      window.google.accounts.id.cancel();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            onSuccess?.(response);
          } else {
            onError?.(new Error('Invalid credential response'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        itp_support: true
      });

      const buttonContainer = document.getElementById('googleButton');
      if (buttonContainer) {
        // Clear existing content
        buttonContainer.innerHTML = '';
        
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: '100%',
          logo_alignment: 'center'
        });
      }

      // Delay the prompt to avoid concurrent requests
      setTimeout(() => {
        window.google.accounts.id.prompt((notification: PromptNotification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One-tap suppressed or skipped:', notification.getNotDisplayedReason() || notification.getSkippedReason());
          }
        });
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google Sign-In initialization failed';
      setLoadError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      isInitializing.current = false;
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Sign-In');
      onError?.(new Error('Failed to load Google Sign-In'));
    };
    
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [initializeGoogleSignIn, onError]);

  return (
    <div 
      id="googleButton" 
      className="w-full min-h-[40px] flex justify-center items-center" 
      role="button"
      aria-label="Sign in with Google"
      tabIndex={0}
    />
  );
};

export default GoogleButton;