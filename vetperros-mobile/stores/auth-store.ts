import { create } from "zustand";
import { api, registerSignOutCallback } from "@/lib/api/client";
import { getItem, setItem, deleteItem } from "@/lib/storage";

type UserRole = "OWNER" | "WALKER" | "VET" | "CLINIC" | "ADMIN";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
};

type AuthState = {
  session: SessionUser | null;
  loading: boolean;
  loadSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  // When API returns 401, clear session so _layout redirects to signin
  registerSignOutCallback(() => set({ session: null }));

  return {
  session: null,
  loading: true,

  loadSession: async () => {
    try {
      const userJson = await getItem("session_user");
      const token = await getItem("session_token");
      if (userJson && token) {
        set({ session: JSON.parse(userJson), loading: false });
      } else {
        set({ session: null, loading: false });
      }
    } catch {
      set({ session: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      const res = await api.post("/mobile/auth/signin", { email, password });
      const { token, user } = res.data;

      await setItem("session_token", token);
      await setItem("session_user", JSON.stringify(user));

      set({ session: user });
      return {};
    } catch (err: any) {
      const message = err.response?.data?.error ?? "Error al iniciar sesión";
      return { error: message };
    }
  },

  signOut: async () => {
    await deleteItem("session_token");
    await deleteItem("session_user");
    set({ session: null });
  },
  };
});
