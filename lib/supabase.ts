import {createClient} from "@supabase/supabase-js";
import {auth} from "@clerk/nextjs/server";

export const createSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in `.env`."
        );
    }

    return createClient(url, anonKey, {
        async accessToken() {
            // Public pages (like `/`) may run without a signed-in user.
            // Clerk returns `null` in that case; Supabase expects `undefined`.
            try {
                const token = await (await auth()).getToken();
                return token ?? undefined;
            } catch {
                return undefined;
            }
        },
    });
}

