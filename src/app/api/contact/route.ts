import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/validation/contact";
import { getDb, isDbConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestMeta, isSameOrigin } from "@/lib/request";
import { audit } from "@/lib/audit";
import { notifyNewLead } from "@/lib/crm/notify";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;
const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

const json = (body: unknown, status = 200, headers?: HeadersInit) => NextResponse.json(body, { status, headers });

export async function POST(request: Request) {
  if (!(await isSameOrigin())) {
    return json({ ok: false, error: "Cross-site requests are not allowed." }, 403);
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Your message is too large." }, 413);
  }
  if (!isDbConfigured()) {
    return json({ ok: false, error: `The form is temporarily unavailable. Please email ${siteConfig.contact.email}.` }, 503);
  }

  let payload: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: "Your message is too large." }, 413);
    payload = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "The form data couldn't be read. Refresh the page and try again." }, 400);
  }

  const { ip, userAgent } = await getRequestMeta();

  try {
    // 5 submissions per IP per 10 minutes, 20 per IP per day.
    const short = await rateLimit(`contact:ip:${ip}`, 5, 600);
    const daily = await rateLimit(`contact:ip-day:${ip}`, 20, 86_400);
    if (!short.allowed || !daily.allowed) {
      const retryAfter = Math.max(short.retryAfter, daily.allowed ? 0 : daily.retryAfter);
      return json({ ok: false, error: "Too many messages from your connection. Please try again later or email us." }, 429, {
        "Retry-After": String(retryAfter),
      });
    }

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      return json({ ok: false, error: "Some fields need attention.", fields: fieldErrors(parsed.error) }, 422);
    }
    const data = parsed.data;

    // Spam traps: pretend success so bots don't learn anything.
    if (data.website || Date.now() - data.startedAt < MIN_FILL_MS) {
      await audit("lead.spam_blocked", { metadata: { reason: data.website ? "honeypot" : "too_fast" } });
      return json({ ok: true });
    }

    const perEmail = await rateLimit(`contact:email:${data.email}`, 3, 3600);
    if (!perEmail.allowed) {
      return json({ ok: false, error: "We've already received your messages. We'll be in touch soon." }, 429, {
        "Retry-After": String(perEmail.retryAfter),
      });
    }

    const db = getDb();
    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.company,
        serviceInterest: data.service,
        budget: data.budget,
        message: data.message,
        consent: true,
        source: "WEBSITE",
        ip,
        userAgent,
        activities: { create: { type: "SYSTEM", content: "Lead created from the website contact form." } },
      },
      select: { id: true, name: true, email: true, serviceInterest: true, budget: true, createdAt: true },
    });
    await audit("lead.create_public", { entityType: "Lead", entityId: lead.id });
    notifyNewLead(lead).catch(() => {});

    return json({ ok: true });
  } catch (err) {
    console.error("[contact] failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: `Something went wrong on our side. Please try again or email ${siteConfig.contact.email}.` }, 500);
  }
}

export function GET() {
  return json({ ok: false, error: "Method not allowed." }, 405, { Allow: "POST" });
}
