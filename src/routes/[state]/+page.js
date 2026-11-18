import { error } from '@sveltejs/kit';
import { states } from '$lib/data/site_info.js';

export function load({ params }) {
    if (!Object.hasOwn(states, params.state)) error(404, 'Page not found');
}
