import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AuthState, User, LoginCredentials } from '../types/auth';
import { loginWithGoogleToken, loginWithCredentials, register as registerService, resetPassword as resetPasswordService } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload, error: null };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await loginWithCredentials(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      localStorage.setItem('auth_token', token);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await loginWithGoogleToken(credential);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      localStorage.setItem('auth_token', token);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Google login failed' });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await registerService(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      localStorage.setItem('auth_token', token);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await resetPasswordService(email);
      dispatch({ type: 'AUTH_SUCCESS', payload: null });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Password reset failed' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};