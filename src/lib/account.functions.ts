import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidCpf, onlyDigits } from "./cpf";

const ProfileInput = z.object({
  fullName: z.string().trim().min(2).max(80),
  cpf: z.string().trim().min(11).max(14),
});

/** Cria/atualiza o perfil do cliente logado, guardando o CPF apenas como hash. */
export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileInput.parse(input))
  .handler(async ({ data, context }) => {
    const digits = onlyDigits(data.cpf);
    if (!isValidCpf(digits)) throw new Error("CPF inválido.");

    const { hashCpf } = await import("./account.server");
    const email = (context.claims["email"] as string | undefined) ?? "";

    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        email,
        full_name: data.fullName,
        cpf_hash: hashCpf(digits),
        cpf_last3: digits.slice(-3),
      },
      { onConflict: "id" },
    );
    if (error) {
      if (error.code === "23505") throw new Error("Este CPF já está cadastrado.");
      throw new Error("Não foi possível salvar seus dados.");
    }
    return { ok: true };
  });

/** Registra o aceite da política de trocas e devoluções. */
export const acceptPolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ version: z.string().min(1).max(20) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("policy_acceptances")
      .insert({ user_id: context.userId, policy_version: data.version });
    if (error) throw new Error("Não foi possível registrar o aceite.");
    return { ok: true };
  });
