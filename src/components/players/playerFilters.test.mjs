import test from 'node:test';
import assert from 'node:assert/strict';
import { players } from '../../data/players.js';
import es from '../../i18n/es.js';
import { filterPlayers, parsePlayerFilters, playerFilterParams, playerListPath, hasPlayerFilters } from './playerFilters.mjs';

const defaults = { status: 'all', position: 'all', query: '' };
const matches = overrides => filterPlayers(players, { ...defaults, ...overrides }, es.terms).map(player => player.id);

test('search ignores accents and case and matches every word, including full names', () => {
    assert.deepEqual(matches({ query: '  CHRISTIAN jiménez ' }), [4]);
    assert.deepEqual(matches({ query: 'Lopez' }), [6]);
    assert.deepEqual(matches({ query: 'Roger Bonet' }), [7]);
    assert.deepEqual(matches({ query: 'Julio Melbourne' }), [8]);
    assert.deepEqual(matches({ query: 'Julio Gnistan' }), []);
});

test('search recognises positions and current club countries in both languages', () => {
    assert.deepEqual(matches({ query: 'pivote' }), [2]);
    assert.deepEqual(matches({ query: 'defensive midfielder' }), [2]);
    assert.deepEqual(matches({ query: 'Maldivas' }), [5]);
    assert.deepEqual(matches({ query: 'Maldives' }), [5]);
    assert.deepEqual(matches({ query: 'India' }), []);
});

test('position groups include secondary positions and combine with availability', () => {
    assert.deepEqual(matches({ position: 'defence' }), [2, 4, 5, 7, 8]);
    assert.deepEqual(matches({ position: 'midfield' }), [1, 2, 5, 6]);
    assert.deepEqual(matches({ position: 'attack' }), [1, 3]);
    assert.deepEqual(matches({ status: 'free' }), [2, 4]);
    assert.deepEqual(matches({ status: 'free', position: 'midfield' }), [2]);
    assert.deepEqual(matches({ status: 'free', position: 'attack' }), []);
});

test('unknown URL filters fall back to all and queries have a bounded length', () => {
    assert.deepEqual(parsePlayerFilters('?status=unknown&position=unknown'), defaults);
    assert.equal(parsePlayerFilters(`?q=${'a'.repeat(120)}`).query.length, 100);
    assert.equal(hasPlayerFilters(defaults), false);
    assert.equal(hasPlayerFilters({ ...defaults, query: '   ' }), false);
    assert.equal(hasPlayerFilters({ ...defaults, status: 'free' }), true);
});

test('shared URLs round-trip combined filters, accents, symbols and typing spaces', () => {
    const filters = { status: 'free', position: 'defence', query: 'Jiménez & Rivera ' };
    assert.deepEqual(parsePlayerFilters(playerFilterParams(filters).toString()), filters);
    assert.equal(playerListPath('/es', { ...defaults, status: 'free' }), '/es?status=free#players');
    assert.equal(playerListPath('/', defaults), '/#players');
    assert.equal(playerFilterParams({ ...defaults, query: '   ' }).has('q'), false);
});
