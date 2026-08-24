// ESLint flat config (ESLint 9). Next.js 16 tidak lagi punya `next lint`,
// jadi ESLint dijalankan langsung lewat `npm run lint`.
//
// `eslint-config-next` v16 sudah mengekspor flat config (array Linter.Config[])
// pada subpath `./core-web-vitals` dan `./typescript`, sehingga tidak perlu
// FlatCompat/@eslint/eslintrc.
//   - `core-web-vitals` = preset dasar Next (react, react-hooks, import,
//     jsx-a11y, @next/next) + aturan Core Web Vitals.
//   - `typescript`      = typescript-eslint recommended untuk file .ts/.tsx.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Ignore global. Ditulis eksplisit agar tidak bergantung pada default
  // internal preset (dan agar jelas dibaca manusia).
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  // Pengerasan hasil audit keamanan 2026-08-24: preset Next mematikan rule ini,
  // padahal situs penuh tautan eksternal (wa.me) yang dibuka dengan
  // target="_blank" — wajib disertai rel="noopener noreferrer" agar halaman
  // tujuan tidak bisa mengambil alih tab asal (reverse tabnabbing).
  // Blok ini ditaruh paling akhir supaya menang atas preset di atasnya.
  {
    rules: { 'react/jsx-no-target-blank': 'error' },
  },
]

export default config
