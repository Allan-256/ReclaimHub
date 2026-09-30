import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  // Support legacy plain-text passwords by falling back to direct comparison
  // (Once all users have hashes, remove the legacy branch.)
  if (!hash.startsWith("$2")) {
    return plain === hash;
  }
  return bcrypt.compare(plain, hash);
}
