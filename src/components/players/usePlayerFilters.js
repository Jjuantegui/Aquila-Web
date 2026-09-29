'use client';

import { useSyncExternalStore } from 'react';
import { parsePlayerFilters, playerFilterParams } from './playerFilters.mjs';

const filterEvent = 'aquila:player-filters';
const readSearch = () => window.location.search;
const serverSearch = () => '';
const subscribe = onChange => {
    window.addEventListener('popstate', onChange);
    window.addEventListener(filterEvent, onChange);
    return () => {
        window.removeEventListener('popstate', onChange);
        window.removeEventListener(filterEvent, onChange);
    };
};

export default function usePlayerFilters() {
    const search = useSyncExternalStore(subscribe, readSearch, serverSearch);

    const updateFilters = (patch, { replace = false } = {}) => {
        const filters = { ...parsePlayerFilters(window.location.search), ...patch };
        const params = playerFilterParams(filters);
        const url = new URL(window.location.href);
        for (const key of ['status', 'position', 'q']) {
            url.searchParams.delete(key);
            if (params.has(key)) url.searchParams.set(key, params.get(key));
        }
        url.hash = 'players';
        if (url.href === window.location.href) return;
        window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
        window.dispatchEvent(new Event(filterEvent));
    };

    return { filters: parsePlayerFilters(search), updateFilters };
}
