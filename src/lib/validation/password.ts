import { z } from "zod";

/** Password policy for CRM users: length beats complexity, but require a letter and a number. */
export const passwordRule = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Use letters and at least one number.");
