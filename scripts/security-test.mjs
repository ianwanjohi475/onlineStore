#!/usr/bin/env node
/**
 * SIR VERT ENTERPRISE — security test suite.
 *
 * Attacks a running copy of the store and checks every defence holds:
 * auth bypass, forged cookies, brute force, CSRF, SQL injection, price
 * tampering, data leaks, IDOR, unsafe uploads and security headers.
 *
 *   # start the app against a throwaway libSQL (Turso) database first:
 *   TURSO_DATABASE_URL=file:/tmp/sv-test.db ADMIN_PASSWORD='Test-Admin-2026' npm start
 *   # then:
 *   BASE=http://localhost:3000 DB=/tmp/sv-test.db ADMIN_PASSWORD='Test-Admin-2026' node scripts/security-test.mjs
 *
 * Never point this at the live site: it creates test accounts and orders.
 */
import { createHmac } from "node:crypto";

const BASE = process.env.BASE || "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const DB = process.env.DB || "";

let pass = 0;
let fail = 0;
const failures = [];
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✘ ${name} ${extra}`); }
};
const section = (t) => console.log(`\n▸ ${t}`);

let ipSeq = 1;
const freshIp = () => `10.9.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`;

async function req(path, { method = "GET", body, cookie, ip = freshIp(), origin, headers = {} } = {}) {
  const h = { ...headers, "x-forwarded-for": ip };
  if (body !== undefined && !(body instanceof FormData)) h["content-type"] = "application/json";
  if (cookie) h.cookie = cookie;
  if (origin) h.origin = origin;
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, headers: res.headers, text, json, setCookie: res.headers.getSetCookie?.() ?? [] };
}
const cookieFrom = (r, name) => {
  const c = r.setCookie.find((x) => x.startsWith(`${name}=`));
  return c ? c.split(";")[0] : null;
};

const rnd = Math.random().toString(36).slice(2, 8);
const emailA = `alice-${rnd}@test.local`;
const emailB = `bob-${rnd}@test.local`;
const goodPw = "Sup3rSecret!pw";

/* ─────────────────────────────────────────────────────────── */
section("Security headers");
{
  const r = await req("/");
  ok("page loads", r.status === 200, r.status);
  for (const h of ["x-content-type-options", "x-frame-options", "referrer-policy", "strict-transport-security", "content-security-policy", "permissions-policy"]) {
    ok(`header ${h}`, !!r.headers.get(h));
  }
  ok("no X-Powered-By leak", !r.headers.get("x-powered-by"));
  const a = await req("/api/auth/me");
  ok("account API is no-store", /no-store/.test(a.headers.get("cache-control") || ""));
}

section("Admin API: no access without a valid session");
{
  const routes = ["orders", "customers", "categories", "testimonials", "settings", "brands", "products"];
  for (const r of routes) {
    const g = await req(`/api/admin/${r}`);
    ok(`GET /api/admin/${r} → 401`, g.status === 401, g.status);
    const p = await req(`/api/admin/${r}`, { method: "PUT", body: {} });
    ok(`PUT /api/admin/${r} → 401`, p.status === 401, p.status);
  }
  const del = await req("/api/admin/orders", { method: "DELETE", body: {} });
  ok("DELETE /api/admin/orders → 401", del.status === 401, del.status);
  const page = await req("/admin");
  ok("/admin redirects to login", page.status === 307 || page.status === 308, page.status);

  // forged cookies
  const future = String(Date.now() + 1e9);
  const forged = [
    "sv_admin=1",
    "sv_admin=true",
    `sv_admin=${future}.AAAAAAAA`,
    `sv_admin=${future}.${createHmac("sha256", "sirvert-dev-secret-change-me").update(future).digest("base64url")}`,
  ];
  for (const c of forged) {
    const r = await req("/api/admin/orders", { cookie: c });
    ok(`forged admin cookie rejected (${c.slice(0, 24)}…)`, r.status === 401, r.status);
  }
}

section("Admin login: brute force + CSRF");
{
  const ip = freshIp();
  let last = 0;
  for (let i = 0; i < 10; i++) last = (await req("/api/admin/login", { method: "POST", body: { password: `wrong-${i}` }, ip })).status;
  ok("repeated wrong passwords are blocked (429)", last === 429, last);
  const x = await req("/api/admin/login", { method: "POST", body: { password: ADMIN_PASSWORD }, origin: "https://evil.example" });
  ok("cross-site admin login blocked (403)", x.status === 403, x.status);
  const w = await req("/api/admin/login", { method: "POST", body: { password: "definitely-wrong" } });
  ok("wrong admin password gives a plain, generic message", w.status === 401 && !/ADMIN_PASSWORD|Vercel|environment/i.test(w.text), w.text);
}

let admin = null;
if (ADMIN_PASSWORD) {
  const r = await req("/api/admin/login", { method: "POST", body: { password: ADMIN_PASSWORD } });
  admin = cookieFrom(r, "sv_admin");
  ok("admin can sign in with the real password", r.status === 200 && !!admin, r.status);
  const c = r.setCookie.find((x) => x.startsWith("sv_admin=")) || "";
  ok("admin cookie is HttpOnly", /httponly/i.test(c));
  ok("admin cookie is SameSite", /samesite=lax|samesite=strict/i.test(c));
  const sess = await req("/api/admin/session", { cookie: admin });
  ok("admin session expires after ≤15 min idle", sess.json?.expiresAt - Date.now() <= 15 * 60 * 1000 + 5000, sess.json?.expiresAt);
  const parts = admin.split("=")[1].split(".");
  const stretched = `sv_admin=${parts[0]}.${Date.now() + 864e5}.${parts[2]}.${parts[3]}`;
  const st = await req("/api/admin/orders", { cookie: stretched });
  ok("can't extend an admin session by editing its expiry", st.status === 401, st.status);
}

section("Customer sign-up validation");
{
  const weak = await req("/api/auth/signup", { method: "POST", body: { name: "Al", email: emailA, password: "123" } });
  ok("short password rejected", weak.status === 400, weak.status);
  const noDigit = await req("/api/auth/signup", { method: "POST", body: { name: "Al", email: emailA, password: "abcdefghij" } });
  ok("password without a number rejected", noDigit.status === 400, noDigit.status);
  const badEmail = await req("/api/auth/signup", { method: "POST", body: { name: "Al", email: "not-an-email", password: goodPw } });
  ok("invalid email rejected", badEmail.status === 400, badEmail.status);
  const csrf = await req("/api/auth/signup", { method: "POST", body: { name: "Al", email: emailA, password: goodPw }, origin: "https://evil.example" });
  ok("cross-site sign-up blocked (403)", csrf.status === 403, csrf.status);
}

let alice;
let bob;
section("Customer accounts");
{
  const a = await req("/api/auth/signup", { method: "POST", body: { name: "<script>alert(1)</script> Alice", email: emailA, phone: "+254 700 000 001", password: goodPw } });
  alice = cookieFrom(a, "sv_session");
  ok("sign-up works (201) and sets a session", a.status === 201 && !!alice, a.status);
  const sc = a.setCookie.find((x) => x.startsWith("sv_session=")) || "";
  ok("session cookie is HttpOnly + SameSite", /httponly/i.test(sc) && /samesite=lax/i.test(sc));
  ok("API never returns the password hash", !/scrypt|password/i.test(a.text));
  ok("responses are JSON (no HTML injection)", (a.headers.get("content-type") || "").includes("application/json"));

  const dup = await req("/api/auth/signup", { method: "POST", body: { name: "Alice", email: emailA.toUpperCase(), password: goodPw } });
  ok("duplicate email (any case) rejected (409)", dup.status === 409, dup.status);

  const b = await req("/api/auth/signup", { method: "POST", body: { name: "Bob", email: emailB, password: goodPw } });
  bob = cookieFrom(b, "sv_session");
  ok("second account created", b.status === 201 && !!bob, b.status);

  const me = await req("/api/auth/me", { cookie: alice });
  ok("/api/auth/me returns the signed-in user", me.json?.user?.email === emailA);

  const wrong = await req("/api/auth/login", { method: "POST", body: { email: emailA, password: "nope-nope-1" } });
  const unknown = await req("/api/auth/login", { method: "POST", body: { email: `ghost-${rnd}@test.local`, password: "nope-nope-1" } });
  ok("wrong password → 401", wrong.status === 401, wrong.status);
  ok("unknown email gives the SAME message (no account probing)", unknown.status === 401 && unknown.json?.error === wrong.json?.error);

  const good = await req("/api/auth/login", { method: "POST", body: { email: emailA.toUpperCase(), password: goodPw } });
  ok("correct login works (email case-insensitive)", good.status === 200 && !!cookieFrom(good, "sv_session"), good.status);

  // brute force on one account from MANY IPs → per-account lock
  let last = 0;
  for (let i = 0; i < 10; i++) last = (await req("/api/auth/login", { method: "POST", body: { email: emailB, password: `guess-${i}x` } })).status;
  ok("password guessing on one account is blocked (429) even across IPs", last === 429, last);

  // forged / tampered sessions
  const [, value] = alice.split("=");
  const parts = value.split(".");
  const tampered = `sv_session=${["00000000-0000-0000-0000-000000000000", ...parts.slice(1)].join(".")}`;
  const t1 = await req("/api/auth/me", { cookie: tampered });
  ok("tampered session (other user id) rejected", t1.json?.user === null);
  const t2 = await req("/api/auth/me", { cookie: `sv_session=${parts[0]}.1.${Date.now() + 1e9}.forged` });
  ok("session with forged signature rejected", t2.json?.user === null);
  const t3 = await req("/api/auth/me", { cookie: `sv_session=${parts[0]}.1.${Date.now() + 1e9}.${createHmac("sha256", "customer:sirvert-dev-secret-change-me").update(`${parts[0]}.1.${Date.now() + 1e9}`).digest("base64url")}` });
  ok("session signed with the public fallback secret rejected", t3.json?.user === null);

  const noAuthOrders = await req("/api/auth/orders");
  ok("account orders require sign-in (401)", noAuthOrders.status === 401, noAuthOrders.status);
  const noAuthPatch = await req("/api/auth/me", { method: "PATCH", body: { name: "Hacker" } });
  ok("profile update requires sign-in (401)", noAuthPatch.status === 401, noAuthPatch.status);
}

section("SQL injection (database)");
{
  const payloads = ["' OR '1'='1", "' OR 1=1 --", "x'; DROP TABLE users; --", "\" OR \"\"=\"", "1; DELETE FROM orders"];
  for (const p of payloads) {
    const l = await req("/api/auth/login", { method: "POST", body: { email: p, password: p } });
    ok(`login with ${JSON.stringify(p)} → 401, not bypassed`, l.status === 401 || l.status === 429, l.status);
    const t = await req(`/api/track?number=${encodeURIComponent(p)}`);
    ok(`order lookup with ${JSON.stringify(p)} finds nothing`, t.status === 404 || t.status === 429, t.status);
    const m = await req(`/api/my-orders?numbers=${encodeURIComponent(p)}`);
    ok(`my-orders with ${JSON.stringify(p)} returns nothing`, (m.json?.orders ?? []).length === 0);
  }
  const s = await req("/api/auth/signup", { method: "POST", body: { name: "Robert'); DROP TABLE users;--", email: `sqli-${rnd}@test.local`, password: goodPw } });
  ok("SQL in a name is stored as plain text", s.status === 201 && s.json?.user?.name?.includes("DROP TABLE"));
  const still = await req("/api/auth/me", { cookie: alice });
  ok("users table still intact after injection attempts", still.json?.user?.email === emailA);
}

let orderNumber = null;
section("Checkout: price & payload tampering");
{
  const tamper = await req("/api/orders", {
    method: "POST",
    cookie: alice,
    body: {
      items: [{ slug: "watch-nova-am", name: "Free watch", price: 1, quantity: 2 }],
      subtotal: 2, shipping: -5000, discount: 999999, total: 0,
      payment: "Cash on Delivery",
      customer: { name: "Alice", email: emailA, phone: "+254700000001", address: "Moi Ave", city: "Nairobi" },
    },
  });
  ok("order accepted", tamper.status === 200, `${tamper.status} ${tamper.text.slice(0, 120)}`);
  orderNumber = tamper.json?.number?.replace("#", "") ?? null;
  ok("order number is long & random (not guessable)", /^SVE-[A-Z2-9]{8}$/.test(orderNumber ?? ""), orderNumber);
  const t = await req(`/api/track?number=${orderNumber}`);
  ok("server used the real price (client price ignored)", t.json?.items?.[0]?.price > 1000, JSON.stringify(t.json?.items?.[0]));
  ok("fake discount ignored", t.json?.discount === 0, t.json?.discount);
  ok("negative shipping ignored", t.json?.shipping >= 0, t.json?.shipping);
  ok("total recomputed on the server", t.json?.total === t.json?.subtotal + t.json?.shipping - t.json?.discount && t.json?.total > 1000, t.json?.total);
  ok("tracking reveals no phone / email / address", !/254700000001|@test\.local|Moi Ave/.test(t.text));

  const huge = await req("/api/orders", { method: "POST", body: { items: [{ slug: "watch-nova-am", quantity: 100000 }], payment: "Cash on Delivery", customer: { name: "Q", phone: "0700", address: "x", city: "Nairobi" } } });
  const hq = await req(`/api/track?number=${huge.json?.number?.replace("#", "")}`);
  ok("absurd quantity clamped (≤ 99)", hq.json?.items?.[0]?.quantity <= 99, hq.json?.items?.[0]?.quantity);

  const fake = await req("/api/orders", { method: "POST", body: { items: [{ slug: "does-not-exist", quantity: 1 }], customer: { name: "Q", phone: "0700", address: "x", city: "N" } } });
  ok("unknown products rejected (400)", fake.status === 400, fake.status);
  const noAddr = await req("/api/orders", { method: "POST", body: { items: [{ slug: "watch-nova-am", quantity: 1 }], customer: { name: "" } } });
  ok("order without delivery details rejected (400)", noAddr.status === 400, noAddr.status);
  const csrf = await req("/api/orders", { method: "POST", origin: "https://evil.example", body: { items: [{ slug: "watch-nova-am", quantity: 1 }] } });
  ok("cross-site order blocked (403)", csrf.status === 403, csrf.status);

  const spamIp = freshIp();
  let last = 0;
  for (let i = 0; i < 32; i++) last = (await req("/api/orders", { method: "POST", ip: spamIp, body: { items: [{ slug: "does-not-exist" }] } })).status;
  ok("order spam from one connection is rate-limited (429)", last === 429, last);
}

section("Payments");
{
  const card = await req("/api/orders", { method: "POST", body: { items: [{ slug: "watch-nova-am", quantity: 1 }], payment: "Card", customer: { name: "Q", phone: "0700", address: "x", city: "Nairobi" } } });
  ok("card payments refused (M-Pesa / cash only)", card.status === 400, card.status);
  const mp = await req("/api/orders", { method: "POST", body: { items: [{ slug: "spacebuds-lite", quantity: 1 }], payment: "M-Pesa", mpesaCode: "QAB1CDE2FG", customer: { name: "Q", phone: "0700", address: "x", city: "Nairobi" } } });
  const mpNo = mp.json?.number?.replace("#", "");
  const t = await req(`/api/track?number=${mpNo}`);
  ok("M-Pesa orders are NOT auto-marked paid", t.json?.paymentStatus === "pending", t.json?.paymentStatus);
  const noAdmin = await req("/api/admin/payments", { method: "POST", body: { orderId: "x", method: "Cash", amount: 1 } });
  ok("resolving payments is admin-only (401)", noAdmin.status === 401, noAdmin.status);
  if (admin) {
    const all = (await req("/api/admin/orders", { cookie: admin })).json ?? [];
    const order = all.find((o) => o.number === `#${mpNo}`);
    const bad = await req("/api/admin/payments", { method: "POST", cookie: admin, body: { orderId: order?.id, method: "M-Pesa", code: "' OR 1=1", amount: 100 } });
    ok("malformed M-Pesa code refused", bad.status === 400, bad.status);
    const over = await req("/api/admin/payments", { method: "POST", cookie: admin, body: { orderId: order?.id, method: "M-Pesa", code: "QAB1CDE2FG", amount: 9_999_999 } });
    ok("amount above the balance refused", over.status === 400, over.status);
    const good = await req("/api/admin/payments", { method: "POST", cookie: admin, body: { orderId: order?.id, method: "M-Pesa", code: "QAB1CDE2FG", amount: order?.total } });
    ok("valid M-Pesa payment resolves the order", good.status === 200 && good.json?.paymentStatus === "paid", good.status);
    const again = await req("/api/admin/payments", { method: "POST", cookie: admin, body: { orderId: all.find((o) => o.paymentStatus === "pending" && o.id !== order?.id)?.id, method: "M-Pesa", code: "qab1cde2fg", amount: 100 } });
    ok("an M-Pesa code can't be reused on another order", again.status === 409, again.status);
  }
}

