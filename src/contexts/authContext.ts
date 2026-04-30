import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type AuthContextValue = {
	session: Session | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
