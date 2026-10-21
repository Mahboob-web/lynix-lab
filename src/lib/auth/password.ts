import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Used when the email doesn't exist, so response time doesn't reveal which accounts exist.
const DUMMY_HASH = "$2b$12$R0Sz8B3eGFuZU0NKRg7nAuvT.Ti/5zsxHyUXRasKb3t4265Tt.ZOC";

export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);

export async function verifyPassword(plain: string, hash: string | null | undefined) {
  const ok = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return Boolean(hash) && ok;
}
