import { z } from "zod";
import { siteConfig } from "@/config/site";

/** Shared by the browser form (instant feedback) and the API route (the real check). */
const serviceNames = siteConfig.services.map((s) => s.name);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100, "Keep your name under 100 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address, like name@company.com.").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\d\s-]*$/, "Use digits, spaces, +, ( ) or - only.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  company: optionalText(120),
  service: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || serviceNames.includes(v), "Choose a service from the list."),
  budget: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || siteConfig.contactForm.budgets.includes(v), "Choose a budget from the list."),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(4000, "Keep your message under 4,000 characters."),
  consent: z.literal(true, { error: "Please agree to the privacy policy so we can reply." }),
  // Spam traps: a hidden field bots fill in, and the time the form was rendered.
  website: z.string().max(500).optional(),
  startedAt: z.coerce.number().int().positive(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const fieldErrors = (error: z.ZodError) => {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};
