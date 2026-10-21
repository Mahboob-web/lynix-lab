import "server-only";
import { env } from "@/lib/env";

/**
 * Optional: POST new leads to an automation webhook (n8n, Make, Zapier, Slack workflow…).
 * Set LEAD_WEBHOOK_URL to enable. Only non-sensitive summary fields are sent.
 */
export async function notifyNewLead(lead: { id: string; name: string; email: string; serviceInterest: string | null; budget: string | null; createdAt: Date }) {
  if (!env.LEAD_WEBHOOK_URL) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "lead.created", lead }),
      signal: controller.signal,
    });
  } catch (err) {
    console.error("[notify] lead webhook failed", err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(timer);
  }
}
