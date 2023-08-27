import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

// 컨텍스트에 사용될 타입 정의
type AuthContextType = {
  userData: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [userData, setUserData] = useState<User | null>(null);

  const login = (user: User) => {
    setUserData(user);
  };

  const logout = () => {
    setUserData(null);
  };

  const value: AuthContextType = {
    userData,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
