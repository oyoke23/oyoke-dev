import type { APIRoute } from "astro";
import { Resend } from "resend";
import type { Lang } from "../../i18n/ui";
import {
  buildConfirmationEmail,
  buildNotificationEmail,
  type ContactPayload,
} from "../../lib/contact-emails";
import { rateLimit } from "../../lib/rate-limit";

export const prerender = false;

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

interface FormBody {
  name: unknown;
  email: unknown;
  subject: unknown;
  message: unknown;
  company: unknown;
  lang: unknown;
}

const labels = {
  en: {
    rateLimited: "Too many requests. Try again later.",
    invalid: "Please fill in every field with valid data.",
    serverError: "Something went wrong sending your message. Please email me directly.",
    sent: "Message sent. I'll get back to you shortly.",
  },
  es: {
    rateLimited: "Demasiadas peticiones. Inténtalo más tarde.",
    invalid: "Rellena todos los campos con datos válidos.",
    serverError: "Algo falló al enviar tu mensaje. Escríbeme directamente por email.",
    sent: "Mensaje enviado. Te respondo pronto.",
  },
} satisfies Record<Lang, Record<string, string>>;

function pickLang(input: unknown): Lang {
  return input === "es" ? "es" : "en";
}

function isString(v: unknown, min = 1, max = 5000): v is string {
  return typeof v === "string" && v.trim().length >= min && v.trim().length <= max;
}

function isEmail(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const t = v.trim();
  if (t.length < 3 || t.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: FormBody;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as FormBody;
    } else {
      const form = await request.formData();
      body = {
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        message: form.get("message"),
        company: form.get("company"),
        lang: form.get("lang"),
      };
    }
  } catch {
    return jsonResponse({ ok: false, error: "Invalid body" }, 400);
  }

  const lang = pickLang(body.lang);
  const t = labels[lang];

  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return jsonResponse({ ok: true, message: t.sent }, 200);
  }

  if (
    !isString(body.name, 1, 200) ||
    !isEmail(body.email) ||
    !isString(body.subject, 1, 200) ||
    !isString(body.message, 1, 5000)
  ) {
    return jsonResponse({ ok: false, error: t.invalid }, 400);
  }

  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rl.allowed) {
    return jsonResponse(
      { ok: false, error: t.rateLimited, retryAfter: rl.retryAfterSeconds },
      429,
      { "Retry-After": String(rl.retryAfterSeconds) }
    );
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL;
  const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;
  const fromName = import.meta.env.CONTACT_FROM_NAME ?? "oyoke.dev";

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("[contact] Missing Resend env vars", {
      hasKey: !!apiKey,
      hasTo: !!toEmail,
      hasFrom: !!fromEmail,
    });
    return jsonResponse({ ok: false, error: t.serverError }, 500);
  }

  const payload: ContactPayload = {
    name: (body.name as string).trim(),
    email: (body.email as string).trim(),
    subject: (body.subject as string).trim(),
    message: (body.message as string).trim(),
    lang,
    ip: ip === "unknown" ? undefined : ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  const notification = buildNotificationEmail(payload);
  const confirmation = buildConfirmationEmail(payload);

  const resend = new Resend(apiKey);
  const from = `${fromName} <${fromEmail}>`;

  try {
    const [notif, confirm] = await Promise.allSettled([
      resend.emails.send({
        from,
        to: toEmail,
        replyTo: payload.email,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      }),
      resend.emails.send({
        from,
        to: payload.email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      }),
    ]);

    if (notif.status === "rejected") {
      console.error("[contact] Notification email failed", notif.reason);
      return jsonResponse({ ok: false, error: t.serverError }, 500);
    }
    if (confirm.status === "rejected") {
      console.warn("[contact] Confirmation email failed", confirm.reason);
    }

    return jsonResponse({ ok: true, message: t.sent }, 200);
  } catch (err) {
    console.error("[contact] Resend threw", err);
    return jsonResponse({ ok: false, error: t.serverError }, 500);
  }
};

export const GET: APIRoute = () => jsonResponse({ ok: false, error: "Method not allowed" }, 405);
