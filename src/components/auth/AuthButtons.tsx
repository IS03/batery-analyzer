"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function AuthButtons() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setEmail(session?.user?.email ?? null);
      
      // Upsert profile al loguear
      if (session?.user) {
        try {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            email: session.user.email,
            display_name: session.user.user_metadata?.name ?? null,
          });
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      {email ? (
        <>
          <span className="opacity-70">{email}</span>
          <button onClick={signOut} disabled={loading} className="px-3 py-1 rounded-xl bg-neutral-900 text-white">Salir</button>
        </>
      ) : (
        <button onClick={signIn} disabled={loading} className="px-3 py-1 rounded-xl bg-neutral-900 text-white">Entrar con Google</button>
      )}
    </div>
  );
}
