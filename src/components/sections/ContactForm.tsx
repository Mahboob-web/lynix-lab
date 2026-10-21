"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { contactSchema, fieldErrors } from "@/lib/validation/contact";
import { Button } from "@/components/ui/Button";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function ContactForm({ defaultService = "", defaultMessage = "" }: { defaultService?: string; defaultMessage?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(fd.entries()),
      consent: fd.get("consent") === "on",
      startedAt: startedAt.current,
    };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setStatus({ kind: "error", message: "Some fields need attention." });
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && body.ok) {
        setStatus({ kind: "sent" });
        formRef.current?.reset();
        return;
      }
      if (body.fields) setErrors(body.fields);
      setStatus({ kind: "error", message: body.error ?? "Your message wasn't sent. Please try again." });
    } catch {
      setStatus({ kind: "error", message: `Your message wasn't sent because the connection failed. Check your internet and try again, or email ${siteConfig.contact.email}.` });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="border border-graphite bg-white p-8">
        <span aria-hidden className="flex gap-1">
          <span className="size-4 bg-lime ring-1 ring-graphite" />
          <span className="size-4 bg-graphite" />
        </span>
        <h2 className="mt-6 text-2xl font-bold">Message sent</h2>
        <p className="mt-2 text-muted">{siteConfig.contactForm.successMessage}</p>
        <button type="button" className="mt-6 font-semibold underline decoration-lime decoration-2 underline-offset-4" onClick={() => setStatus({ kind: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-danger">
        {errors[name]}
      </p>
    ) : null;
  const a11y = (name: string) => ({ "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" autoComplete="name" required maxLength={100} className="field" {...a11y("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} className="field" {...a11y("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="phone" className="label">
          Phone or WhatsApp <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} className="field" {...a11y("phone")} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="company" className="label">
          Company <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="company" name="company" autoComplete="organization" maxLength={120} className="field" {...a11y("company")} />
        {err("company")}
      </div>
      <div>
        <label htmlFor="service" className="label">
          Service you&apos;re interested in
        </label>
        <select id="service" name="service" defaultValue={defaultService} className="field" {...a11y("service")}>
          <option value="">Not sure yet</option>
          {siteConfig.pillars.map((p) => (
            <optgroup key={p.id} label={p.name}>
              {siteConfig.services
                .filter((s) => s.pillar === p.id)
                .map((s) => (
                  <option key={s.slug} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {err("service")}
      </div>
      <div>
        <label htmlFor="budget" className="label">
          Budget
        </label>
        <select id="budget" name="budget" defaultValue="" className="field" {...a11y("budget")}>
          <option value="">Prefer not to say</option>
          {siteConfig.contactForm.budgets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {err("budget")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">
          What do you want to build, automate or launch?
        </label>
        <textarea id="message" name="message" rows={6} required maxLength={4000} defaultValue={defaultMessage} className="field resize-y" {...a11y("message")} />
        {err("message")}
      </div>

      {/* Honeypot: hidden from people and assistive tech, often filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" className="mt-1 size-4 accent-graphite" {...a11y("consent")} />
          <span className="text-[0.98rem]">
            I agree that {siteConfig.name} may store these details to reply to my enquiry, as described in the{" "}
            <Link href="/privacy-policy" className="font-semibold underline decoration-lime decoration-2 underline-offset-2">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {err("consent")}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <Button type="submit" variant="dark" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </Button>
        <p aria-live="polite" className={`text-sm font-medium ${status.kind === "error" ? "text-danger" : "text-muted"}`}>
          {status.kind === "error" ? status.message : siteConfig.contact.responseTime}
        </p>
      </div>
    </form>
  );
}
