import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { account, signer } = useWeb3();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async () => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Get nonce from backend
      const messageResponse = await axios.post(`${API_URL}/auth/message`, {
        walletAddress: account,
      });

      const message = messageResponse.data.message;

      // Step 2: Sign the message
      const signature = await signer.signMessage(message);

      // Step 3: Verify signature and get JWT
      const verifyResponse = await axios.post(`${API_URL}/auth/verify`, {
        walletAddress: account,
        signature,
      });

      const { token: jwtToken, userId, walletAddress } = verifyResponse.data;

      const userData: User = {
        id: userId,
        walletAddress,
      };

      setToken(jwtToken);
      setUser(userData);

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Successfully authenticated!');
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    if (!account && user) {
      logout();
    }
  }, [account]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