section("Account data isolation (IDOR)");
{
  const a = await req("/api/auth/orders", { cookie: alice });
  const b = await req("/api/auth/orders", { cookie: bob });
  ok("Alice sees her order", (a.json?.orders ?? []).some((o) => o.number.replace("#", "") === orderNumber));
  ok("Bob can NOT see Alice's order", !(b.json?.orders ?? []).some((o) => o.number.replace("#", "") === orderNumber));
  const patch = await req("/api/auth/me", { method: "PATCH", cookie: bob, body: { name: "Bob Updated", email: emailA, id: "someone-else" } });
  ok("profile update can't change email or id", patch.json?.user?.email === emailB, JSON.stringify(patch.json));
}

section("Password change signs out other devices");
{
  const login2 = await req("/api/auth/login", { method: "POST", body: { email: emailA, password: goodPw } });
  const otherDevice = cookieFrom(login2, "sv_session");
  const bad = await req("/api/auth/me", { method: "PATCH", cookie: alice, body: { currentPassword: "wrong-1234", newPassword: "N3w-Passw0rd!" } });
  ok("wrong current password refused", bad.status === 400, bad.status);
  const ch = await req("/api/auth/me", { method: "PATCH", cookie: alice, body: { currentPassword: goodPw, newPassword: "N3w-Passw0rd!" } });
  ok("password changed", ch.status === 200, ch.status);
  const old = await req("/api/auth/me", { cookie: otherDevice });
  ok("old sessions are now invalid", old.json?.user === null);
  const relog = await req("/api/auth/login", { method: "POST", body: { email: emailA, password: "N3w-Passw0rd!" } });
  ok("new password works", relog.status === 200, relog.status);
}

