/**
 * Guard CSP (G-15, diadaptasi 2026-09-26 untuk CSP ber-nonce).
 *
 * Dulu CSP dibakar saat build ke `.next/routes-manifest.json`, jadi guard-nya membaca
 * berkas itu. Sejak G-32 CSP disusun PER REQUEST di `proxy.ts`, sehingga satu-satunya
 * bukti yang berarti adalah header yang BENAR-BENAR terkirim server/image yang akan
 * di-deploy. Skrip ini dijalankan terhadap server yang sedang hidup (smoke test CI):
 *
 *   node scripts/check-csp.mjs http://127.0.0.1:3000 / /kontak /pricing
 *
 * Gagal (exit 1) bila, untuk salah satu path:
 * - tidak ada header Content-Security-Policy, atau ada lebih dari satu kebijakan
 *   (koma = pemisah kebijakan yang sah; beberapa header digabung fetch dengan ", "),
 * - script-src tidak memuat 'nonce-…' dan 'strict-dynamic',
 * - kebijakan memuat 'unsafe-eval' (hanya boleh di `next dev`, G-14) atau script-src
 *   memuat 'unsafe-inline',
 * - nonce sama pada dua request berturut-turut (harus acak per request),
 * - ada <script> di HTML yang tidak membawa nonce request itu.
 * Tanpa dependency; Node >= 24 (fetch bawaan).
 */
const [base, ...paths] = process.argv.slice(2);
if (!base || paths.length === 0) {
  console.error("pakai: node scripts/check-csp.mjs <base-url> <path> [path…]");
  process.exit(2);
}

const gagal = [];

async function ambil(path) {
  const res = await fetch(new URL(path, base), { redirect: "manual" });
  const html = await res.text();
  return { status: res.status, csp: res.headers.get("content-security-policy"), html };
}

for (const path of paths) {
  const a = await ambil(path);
  const b = await ambil(path);
  const label = `${path} (HTTP ${a.status})`;
  if (!a.csp) {
    gagal.push(`${label}: header Content-Security-Policy tidak ada`);
    continue;
  }
  if (a.csp.includes(",")) gagal.push(`${label}: lebih dari satu kebijakan CSP (koma)`);
  if (/unsafe-eval/i.test(a.csp)) gagal.push(`${label}: 'unsafe-eval' di header produksi`);
  const script = a.csp.split(";").map((d) => d.trim()).find((d) => d.toLowerCase().startsWith("script-src "));
  if (!script) {
    gagal.push(`${label}: tidak ada directive script-src`);
    continue;
  }
  if (/unsafe-inline/i.test(script)) gagal.push(`${label}: 'unsafe-inline' di script-src`);
  if (!/'strict-dynamic'/.test(script)) gagal.push(`${label}: script-src tanpa 'strict-dynamic'`);
  const nonce = script.match(/'nonce-([A-Za-z0-9+/=_-]{16,})'/)?.[1];
  if (!nonce) {
    gagal.push(`${label}: script-src tanpa 'nonce-…'`);
    continue;
  }
  const nonceB = b.csp?.match(/'nonce-([A-Za-z0-9+/=_-]{16,})'/)?.[1];
  if (nonceB === nonce) gagal.push(`${label}: nonce sama pada dua request`);
  if ((a.status === 200 || a.status === 404) && /<html/i.test(a.html)) {
    const tagSkrip = a.html.match(/<script\b[^>]*>/gi) ?? [];
    const tanpaNonce = tagSkrip.filter((t) => !t.includes(`nonce="${nonce}"`));
    if (tagSkrip.length === 0) gagal.push(`${label}: tidak ada <script> sama sekali (kontrol positif)`);
    if (tanpaNonce.length > 0) gagal.push(`${label}: ${tanpaNonce.length}/${tagSkrip.length} <script> tanpa nonce`);
    else console.log(`check-csp: ${label} OK — ${tagSkrip.length} <script> bernonce`);
  } else {
    console.log(`check-csp: ${label} OK (header saja)`);
  }
}

if (gagal.length) {
  console.error(`check-csp GAGAL:\n- ${gagal.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-csp: OK — ${paths.length} path diperiksa.`);
