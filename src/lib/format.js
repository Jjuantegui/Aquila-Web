const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const madrid = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

/** ISO → "15 sep 2026, 23:40" en hora de Madrid. */
export function formatMadrid(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const parts = Object.fromEntries(madrid.formatToParts(date).map((p) => [p.type, p.value]));
    const month = MONTHS_ES[Number(parts.month) - 1];
    const hour = parts.hour === "24" ? "00" : parts.hour;
    return `${parts.day} ${month} ${parts.year}, ${hour}:${parts.minute}`;
}

const DEVICE_LABELS = { mobile: "Móvil", desktop: "Ordenador", tablet: "Tablet" };
export const deviceLabel = (device) => DEVICE_LABELS[device] || device || "—";

/** "Oviedo, ES" / "ES" / "—" */
export function placeLabel(event) {
    if (!event) return "—";
    const parts = [event.city, event.country].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
}