section("Forgot / reset password");
{
  const known = await req("/api/auth/forgot", { method: "POST", body: { email: emailB } });
  const unknown = await req("/api/auth/forgot", { method: "POST", body: { email: `nobody-${rnd}@test.local` } });
  ok("same answer for known and unknown emails (no account probing)", known.status === 200 && unknown.status === 200 && known.json?.message === unknown.json?.message);
  const bogus = await req("/api/auth/reset", { method: "POST", body: { token: "not-a-real-token", password: "An0ther-pass!" } });
  ok("fake reset token rejected", bogus.status === 400, bogus.status);
  const noAdmin = await req("/api/admin/customers/reset-link", { method: "POST", body: { email: emailB } });
  ok("reset links can only be created by admin (401)", noAdmin.status === 401, noAdmin.status);
  if (admin) {
    const link = await req("/api/admin/customers/reset-link", { method: "POST", cookie: admin, body: { email: emailB } });
    const token = link.json?.link ? new URL(link.json.link).searchParams.get("token") : null;
    ok("admin can create a one-time reset link", !!token, link.status);
    const r1 = await req("/api/auth/reset", { method: "POST", body: { token, password: "Reset-Pass-123" } });
    ok("reset link sets the new password", r1.status === 200, r1.status);
    const r2 = await req("/api/auth/reset", { method: "POST", body: { token, password: "Reset-Pass-456" } });
    ok("reset link works only once", r2.status === 400, r2.status);
    const oldBob = await req("/api/auth/me", { cookie: bob });
    ok("reset signs out old sessions", oldBob.json?.user === null);
    const li = await req("/api/auth/login", { method: "POST", body: { email: emailB, password: "Reset-Pass-123" } });
    ok("can sign in with the reset password", li.status === 200, li.status);
  }
}

