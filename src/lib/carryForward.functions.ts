import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Carry forward incomplete tasks from previous days into today.
 * Idempotent: uses profiles.last_carry_date to skip if already run today.
 */
export const carryForwardTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const { data: profile } = await supabase
      .from("profiles")
      .select("last_carry_date")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.last_carry_date === today) {
      return { carried: 0, skipped: true };
    }

    const { data: updated, error } = await supabase
      .from("tasks")
      .update({ due_date: today, carried: true })
      .eq("user_id", userId)
      .eq("completed", false)
      .lt("due_date", today)
      .select("id");

    if (error) throw error;

    await supabase
      .from("profiles")
      .upsert({ id: userId, last_carry_date: today }, { onConflict: "id" });

    return { carried: updated?.length ?? 0, skipped: false };
  });
