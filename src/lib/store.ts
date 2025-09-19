import { writable } from 'svelte/store';

// Store for flowchart nodes and edges
export const flowData = writable({ nodes: [], edges: [] });

// Stores for other experiment data
export const notes = writable('');
export const metadata = writable('');
export const instruments = writable([]);
export const materials = writable('');
