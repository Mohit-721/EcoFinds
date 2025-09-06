
import React, { useState, useEffect } from 'react';
import { LeafIcon, CloseIcon } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
  onLogin: (email: string, pass: string) => Promise<string | null>;
  onRegister: (email: string, username: string, pass: string) => Promise<string | null>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode, onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset fields when modal opens or mode changes
      setEmail('');
      setUsername('');
      setPassword('');
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    let errorResult: string | null = null;
    if (mode === 'login') {
      errorResult = await onLogin(email, password);
    } else {
      if(password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      errorResult = await onRegister(email, username, password);
    }

    if (errorResult) {
        setError(errorResult);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="relative bg-white text-gray-800 w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        style={{ animationFillMode: 'forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <LeafIcon className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {mode === 'login' ? 'Sign in to continue to EcoFinds' : 'Join our community of sustainable shoppers'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
            
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-blue-500 hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
      `}</style>
    </div>
  );
};
