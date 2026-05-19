import type { Lang } from "../i18n/ui";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: Lang;
  ip?: string;
  userAgent?: string;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const wrapper = (inner: string, title: string) => /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
  </head>
  <body style="margin:0;background:#0a0a0a;color:#f5f5f5;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#141414;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:24px 28px;border-bottom:1px solid #1f1f1f;">
            <p style="margin:0;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">
              oyoke<span style="color:#a78bfa;">.</span>dev
            </p>
          </td></tr>
          <tr><td style="padding:28px;">${inner}</td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #1f1f1f;font-size:11px;color:#6b6b6b;font-family:ui-monospace,SFMono-Regular,monospace;">
            Sent from oyoke.dev — built with Astro.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export function buildNotificationEmail(payload: ContactPayload) {
  const { name, email, subject, message, lang, ip, userAgent } = payload;

  const meta = [
    ["Name", esc(name)],
    ["Email", `<a href="mailto:${esc(email)}" style="color:#a78bfa;">${esc(email)}</a>`],
    ["Subject", esc(subject)],
    ["Language", lang.toUpperCase()],
    ...(ip ? [["IP", esc(ip)]] : []),
    ...(userAgent ? [["User-Agent", esc(userAgent.slice(0, 160))]] : []),
  ];

  const metaRows = meta
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;font-size:12px;color:#8a8a8a;font-family:ui-monospace,SFMono-Regular,monospace;width:110px;vertical-align:top;">${k}</td><td style="padding:6px 0;font-size:14px;color:#f5f5f5;">${v}</td></tr>`
    )
    .join("");

  const inner = /* html */ `
    <p style="margin:0 0 4px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">/ New contact</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#fff;">${esc(subject)}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1f1f1f;border-bottom:1px solid #1f1f1f;margin-bottom:20px;">
      ${metaRows}
    </table>

    <p style="margin:0 0 8px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;">Message</p>
    <div style="font-size:15px;line-height:1.6;color:#e5e5e5;white-space:pre-wrap;">${esc(message)}</div>

    <p style="margin:24px 0 0;font-size:12px;color:#8a8a8a;">
      Reply directly to this email — it will reach ${esc(email)}.
    </p>
  `;

  const text = [
    `New contact form submission`,
    ``,
    `Subject: ${subject}`,
    `From:    ${name} <${email}>`,
    `Lang:    ${lang.toUpperCase()}`,
    ...(ip ? [`IP:      ${ip}`] : []),
    ``,
    `---`,
    message,
    `---`,
    ``,
    `Reply directly to this email to reach ${email}.`,
  ].join("\n");

  return {
    subject: `[oyoke.dev] ${subject}`,
    html: wrapper(inner, `New contact — ${subject}`),
    text,
  };
}

export function buildConfirmationEmail(payload: ContactPayload) {
  const { name, subject, message, lang } = payload;

  const strings = {
    en: {
      preheader: "Thanks for reaching out — I'll get back to you soon.",
      eyebrow: "/ Message received",
      heading: `Thanks, ${name}.`,
      body: "I've received your message and I'll get back to you as soon as I can — usually within a couple of days.",
      copyLabel: "Here's a copy of what you sent:",
      subjectLabel: "Subject",
      messageLabel: "Message",
      meanwhile: "In the meantime, feel free to check the latest projects:",
      cta: "See projects →",
      ctaUrl: "https://oyoke.dev/projects",
      sign: "oyoke.dev",
    },
    es: {
      preheader: "Gracias por escribir — te respondo pronto.",
      eyebrow: "/ Mensaje recibido",
      heading: `Gracias, ${name}.`,
      body: "He recibido tu mensaje y te responderé lo antes posible — normalmente en un par de días.",
      copyLabel: "Aquí va una copia de lo que enviaste:",
      subjectLabel: "Asunto",
      messageLabel: "Mensaje",
      meanwhile: "Mientras tanto, échale un vistazo a los últimos proyectos:",
      cta: "Ver proyectos →",
      ctaUrl: "https://oyoke.dev/es/projects",
      sign: "oyoke.dev",
    },
  }[lang];

  const inner = /* html */ `
    <span style="display:none!important;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;mso-hide:all;">${esc(strings.preheader)}</span>

    <p style="margin:0 0 4px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a8a;">${esc(strings.eyebrow)}</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#fff;">${esc(strings.heading)}</h1>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d4d4d4;">${esc(strings.body)}</p>

    <p style="margin:0 0 10px;font-size:13px;color:#a3a3a3;">${esc(strings.copyLabel)}</p>
    <div style="border:1px solid #1f1f1f;border-radius:8px;padding:16px;background:#0a0a0a;">
      <p style="margin:0 0 6px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;color:#8a8a8a;">${esc(strings.subjectLabel)}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#f5f5f5;">${esc(subject)}</p>
      <p style="margin:0 0 6px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;color:#8a8a8a;">${esc(strings.messageLabel)}</p>
      <div style="font-size:14px;line-height:1.6;color:#e5e5e5;white-space:pre-wrap;">${esc(message)}</div>
    </div>

    <p style="margin:28px 0 12px;font-size:14px;color:#d4d4d4;">${esc(strings.meanwhile)}</p>
    <p style="margin:0;">
      <a href="${strings.ctaUrl}" style="display:inline-block;background:#f5f5f5;color:#0a0a0a;text-decoration:none;font-weight:500;font-size:13px;padding:10px 16px;border-radius:6px;">${esc(strings.cta)}</a>
    </p>

    <p style="margin:28px 0 0;font-size:13px;color:#a3a3a3;">${esc(strings.sign)}</p>
  `;

  const text = [
    strings.heading,
    "",
    strings.body,
    "",
    `${strings.subjectLabel}: ${subject}`,
    "",
    `${strings.messageLabel}:`,
    message,
    "",
    strings.sign,
    "oyoke.dev",
  ].join("\n");

  return {
    subject: lang === "es" ? `He recibido tu mensaje · oyoke.dev` : `Got your message · oyoke.dev`,
    html: wrapper(inner, strings.heading),
    text,
  };
}
