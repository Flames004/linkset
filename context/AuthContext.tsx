// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 Auth Context: Setting up auth listener");

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("🔥 Auth State Changed:", user ? "USER FOUND" : "NO USER");
        console.log(
          "🔥 User details:",
          user ? { uid: user.uid, email: user.email } : "null"
        );

        setUser(user);
        setIsLoading(false);
      },
      (error) => {
        console.error("🔥 Auth State Change Error:", error);
        setIsLoading(false);
      }
    );

    return () => {
      console.log("🔥 Auth Context: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
