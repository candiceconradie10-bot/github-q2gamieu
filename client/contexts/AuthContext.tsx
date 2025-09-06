import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '@/lib/supabaseClient';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  isAdmin: () => boolean;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('auth_user');
    const storedProfile = localStorage.getItem('auth_profile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
      setSession({ user: JSON.parse(storedUser) });
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // For development - simple registration
      const user = { id: crypto.randomUUID(), email };
      const profile = { 
        id: user.id,
        email, 
        full_name: userData?.full_name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'User',
        phone: userData?.phone,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(user);
      setProfile(profile);
      setSession({ user });
      
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_profile', JSON.stringify(profile));
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For development - simple authentication
      if (email === 'admin@test.com' && password === 'admin') {
        const user = { id: '11111111-1111-1111-1111-111111111111', email: 'admin@test.com' };
        const profile = { 
          id: '11111111-1111-1111-1111-111111111111',
          email: 'admin@test.com', 
          full_name: 'Test Admin',
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(user);
        setProfile(profile);
        setSession({ user });
        
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_profile', JSON.stringify(profile));
        
        return { error: null };
      } else if (email === 'user@test.com' && password === 'user') {
        const user = { id: '22222222-2222-2222-2222-222222222222', email: 'user@test.com' };
        const profile = { 
          id: '22222222-2222-2222-2222-222222222222',
          email: 'user@test.com', 
          full_name: 'Test User',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(user);
        setProfile(profile);
        setSession({ user });
        
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_profile', JSON.stringify(profile));
        
        return { error: null };
      }
      
      return { error: { message: 'Invalid email or password. Try admin@test.com/admin or user@test.com/user' } };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setSession(null);
      
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_profile');
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign out failed' } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: new Error('No user logged in') };

    try {
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);
      localStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Profile update failed' } };
    }
  };

  const isAdmin = () => {
    return profile?.is_admin || false;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};