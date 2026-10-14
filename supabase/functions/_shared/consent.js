// GENERATED FILE - do not edit. Source: src/lib/consentServer.ts
// Rebuild with: node scripts/build-functions.mjs (npm run build:functions)

// src/config/consent.ts
var CONSENT_NOTICE_VERSION = "2026-10-14";
var CONSENT_TOKEN_TTL_DAYS = 7;
var UNDER_AGE_COOLDOWN_MS = 24 * 60 * 60 * 1e3;

// src/config/contact.ts
var SUPPORT_EMAIL = "support@daanik.com";

// src/config/age.ts
var MIN_AGE = 13;
var ADULT_AGE = 18;
var ADMITS_MINORS = MIN_AGE < ADULT_AGE;

// src/lib/ageBand.ts
var OLDEST_BIRTH_YEAR_OFFSET = 100;
function ageInYear(birthYear, currentYear) {
  return currentYear - birthYear;
}
function isPlausibleBirthYear(birthYear, currentYear) {
  return typeof birthYear === "number" && Number.isInteger(birthYear) && birthYear <= currentYear && birthYear >= currentYear - OLDEST_BIRTH_YEAR_OFFSET;
}
function isAdultBirthYear(birthYear, currentYear) {
  return isPlausibleBirthYear(birthYear, currentYear) && ageInYear(birthYear, currentYear) > ADULT_AGE;
}

