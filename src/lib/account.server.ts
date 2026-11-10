import { createHash } from "node:crypto";

/** Hash irreversível do CPF (nunca guardamos o número em texto). */
export function hashCpf(cpfDigits: string): string {
  const pepper = process.env["CPF_PEPPER"] ?? "";
  return createHash("sha256").update(`${cpfDigits}:${pepper}`).digest("hex");
}
