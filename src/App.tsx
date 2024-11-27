import React from 'react';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/LoginForm';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100">
        <Toaster position="top-right" />
        <LoginForm />
      </div>
    </AuthProvider>
  );
}

export default App;