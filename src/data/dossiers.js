/**
 * Dossieres rastreables (PDF).
 *
 * Cada dossier se sirve en aquilasports.es/d/<slug>/<destinatario>.
 * Los PDF viven en /private/dossiers/ (NO en /public) y solo se sirven
 * a través de la ruta, que registra cada apertura.
 *
 * - `file`: PDF por defecto.
 * - `files`: PDF por idioma (opcional). Si el archivo del idioma pedido no
 *   existe en /private/dossiers/, se usa `file`.
 * - `downloadName`: nombre que verá el destinatario al abrir/guardar el PDF.
 */
export const dossiers = [
  {
    slug: "rivera",                       // aquilasports.es/d/rivera/<club>
    title: "Christian Rivera — Player profile",
    file: "christian-rivera-2026-09.pdf", // en /private/dossiers/ (NO en /public)
    lang: "es",                            // idioma por defecto del PDF
    files: { es: "christian-rivera-2026-09-es.pdf", en: "christian-rivera-2026-09-en.pdf" },
    downloadName: "Christian_Rivera_Aquila.pdf",
    active: true,
  },
];

/**
 * Destinatarios conocidos: un enlace por club/persona.
 * El slug es lo único que ve el destinatario en la URL.
 *
 * No hace falta dar de alta aquí cada enlace nuevo: cualquier slug funciona
 * (/d/rivera/loquesea sirve el PDF y registra la apertura como
 * "unknown:loquesea"). Las etiquetas también se pueden guardar desde el
 * panel /admin/aperturas sin tocar este archivo.
 */
export const recipients = [
  { slug: "oviedo", dossier: "rivera", label: "Real Oviedo — DD", lang: "es", notes: "" },
  { slug: "kerala", dossier: "rivera", label: "Kerala Blasters — Sporting director", lang: "en", notes: "" },
];
