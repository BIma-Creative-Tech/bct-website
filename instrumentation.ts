/**
 * Dipanggil sekali saat server start (docs file-conventions/instrumentation.md). Pola web-starter.
 * Validasi env → gagal cepat. Next hanya me-log error dari register() dan tetap melayani
 * request, jadi proses dihentikan eksplisit agar Docker/compose melihat kegagalan
 * (mis. SITE_URL tidak di-set, atau pasangan TURNSTILE_* tidak lengkap / secret tak terbaca).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv, turnstileAktif } = await import("./lib/env");
    try {
      const env = getEnv();
      if (turnstileAktif(env)) {
        // G-43: secret Turnstile harus terbaca SEKARANG, bukan baru saat lead pertama tiba.
        // Nilainya tidak pernah dicetak — hanya nama variabelnya.
        const { readFile } = await import("node:fs/promises");
        const { RAHASIA_UJI } = await import("./lib/turnstile");
        let rahasia = "";
        try {
          rahasia = (await readFile(env.TURNSTILE_SECRET_FILE, "utf8")).trim();
        } catch {
          rahasia = "";
        }
        if (!rahasia) throw new Error("Env tidak valid: TURNSTILE_SECRET_FILE: berkas tidak terbaca atau kosong");
        if (RAHASIA_UJI.has(rahasia)) {
          console.warn("[boot] PERINGATAN: TURNSTILE_SECRET_FILE berisi kunci UJI Cloudflare — tidak melindungi apa pun");
        }
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Env tidak valid");
      process.exit(1);
    }
  }
}
