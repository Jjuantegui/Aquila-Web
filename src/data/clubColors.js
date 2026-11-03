// Color de acento de cada club. Copia de Marketing/Marca/colores_clubes.json (HQ), sacado de la equipación de las fotos.
// Solo se usa en la ficha del jugador (cinta superior y filete de las stats); en el resto de la web, verde salvia.
// Si un club no está, la ficha usa salvia: nunca se inventa un color aquí.
export const clubColors = {
    'Melbourne City': '#6CABDD',       // camiseta azul cielo, fotos @bythewhiteline 17/09/2026
    'IF Gnistan': '#F7CD30',           // camiseta amarilla, fotos Rec20260819
    'Eastern District FC': '#2E60C4',  // camiseta azul, fotos Club actual 05/10/2026
    'SD Logroñés': '#CE2029',          // camiseta rojiblanca, fotos de partido
};

// currentClub viene como "Club - País" en src/data/players.js.
export const clubAccent = (currentClub) => {
    const name = (currentClub || '').split(' - ')[0].trim();
    return clubColors[name] || null;
};