section("Uploads");
{
  const fd = new FormData();
  fd.append("file", new Blob(["<svg onload=alert(1)>"], { type: "image/jpeg" }), "evil.jpg");
  const noAuth = await req("/api/admin/upload", { method: "POST", body: fd });
  ok("upload without admin → 401", noAuth.status === 401, noAuth.status);
  if (admin) {
    const fd2 = new FormData();
    fd2.append("file", new Blob(["<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>"], { type: "image/png" }), "evil.png");
    const disguised = await req("/api/admin/upload", { method: "POST", body: fd2, cookie: admin });
    ok("script disguised as an image rejected (400)", disguised.status === 400, disguised.status);
  }
}

section("Misc");
{
  const trav = await req("/product/..%2f..%2f..%2fetc%2fpasswd");
  ok("path traversal reads no server files", !/root:x:0:0/.test(trav.text) && /not found/i.test(trav.text), trav.status);
  const junk = await req("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: undefined });
  ok("empty/garbage body handled (no 500)", junk.status < 500, junk.status);
  const big = await req("/api/auth/signup", { method: "POST", body: { name: "x".repeat(100000), email: `big-${rnd}@test.local`, password: goodPw } });
  ok("oversized input is truncated, not stored whole", big.status >= 400 || (big.json?.user?.name?.length ?? 0) <= 80, big.status);
}

section("Admin password change");
if (admin) {
  const other = cookieFrom(await req("/api/admin/login", { method: "POST", body: { password: ADMIN_PASSWORD } }), "sv_admin");
  const weak = await req("/api/admin/security", { method: "PUT", cookie: admin, body: { currentPassword: ADMIN_PASSWORD, newPassword: "short" } });
  ok("weak admin password refused", weak.status === 400, weak.status);
  const wrong = await req("/api/admin/security", { method: "PUT", cookie: admin, body: { currentPassword: "nope", newPassword: "Str0ng-Admin-Pass" } });
  ok("admin password change needs the current password", wrong.status === 400, wrong.status);
  const ch = await req("/api/admin/security", { method: "PUT", cookie: admin, body: { currentPassword: ADMIN_PASSWORD, newPassword: "Str0ng-Admin-Pass" } });
  ok("admin password changed", ch.status === 200, ch.status);
  const stale = await req("/api/admin/orders", { cookie: other });
  ok("other admin sessions signed out after the change", stale.status === 401, stale.status);
  const oldPw = await req("/api/admin/login", { method: "POST", body: { password: ADMIN_PASSWORD } });
  ok("old admin password no longer works", oldPw.status === 401, oldPw.status);
  const newPw = await req("/api/admin/login", { method: "POST", body: { password: "Str0ng-Admin-Pass" } });
  ok("new admin password works", newPw.status === 200, newPw.status);
}

if (DB) {
  section("Database at rest");
  const { createClient } = await import("@libsql/client");
  const c = createClient({ url: `file:${DB}` });
  const rows = (await c.execute({ sql: "SELECT email, password_hash FROM users WHERE email = ?", args: [emailA] })).rows;
  ok("password stored as an scrypt hash", rows.length === 1 && String(rows[0].password_hash).startsWith("scrypt$"));
  ok("plain-text password is nowhere in the DB", !String(rows[0]?.password_hash).includes(goodPw) && !String(rows[0]?.password_hash).includes("N3w-Passw0rd!"));
  const tables = (await c.execute("SELECT name FROM sqlite_master WHERE type='table'")).rows.map((r) => r.name);
  ok("all tables still exist (no DROP succeeded)", ["users", "orders", "products"].every((t) => tables.includes(t)), tables.join(","));
  const order = (await c.execute({ sql: "SELECT data FROM orders WHERE number = ?", args: [`#${orderNumber}`] })).rows[0];
  ok("order is linked to the account server-side", !!order && JSON.parse(String(order.data)).userId);
}

console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} passed, ${fail} failed`);
if (fail) {
  console.log("Failed:\n - " + failures.join("\n - "));
  process.exit(1);
}
