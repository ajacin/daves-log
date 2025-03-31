import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ID } from "appwrite";
import { account } from "../appwrite";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const init = useCallback(async () => {
    try {
      const loggedInUser = await account.get();
      setUser(loggedInUser);
    } catch (error) {
      console.error("Init error:", error);
      setUser(null);
      // If on a protected route, redirect to login
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/dashboard")) {
        navigate("/login");
      }
    } finally {
      setIsInitialized(true);
    }
  }, [navigate]);

  async function login(email, password) {
    try {
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to login. Please check your credentials.");
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async function register(email, password, name) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const newUser = await account.create(ID.unique(), email, password, name);
      if (newUser) {
        await login(email, password);
      }
    } catch (error) {
      console.error("Register error:", error);
      if (error.code === 409) {
        throw new Error("An account with this email already exists");
      } else if (error.code === 400) {
        throw new Error("Invalid email or password format");
      } else {
        throw new Error(error.message || "Failed to create account. Please try again.");
      }
    }
  }

  useEffect(() => {
    init();
  }, [init]);

  // Protect routes that require authentication
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = window.location.pathname;
    const publicRoutes = ["/", "/login", "/register"];
    const isPublicRoute = publicRoutes.includes(currentPath);
    const isDashboardRoute = currentPath.startsWith("/dashboard/ideas");

    if (user && isPublicRoute && currentPath !== "/") {
      navigate("/dashboard");
    } else if (!user && isDashboardRoute) {
      navigate("/login");
    }
  }, [user, navigate, isInitialized]);

  const contextValue = {
    current: user,
    login,
    logout,
    register,
    isInitialized,
    isAuthenticated: !!user
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>
      {props.children}
    </UserContext.Provider>
  );
}
