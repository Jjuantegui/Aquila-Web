import { players } from '../data/players';
import { deals } from '../data/deals';

// Cifras de «Aquila in numbers», calculadas siempre desde src/data: nunca se escriben a mano.
export function aquilaNumbers() {
    const countries = new Set(players.map(p => (p.currentClub || '').split(' - ')[1]).filter(Boolean));
    const leagues = new Set(players.map(p => p.league).filter(Boolean));
    return {
        players: players.length,
        underContract: players.filter(p => p.status === 'Under Contract').length,
        countries: countries.size,
        countryNames: [...countries],
        deals: deals.length,
        internationalDeals: deals.filter(d => d.scope === 'International').length,
        leagues: leagues.size,
    };
}
