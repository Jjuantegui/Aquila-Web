export const countryToIso = {
    // Active
    "Spain": "es",
    "Australia": "au",
    "India": "in",
    "Andorra": "ad",

    // Reach / Global Network (Europe, America, Asia)
    "United States of America": "us",
    "Canada": "ca",
    "Mexico": "mx",
    "China": "cn",

    // Europe (Reach)
    "France": "fr",
    "Germany": "de",
    "Italy": "it",
    "United Kingdom": "gb",
    "Portugal": "pt",
    "Netherlands": "nl",
    "Belgium": "be",
    "Switzerland": "ch",
    "Austria": "at",
    "Sweden": "se",
    "Norway": "no",
    "Denmark": "dk",
    "Finland": "fi",
    "Poland": "pl",
    "Croatia": "hr",
    "Serbia": "rs",
    "Greece": "gr",
    "Turkey": "tr",
    "Russia": "ru",
    "Ukraine": "ua",
    "Romania": "ro",
    "Ireland": "ie",
    "Scotland": "gb-sct", // Special case usually, or gb? Flagcdn supports gb-sct
    "Wales": "gb-wls",
    "Czech Republic": "cz",
    "Hungary": "hu",

    // Others that might appear
    "Brazil": "br",
    "Argentina": "ar",
    "Brunei": "bn",
    "Georgia": "ge",
    "England": "gb-eng"
};

export const getFlagUrl = (countryName) => {
    // Direct mapping
    let iso = countryToIso[countryName];

    // Fallback logic if needed (e.g. "USA" vs "United States of America")
    if (!iso && countryName === "USA") iso = "us";
    if (!iso && countryName === "UK") iso = "gb";

    if (!iso) return null;
    return `https://flagcdn.com/20x15/${iso}.png`; // Slightly larger for better visibility in tooltip
};
