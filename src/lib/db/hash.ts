import { createHash, randomBytes } from "crypto";

/** Simple SHA-256 password hash (demo only — use bcrypt in production). */
export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

/** Generate a random session token. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
