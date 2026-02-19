import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";

interface User {
  id: number;
  username: string;
  email: string;
  role: string; // always normalized string
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔎 Verify token on app load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("access");
      console.log("Stored access token:", token);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("me/");
        const backendUser = res.data;

        console.log("Backend user (verify):", backendUser);

        const normalizedRole =
          backendUser.role && typeof backendUser.role === "object"
            ? backendUser.role.name
            : backendUser.role || "SUPER_ADMIN"; // fallback

        console.log("Normalized role (verify):", normalizedRole);

        setUser({
          id: backendUser.id,
          username: backendUser.username,
          email: backendUser.email,
          role: normalizedRole,
        });

      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // 🔐 Login
  const login = async (username: string, password: string) => {
    try {
      console.log("Attempting login with:", username);

      const res = await api.post("login/", { username, password });

      const { access, refresh } = res.data;

      console.log("Login success. Tokens received.");

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const userRes = await api.get("me/");
      const backendUser = userRes.data;

      console.log("Backend user (login):", backendUser);

      const normalizedRole =
        backendUser.role && typeof backendUser.role === "object"
          ? backendUser.role.name
          : backendUser.role || "SUPER_ADMIN"; // fallback if null

      console.log("Normalized role (login):", normalizedRole);

      setUser({
        id: backendUser.id,
        username: backendUser.username,
        email: backendUser.email,
        role: normalizedRole,
      });

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // 🚪 Logout
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
