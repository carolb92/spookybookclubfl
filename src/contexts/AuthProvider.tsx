import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => listener.subscription.unsubscribe();
	}, []);

	return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
}
