<script>
    import articles from '$lib/data/articles.json';
    import { articlePresentation } from '$lib/utils/editorial.js';
    import '$lib/styles/editorial.css';
    export let category;
    let topic = 'All topics';
    $: title = category === 'insights' ? 'Insights' : 'Resources';
    $: entries = articles
        .filter((a) => a.category === category)
        .map((a) => ({ ...a, ...articlePresentation(a) }));
    $: topics = ['All topics', ...new Set(entries.map((a) => a.topic))];
    $: visible = entries.filter((a) => topic === 'All topics' || a.topic === topic);
    $: featured = visible[0];
</script>

<svelte:head
    ><title>{title} | Stub the Stubble</title><meta
        name="description"
        content={category === 'insights'
            ? 'Perspectives on stubble burning, air quality and collective action.'
            : 'Resources for understanding and addressing stubble burning.'}
    /></svelte:head
>
<div class="editorial">
    <div class="editorial-wrap">
        <header class="collection-heading">
            <p class="eyebrow">The knowledge centre</p>
            <h1>{title}</h1>
            <p class="collection-intro">
                {category === 'insights'
                    ? 'Ideas for cleaner air. Perspectives on the people, policies and practices that can make it happen.'
                    : 'From understanding the problem to putting solutions into practice.'}
            </p>
        </header>
        <nav class="collection-tabs" aria-label="Knowledge centre">
            <a href="/insights/" aria-current={category === 'insights' ? 'page' : undefined}
                >Insights <span>03</span></a
            ><a href="/resources/" aria-current={category === 'resources' ? 'page' : undefined}
                >Resources <span>01</span></a
            >
            {#if category === 'insights'}<label class="topic-filter"
                    >Explore <select bind:value={topic} aria-label="Filter insights by topic"
                        >{#each topics as item}<option>{item}</option>{/each}</select
                    ></label
                >{/if}
        </nav>
        {#if featured}<article class="featured-story">
                <a
                    class="feature-visual"
                    href={'/' + featured.slug + '/'}
                    aria-label={'Read ' + featured.title}
                >
                    {#if featured.image}<img
                            src={featured.image.src}
                            alt={featured.image.alt}
                            width="1200"
                            height="830"
                        />
                    {:else if category === 'resources'}<div class="resource-cover">
                            <span>Saroja Earth</span><strong>Theory<br />of change.</strong><span
                                >Cleaner air.<br />A different future for North India.</span
                            ><span class="cover-arrow" aria-hidden="true">↗</span>
                        </div>
                    {:else}<div class="resource-cover">
                            <span>{featured.topic}</span><strong
                                >People.<br />Policy.<br />Possibility.</strong
                            >
                        </div>{/if}
                </a>
                <div class="feature-copy">
                    <p class="eyebrow">{featured.topic}</p>
                    <h2><a href={'/' + featured.slug + '/'}>{featured.title}</a></h2>
                    <p class="feature-excerpt">{featured.excerpt}</p>
                    <div class="story-byline">
                        <strong>{featured.author}</strong><span
                            ><time datetime={featured.published}>{featured.date}</time> · {featured.minutes}
                            min read</span
                        >
                    </div>
                    <a class="editorial-link" href={'/' + featured.slug + '/'}
                        >Read {category === 'insights' ? 'the story' : 'the resource'}
                        <span aria-hidden="true">→</span></a
                    >
                </div>
            </article>{/if}
        {#if visible.length > 1}<section class="more-stories" aria-labelledby="more-stories-title">
                <div class="section-label">
                    <h2 id="more-stories-title">More perspectives</h2>
                    <span>From the journal</span>
                </div>
                {#each visible.slice(1) as article}<article class="story-row">
                        <div class="row-topic">
                            <span class="eyebrow">{article.topic}</span><time
                                datetime={article.published}>{article.date}</time
                            >
                        </div>
                        <div>
                            <h3><a href={'/' + article.slug + '/'}>{article.title}</a></h3>
                            <p>{article.excerpt}</p>
                            <span class="row-author"
                                >{article.author} · {article.minutes} min read</span
                            >
                        </div>
                        <a
                            class="row-arrow"
                            href={'/' + article.slug + '/'}
                            aria-label={'Read ' + article.title}>↗</a
                        >
                    </article>{/each}
            </section>{/if}
        <aside class="editorial-cta">
            <div>
                <span class="eyebrow">Explore the evidence</span>
                <h2>See the story on the ground.</h2>
                <p>Explore reported fire activity across Punjab and Haryana.</p>
            </div>
            <a class="editorial-link" href="/"
                >Open the dashboard <span aria-hidden="true">→</span></a
            >
        </aside>
    </div>
</div>
