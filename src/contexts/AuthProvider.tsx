import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Seed the session from storage so children never mount with session=null
		// when the user is already logged in.
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setIsReady(true);
		});

		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => listener.subscription.unsubscribe();
	}, []);

	if (!isReady) return null;

	return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
}
