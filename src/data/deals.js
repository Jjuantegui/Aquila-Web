export const deals = [
    {
        id: 1,
        playerId: 1,
        playerName: "Victor Campuzano",
        dealType: "Free Transfer",
        season: "2025/26",
        date: "Sep 2025",
        fromClub: { name: "Sporting Gijón", city: "Gijón", country: "Spain", iso: "es", lat: 43.5322, lon: -5.6611 },
        toClub: { name: "Sydney FC", city: "Sydney", country: "Australia", iso: "au", lat: -33.8688, lon: 151.2093 },
        scope: "International",
        featured: false,
        notes: "Strategic move to A-League.",
        links: { transfermarkt: "https://www.transfermarkt.es/victor-campuzano/profil/spieler/394285" },
        mapConfig: { scale: 130, center: [70, 0] }
    },
    {
        id: 2,
        playerId: 2,
        playerName: "Christian Rivera",
        dealType: "Free Transfer",
        season: "2025/26",
        date: "Jan 2026",
        fromClub: { name: "Free Agent", city: "", country: "", iso: "es", lat: null, lon: null },
        toClub: { name: "Real Avilés", city: "Avilés", country: "Spain", iso: "es", lat: 43.5547, lon: -5.9248 },
        scope: "National",
        featured: false,
        notes: "Return to Spanish football.",
        links: { transfermarkt: "https://www.transfermarkt.es/christian-rivera/profil/spieler/374077" }
    },
    {
        id: 3,
        playerId: 5,
        playerName: "Matias Hernandez",
        dealType: "Free Transfer",
        season: "2025/26",
        date: "Aug 2025",
        fromClub: { name: "DPMM FC", city: "Bandar Seri Begawan", country: "Brunei", iso: "bn", lat: 4.9031, lon: 114.9398 },
        toClub: { name: "Gokulam Kerala", city: "Kozhikode", country: "India", iso: "in", lat: 11.2588, lon: 75.7804 },
        scope: "International",
        featured: false,
        notes: "New challenge in I-League.",
        links: { transfermarkt: "https://www.transfermarkt.es/matias-hernandez/profil/spieler/598616" },
        mapConfig: { scale: 600, center: [95, 10] }
    },
    {
        id: 4,
        playerId: 4,
        playerName: "Christian Jimenez",
        dealType: "Free Transfer",
        season: "2025/26",
        date: "Jul 2025",
        fromClub: { name: "UD Torre del Mar", city: "Torre del Mar", country: "Spain", iso: "es", lat: 36.7414, lon: -4.0963 },
        toClub: { name: "AC Escaldes", city: "Escaldes", country: "Andorra", iso: "ad", lat: 42.5088, lon: 1.5342 },
        scope: "International",
        featured: false,
        notes: "Key defensive signing.",
        links: { transfermarkt: "https://www.transfermarkt.es/christian-jimenez/profil/spieler/680190" },
        mapConfig: { scale: 1800, center: [-2, 40] }
    },
    {
        id: 5,
        playerId: 3,
        playerName: "Dani Fernandez",
        dealType: "Free Transfer",
        season: "2025/26",
        date: "Jul 2025",
        fromClub: { name: "CD Numancia", city: "Soria", country: "Spain", iso: "es", lat: 41.7640, lon: -2.4688 },
        toClub: { name: "SD Logroñes", city: "Logroño", country: "Spain", iso: "es", lat: 42.4623, lon: -2.4449 },
        scope: "National",
        featured: false,
        notes: "Relocation within Segunda RFEF.",
        links: { transfermarkt: "https://www.transfermarkt.es/dani-fernandez/profil/spieler/717942" }
    },
    {
        id: 6,
        // No playerId yet as he might not have a full profile page
        playerName: "Pablo Margallo",
        dealType: "Free Transfer",
        intermediation: true, // New flag for secondary badge
        season: "2025/26",
        date: "Jul 2025",
        // Placeholders as requested. 
        // Notes: User can edit these.
        fromClub: { name: "CD Unión Sur Yaiza", city: "Yaiza", country: "Spain", iso: "es", lat: 28.9555, lon: -13.7667 },
        toClub: { name: "UD Santa Coloma", city: "Santa Coloma", country: "Andorra", iso: "ad", lat: 42.5050, lon: 1.5280 },
        scope: "International", // Defaults to National so it appears in list without map issues
        featured: true, // Maybe feature it to show it off?
        notes: "Intermediation deal.",
        links: {
            transfermarkt: "https://www.transfermarkt.es/pablo-margallo/profil/spieler/599898",
            // video: "...",
            // article: "..."
        }
    }
];
