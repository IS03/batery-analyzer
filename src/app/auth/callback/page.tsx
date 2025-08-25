"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
        console.error(e);
        alert("No se pudo completar el login");
      } finally {
        router.replace("/");
      }
    };
    run();
  }, [router]);

  return <p className="p-6">Procesando inicio de sesión…</p>;
}
