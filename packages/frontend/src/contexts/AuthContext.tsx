import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import walletService from '../services/wallet';

interface User {
  id: number;
  ethereum_address: string;
  username: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Connect wallet and get address
      const address = await walletService.connectWallet();
      
      // Step 2: Request challenge from server
      const challengeResponse = await authAPI.getChallenge(address);
      const nonce = challengeResponse.data.nonce;
      
      // Step 3: Sign the challenge message
      const message = `Sign this message to log in to WatchCrox: ${nonce}`;
      const signature = await walletService.signMessage(message);
      
      // Step 4: Verify signature on the server
      const authResponse = await authAPI.authenticate(address, signature);
      
      // Save token and user data
      const { token, user: userData } = authResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 