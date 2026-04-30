import { supabase } from "../lib/supabaseClient";

export async function validateInviteCode(code: string): Promise<boolean> {
	const { data, error } = await supabase.functions.invoke<{ valid: boolean }>(
		"validate_invite_code",
		{ body: { code } },
	);

	if (error) throw error;
	return data?.valid ?? false;
}

//TODO: restrict allowed origin to vercel domain in validate_invite_code function
export async function sendMagicLink(email: string): Promise<void> {
	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: { emailRedirectTo: window.location.origin },
	});
	if (error) throw error;
}
