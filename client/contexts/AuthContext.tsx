import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create basic profile
          console.log('Profile not found, creating basic profile...');
          const basicProfile: Profile = {
            id: userId,
            email: user?.email || '',
            full_name: '',
            phone: '',
            address: null,
            is_admin: user?.email === 'jantjieskurt7@gmail.com', // Make this user admin
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(basicProfile);
          return basicProfile;
        }
        // If there are policy errors, create a basic profile anyway
        console.error('Error fetching profile, using fallback:', error);
        const fallbackProfile: Profile = {
          id: userId,
          email: user?.email || '',
          full_name: '',
          phone: '',
          address: null,
          is_admin: user?.email === 'jantjieskurt7@gmail.com', // Make this user admin
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }

      // Ensure admin status for this specific user
      if (data && user?.email === 'jantjieskurt7@gmail.com') {
        data.is_admin = true;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile, using fallback:', error);
      // Create fallback profile for authenticated user
      const fallbackProfile: Profile = {
        id: userId,
        email: user?.email || '',
        full_name: '',
        phone: '',
        address: null,
        is_admin: user?.email === 'jantjieskurt7@gmail.com', // Make this user admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || '',
            phone: userData?.phone || '',
          }
        }
      });

      if (error) {
        return { error };
      }

      // If signup successful but no session (email confirmation required)
      if (data.user && !data.session) {
        return { error: null }; // User needs to confirm email
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error: any) {
      return { error: { message: error.message } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setProfile(null);
        setUser(null);
        setSession(null);
      }
      return { error };
    } catch (error: any) {
      return { error: { message: error.message } as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error: any) {
      return { error };
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