export const positionGroups = ['defence', 'midfield', 'attack'];

const normalise = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function parsePlayerFilters(search = '') {
    const params = new URLSearchParams(search);
    return {
        status: params.get('status') === 'free' ? 'free' : 'all',
        position: positionGroups.includes(params.get('position')) ? params.get('position') : 'all',
        query: (params.get('q') || '').slice(0, 100),
    };
}

export function playerFilterParams(filters) {
    const params = new URLSearchParams();
    if (filters.status === 'free') params.set('status', 'free');
    if (positionGroups.includes(filters.position)) params.set('position', filters.position);
    // Preserve spaces while typing a multi-word search.
    if (filters.query.trim()) params.set('q', filters.query.slice(0, 100));
    return params;
}

export function playerListPath(basePath, filters) {
    const query = playerFilterParams(filters).toString();
    return `${basePath}${query ? `?${query}` : ''}#players`;
}

export function hasPlayerFilters(filters) {
    return filters.status === 'free' || filters.position !== 'all' || !!filters.query.trim();
}

export function filterPlayers(roster, filters, translatedTerms = {}) {
    const words = normalise(filters.query).split(/\s+/).filter(Boolean);
    const positions = {
        defence: /defender|centre-back|center-back|\bback\b/i,
        midfield: /midfielder|no\.\s*10/i,
        attack: /striker|winger|forward/i,
    };

    return roster.filter(player => {
        if (filters.status === 'free' && player.status !== 'Free Agent') return false;
        const roles = `${player.position || ''} / ${player.secondaryPosition || ''}`;
        if (positions[filters.position] && !positions[filters.position].test(roles)) return false;
        const values = [player.name, player.fullName, player.currentClub, player.position, player.secondaryPosition,
            ...(player.currentClub || '').split(' - ')];
        const searchable = normalise(values.flatMap(value => [value, translatedTerms[value]]).join(' '));
        return words.every(word => searchable.includes(word));
    });
}
