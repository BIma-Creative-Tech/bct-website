/**
 * Titik masuk Motion (API vanilla) yang dimuat DINAMIS oleh Reveal & NumberTicker.
 * Import bernama statis di modul ini memungkinkan tree-shaking (import dinamis langsung ke
 * "motion" memuat seluruh entry paket).
 */
export { animate, inView } from "motion";
