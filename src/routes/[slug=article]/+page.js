import { error } from '@sveltejs/kit';
import articles from '$lib/data/articles.json';

// Keep original article paths; the matcher separates articles from state routes.
export const entries = () => articles.map(({ slug }) => ({ slug }));

export function load({ params }) {
    const article = articles.find(({ slug }) => slug === params.slug);
    if (!article) error(404, 'Article not found');
    return { article };
}
