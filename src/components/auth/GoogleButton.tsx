import React from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Chrome } from 'lucide-react';
import { Button } from '../ui/Button';

export default function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // For demo purposes, we'll use a mock credential
      const mockCredential = 'mock_google_credential';
      await loginWithGoogle(mockCredential);
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleGoogleLogin}
      isLoading={isLoading}
      className="w-full"
    >
      <Chrome className="h-5 w-5 text-blue-500 mr-2" />
      Continue with Google
    </Button>
  );
}