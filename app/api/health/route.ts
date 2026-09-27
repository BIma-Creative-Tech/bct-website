/**
 * Liveness untuk HEALTHCHECK Docker/compose (KONTRAK: GET /api/health → 200 {"status":"ok"}).
 * Tanpa panggilan eksternal dan tanpa data sensitif. Sama dengan web-starter.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
