import { supabase } from "@/lib/supabase/client";
import { readLocal, writeLocal, LocalReport } from "./storage";

export async function syncNow() {
  const { data: s } = await supabase.auth.getSession();
  const user = s.session?.user;
  if (!user) throw new Error("No autenticado");

  // 1) Pull remoto (RLS ya filtra por user)
  const { data: remote, error: selErr } = await supabase
    .from("reports")
    .select("*")
    .order("updated_at", { ascending: false });

  if (selErr) {
    console.error("Select error:", selErr);
    throw new Error(selErr.message || "No se pudo leer reports");
  }

  const local = readLocal();
  const byId = new Map<string, LocalReport>();
  remote?.forEach((r: any) => {
    byId.set(r.id, {
      id: r.id,
      title: r.title ?? undefined,
      payload: r.payload,
      source: r.source ?? undefined,
      device_model: r.device_model ?? undefined,
      quality_class: r.quality_class ?? undefined,
      local_rev: r.local_rev ?? "remote",
      updated_at: r.updated_at,
    });
  });

  const merged: LocalReport[] = [];
  const upserts: any[] = [];

  for (const lr of local) {
    if (lr.id && byId.has(lr.id)) {
      const rr = byId.get(lr.id)!;
      const needsPush = !lr.updated_at || lr.local_rev !== rr.local_rev;
      if (needsPush) {
        upserts.push({
          id: lr.id,
          user_id: user.id,            // ✅ clave para RLS
          title: lr.title ?? null,
          payload: lr.payload,
          source: lr.source ?? null,
          device_model: lr.device_model ?? null,
          quality_class: lr.quality_class ?? null,
          local_rev: lr.local_rev,
        });
        merged.push({ ...lr });
        byId.delete(lr.id);
      } else {
        merged.push(rr);
        byId.delete(lr.id);
      }
    } else {
      // crear en remoto
      upserts.push({
        user_id: user.id,              // ✅ clave para RLS
        title: lr.title ?? null,
        payload: lr.payload,
        source: lr.source ?? null,
        device_model: lr.device_model ?? null,
        quality_class: lr.quality_class ?? null,
        local_rev: lr.local_rev,
      });
      merged.push({ ...lr });
    }
  }

  for (const rr of byId.values()) merged.push(rr);

  if (upserts.length) {
    const { error: upErr } = await supabase
      .from("reports")
      .upsert(upserts, { onConflict: "id" });

    if (upErr) {
      console.error("Upsert error:", upErr);
      throw new Error(upErr.message || "No se pudo sincronizar reports");
    }
  }

  writeLocal(merged);
  return { count: merged.length };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
