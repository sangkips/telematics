import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, LoginCredentials } from "../types";
import { apiService } from "../services/api";

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored authentication on app load
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Verify token with backend
      verifyToken();
    } else {
      setLoading(false);
    }

    // Listen for session expiry events from WebSocket service
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError("Session expired. Please login again.");
      setLoading(false);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const verifyToken = async () => {
    try {
      setError(null);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Token verification timeout')), 10000); // 10 second timeout
      });
      
      // Get current user info to verify token
      const currentUser = await Promise.race([
        apiService.getCurrentUser(),
        timeoutPromise
      ]) as AuthUser;
      
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token verification failed:", error);
      setError("Session expired. Please login again.");
      localStorage.removeItem("auth_token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(credentials);

      setUser(response.user);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setError(null);
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Don't show error for logout failures, just proceed with cleanup
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.permissions.includes("all")) return true;

    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.permissions.includes("all")) return true;

    return permissions.some((permission) =>
      user.permissions.includes(permission)
    );
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
