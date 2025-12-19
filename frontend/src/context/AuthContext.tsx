import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  token: string | null;
  address: string | null;
  login: (token: string, address: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedAddress = localStorage.getItem("wallet_address");

    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
    }
  }, []);

  const login = (token: string, address: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("wallet_address", address);
    setToken(token);
    setAddress(address);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("wallet_address");
    setToken(null);
    setAddress(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, address, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
