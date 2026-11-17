const topics = {
    'citizen-led-air-quality-measurement-strategy-can-help-north-india-breathe-better':
        'Air quality',
    'collaborative-solution-north-indias-stubble-burning': 'Collective action',
    'organised-robust-response': 'Stubble burning',
    'saroja-earth-theory-of-change-2': 'Our approach',
};
export function articlePresentation(article) {
    const sections = [];
    // Turn the original stand-alone section titles into navigable headings.
    let body = article.body.replace(/<p><strong>([^<]+)<\/strong><\/p>/g, (_, title) => {
        const id = `section-${sections.length + 1}`;
        sections.push({ id, title });
        return `<h2 id="${id}">${title}</h2>`;
    });
    const hero = body.match(
        /^<figure>\s*<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>)?\s*<\/figure>/,
    );
    if (hero) body = body.slice(hero[0].length);
    body = body.replace(/<figure>\s*<\/figure>/g, '');
    return {
        body,
        sections,
        topic: topics[article.slug] || 'Perspective',
        image: hero ? { src: hero[1], alt: hero[2], caption: hero[3] || '' } : null,
        minutes: Math.max(
            1,
            Math.ceil(article.body.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 220),
        ),
        date: new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(article.published + 'T12:00:00Z')),
    };
}
