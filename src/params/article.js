import articles from '$lib/data/articles.json';

export const match = (slug) => articles.some((article) => article.slug === slug);
