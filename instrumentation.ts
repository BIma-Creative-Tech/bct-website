/**
 * Dipanggil sekali saat server start (docs file-conventions/instrumentation.md). Pola web-starter.
 * Validasi env → gagal cepat. Next hanya me-log error dari register() dan tetap melayani
 * request, jadi proses dihentikan eksplisit agar Docker/compose melihat kegagalan
 * (mis. SITE_URL tidak di-set).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("./lib/env");
    try {
      getEnv();
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Env tidak valid");
      process.exit(1);
    }
  }
}
