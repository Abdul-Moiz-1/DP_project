// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/api/types";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizerProfile?: {
    organizationName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const storedUser = localStorage.getItem("user");
  //       const token = localStorage.getItem("token");

  //       if (storedUser && token) {
  //         setUser(JSON.parse(storedUser));
  //         setIsAuthenticated(true);
  //       } // we will also use fetch profile from API to verify token validity
  //     } catch (error) {
  //       console.error("Auth check failed:", error);
  //       localStorage.removeItem("user");
  //       localStorage.removeItem("token");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const { data } = await api.get("/users/profile");
          setUser(data);
          setToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("accessToken");
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data: LoginResponse = response.data;

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      setToken(data.accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (!response) {
        throw new Error("No response from registration API");
      }

      navigate("/login");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const res = await api.post('/auth/logout');

      if (!res) {
        throw new Error(`no response from logout API`);
      }
    } catch (error) {
      throw new Error("Logout failed. Please try again.");
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