// src/lib/consentServer.ts
var CONSENT_ERROR_STATUS = {
  unauthorized: 401,
  bad_request: 400,
  invalid_email: 400,
  not_pending: 409,
  rate_limited: 429,
  email_not_configured: 503,
  email_failed: 502,
  invalid_token: 404,
  expired: 410,
  used: 409,
  not_adult: 422,
  declaration_required: 422,
  invalid_name: 422,
  server_error: 500
};
var DEFAULT_MESSAGES = {
  unauthorized: "Please sign in again.",
  bad_request: "The request was not understood.",
  invalid_email: "Please enter a valid parent or guardian email address.",
  not_pending: "This account is not waiting for parental consent.",
  rate_limited: "Please wait a little before sending another email.",
  email_not_configured: "Parent emails are not set up on this server yet.",
  email_failed: "The email could not be sent. Please try again later.",
  invalid_token: "This link is not valid any more. Please use the newest email from BHAO.",
  expired: "This link has expired. Ask your child to send a new request from the app.",
  used: "This link has already been used.",
  not_adult: "The parent or guardian must be an adult (18 or older).",
  declaration_required: "Please confirm that you are the parent or lawful guardian.",
  invalid_name: "Please enter your full name (2-100 characters).",
  server_error: "Something went wrong. Please try again."
};
function consentError(code, message, retryAfterSeconds) {
  const body = { ok: false, error: code, message: message ?? DEFAULT_MESSAGES[code] };
  if (retryAfterSeconds !== void 0) body.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  return { status: CONSENT_ERROR_STATUS[code], body };
}
function tokenStateError(state) {
  if (state === "valid") return null;
  if (state === "expired") return "expired";
  if (state === "used") return "used";
  return "invalid_token";
}
var MAX_BODY_BYTES = 4096;
var CONSENT_LANGS = ["en", "hi", "hinglish"];
function isConsentLang(v) {
  return typeof v === "string" && CONSENT_LANGS.includes(v);
}
var CONSENT_ACTIONS = ["request", "view", "approve", "decline", "withdraw_view", "withdraw"];
function isConsentAction(v) {
  return typeof v === "string" && CONSENT_ACTIONS.includes(v);
}
var EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/;
function normalizeEmail(raw) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  const local = email.slice(0, email.lastIndexOf("@"));
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  return email;
}
function maskEmail(email) {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email.charAt(0)}***@${email.slice(at + 1)}`;
}
function hasControlChars(s) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 32 || c === 127) return true;
  }
  return false;
}
function normalizeParentName(raw) {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 100 || hasControlChars(name)) return null;
  return name;
}
function istYear(now) {
  return new Date(now.getTime() + 330 * 6e4).getUTCFullYear();
}
function validateApproveBody(body, currentYear) {
  if (!isTokenFormat(body.token)) return { ok: false, error: "invalid_token" };
  if (typeof body.parentName !== "string" || typeof body.noticeVersion !== "string" || body.lang !== void 0 && !isConsentLang(body.lang)) {
    return { ok: false, error: "bad_request" };
  }
  if (body.noticeVersion !== CONSENT_NOTICE_VERSION) {
    return { ok: false, error: "bad_request", message: "The consent notice has changed. Please reload the page." };
  }
  if (body.declaration !== true) return { ok: false, error: "declaration_required" };
  const parentName = normalizeParentName(body.parentName);
  if (!parentName) return { ok: false, error: "invalid_name" };
  if (!isAdultBirthYear(body.parentBirthYear, currentYear)) return { ok: false, error: "not_adult" };
  return {
    ok: true,
    value: {
      token: body.token,
      parentName,
      parentBirthYear: body.parentBirthYear,
      noticeVersion: body.noticeVersion,
      lang: isConsentLang(body.lang) ? body.lang : "en"
    }
  };
}
function bytesToBase64Url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function generateToken() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}
function isTokenFormat(v) {
  return typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
}
async function sha256Hex(text) {
  return bytesToHex(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}
async function hmacSha256Hex(key, text) {
  const k = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToHex(await globalThis.crypto.subtle.sign("HMAC", k, new TextEncoder().encode(text)));
}
function firstForwardedIp(header) {
  if (!header) return null;
  const ip = header.split(",")[0].trim();
  return ip && ip.length <= 64 && /^[0-9A-Fa-f:.]+$/.test(ip) ? ip : null;
}
function siteBase(url) {
  const s = (url ?? "").trim().replace(/\/+$/, "");
  return /^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/.test(s) ? s : null;
}
function buildApproveUrl(site, token) {
  return `${site}/parent-consent?token=${encodeURIComponent(token)}`;
}
function buildWithdrawUrl(site, token) {
  return `${site}/parent-consent/withdraw?token=${encodeURIComponent(token)}`;
}
function isDevSupabaseUrl(url) {
  try {
    const host = new URL(url ?? "").hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "kong" || host === "host.docker.internal";
  } catch {
    return false;
  }
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MONTHS_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
function formatIstDate(date, lang) {
  const d = new Date(date.getTime() + 330 * 6e4);
  const months = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function render(sections) {
  const html = sections.map(({ lang, blocks }) => {
    const inner = blocks.map((b) => "p" in b ? `<p style="margin:0 0 14px;line-height:1.5">${escapeHtml(b.p)}</p>` : `<p style="margin:0 0 14px"><a href="${escapeHtml(b.link)}" style="display:inline-block;background:#1f6f43;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${escapeHtml(b.label)}</a><br><span style="font-size:12px;color:#555;word-break:break-all">${escapeHtml(b.link)}</span></p>`).join("\n");
    return `<div lang="${lang}" style="margin:0 0 24px">
${inner}
</div>`;
  }).join('\n<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">\n');
  const text = sections.map(({ blocks }) => blocks.map((b) => "p" in b ? b.p : `${b.label}: ${b.link}`).join("\n\n")).join("\n\n----------------------------------------\n\n");
  return {
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:16px">
${html}
</body></html>`,
    text: text + "\n"
  };
}
function buildConsentRequestEmail({ approveUrl, withdrawUrl, expiresAt }) {
  const en = formatIstDate(expiresAt, "en");
  const hi = formatIstDate(expiresAt, "hi");
  const { html, text } = render([
    {
      lang: "en",
      blocks: [
        { p: "Hello," },
        { p: "BHAO is a card game that teaches young Indians how money works: saving, investing, loans and avoiding debt traps. A player who says they are your child (aged 13 to 17) has created a BHAO account and asked for your permission to use it." },
        { p: `India's Digital Personal Data Protection Act, 2023 asks us to get a parent's or guardian's consent before we keep a child's data. Until you agree, the account is paused: nothing they play is saved and their chosen name is not stored.` },
        { p: `To allow the account, open this link and fill in the short form. The link works once and expires on ${en} (${CONSENT_TOKEN_TTL_DAYS} days).` },
        { link: approveUrl, label: "Review and give consent" },
        { p: "You can delete the account and its data at any time, now or later, with this link:" },
        { link: withdrawUrl, label: "Delete the account" },
        { p: `If you don't know this child, please ignore this email. Without your consent the account stays paused.` },
        { p: `Questions or complaints (grievance contact): ${SUPPORT_EMAIL}` }
      ]
    },
    {
      lang: "hi",
      blocks: [
        { p: "नमस्ते," },
        { p: "BHAO एक कार्ड गेम है जो युवा भारतीयों को पैसे की समझ सिखाता है: बचत, निवेश, लोन और कर्ज़ के जाल से बचना। एक खिलाड़ी ने, जो कहता है कि वह आपका बच्चा है (उम्र 13 से 17 साल), BHAO पर खाता बनाया है और उसे इस्तेमाल करने के लिए आपकी अनुमति माँगी है।" },
        { p: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के अनुसार किसी बच्चे का डेटा रखने से पहले हमें माता-पिता या अभिभावक की सहमति लेनी होती है। आपकी सहमति तक खाता रुका रहेगा: खेल का कुछ भी सेव नहीं होगा और बच्चे का चुना हुआ नाम नहीं रखा जाएगा।" },
        { p: `खाते की अनुमति देने के लिए यह लिंक खोलें और छोटा सा फ़ॉर्म भरें। लिंक एक ही बार काम करेगा और ${hi} को (${CONSENT_TOKEN_TTL_DAYS} दिन में) समाप्त हो जाएगा।` },
        { link: approveUrl, label: "देखें और सहमति दें" },
        { p: "आप कभी भी, अभी या बाद में, इस लिंक से खाता और उसका डेटा मिटा सकते हैं:" },
        { link: withdrawUrl, label: "खाता मिटाएँ" },
        { p: "अगर आप इस बच्चे को नहीं जानते, तो कृपया इस ईमेल को अनदेखा करें। आपकी सहमति के बिना खाता रुका ही रहेगा।" },
        { p: `सवाल या शिकायत (शिकायत अधिकारी): ${SUPPORT_EMAIL}` }
      ]
    }
  ]);
  return {
    subject: "BHAO: your child asks for your consent | आपका बच्चा आपकी सहमति माँग रहा है",
    html,
    text
  };
}
function buildConsentConfirmationEmail({ withdrawUrl, consentedAt }) {
  const { html, text } = render([
    {
      lang: "en",
      blocks: [
        { p: "Hello," },
        { p: `Thank you. You gave consent for your child's BHAO account on ${formatIstDate(consentedAt, "en")}. The account is now active.` },
        { p: "For players under 18, BHAO keeps child-safe limits: they are not shown on the public leaderboard, they can only play in private invite-code rooms, and we do not track or profile them for advertising." },
        { p: "You can withdraw your consent at any time. This deletes the account and its data:" },
        { link: withdrawUrl, label: "Withdraw consent and delete the account" },
        { p: `Questions or complaints (grievance contact): ${SUPPORT_EMAIL}` }
      ]
    },
    {
      lang: "hi",
      blocks: [
        { p: "नमस्ते," },
        { p: `धन्यवाद। आपने ${formatIstDate(consentedAt, "hi")} को अपने बच्चे के BHAO खाते के लिए सहमति दी। खाता अब चालू है।` },
        { p: "18 साल से कम उम्र के खिलाड़ियों के लिए BHAO सुरक्षित सीमाएँ रखता है: वे सार्वजनिक लीडरबोर्ड पर नहीं दिखते, केवल निजी इनवाइट-कोड रूम में खेल सकते हैं, और हम विज्ञापन के लिए उन्हें ट्रैक या प्रोफ़ाइल नहीं करते।" },
        { p: "आप कभी भी अपनी सहमति वापस ले सकते हैं। इससे खाता और उसका डेटा मिट जाएगा:" },
        { link: withdrawUrl, label: "सहमति वापस लें और खाता मिटाएँ" },
        { p: `सवाल या शिकायत (शिकायत अधिकारी): ${SUPPORT_EMAIL}` }
      ]
    }
  ]);
  return {
    subject: "BHAO: consent recorded | सहमति दर्ज हो गई",
    html,
    text
  };
}
export {
  CONSENT_ACTIONS,
  CONSENT_ERROR_STATUS,
  CONSENT_LANGS,
  CONSENT_NOTICE_VERSION,
  CONSENT_TOKEN_TTL_DAYS,
  MAX_BODY_BYTES,
  SUPPORT_EMAIL,
  buildApproveUrl,
  buildConsentConfirmationEmail,
  buildConsentRequestEmail,
  buildWithdrawUrl,
  consentError,
  escapeHtml,
  firstForwardedIp,
  formatIstDate,
  generateToken,
  hmacSha256Hex,
  isConsentAction,
  isConsentLang,
  isDevSupabaseUrl,
  isTokenFormat,
  istYear,
  maskEmail,
  normalizeEmail,
  normalizeParentName,
  sha256Hex,
  siteBase,
  tokenStateError,
  validateApproveBody
};
