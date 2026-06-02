import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authLogin, authLogout, authMe, type AuthMeUser } from "@/lib/auth.functions";

export type AppRole = "admin" | "member" | "viewer";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  canMutate: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function userToProfile(user: AuthMeUser): Profile {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    job_title: user.job_title,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = async () => {
    const me = await authMe();
    if (!me) {
      setProfile(null);
      setRoles([]);
      return;
    }
    setProfile(userToProfile(me.user));
    setRoles(me.user.roles);
  };

  useEffect(() => {
    loadMe().finally(() => setIsLoading(false));
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (rs: AppRole[]) => rs.some((r) => roles.includes(r));

  const value: AuthState = {
    isLoading,
    isAuthenticated: !!profile,
    user: profile ? { id: profile.id, email: profile.email } : null,
    profile,
    roles,
    hasRole,
    hasAnyRole,
    canMutate: hasAnyRole(["admin", "member"]),
    signIn: async (email, password) => {
      try {
        const result = await authLogin({ data: { email, password } });
        setProfile(userToProfile(result.user));
        setRoles(result.roles);
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Login failed" };
      }
    },
    signUp: async () => ({
      error: "Sign up is disabled. Ask an admin to invite you from Team settings.",
    }),
    signOut: async () => {
      await authLogout();
      setProfile(null);
      setRoles([]);
    },
    refresh: loadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
