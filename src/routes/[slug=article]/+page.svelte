<script>
    import articles from '$lib/data/articles.json';
    import { articlePresentation } from '$lib/utils/editorial.js';
    import '$lib/styles/editorial.css';
    export let data;
    $: article = data.article;
    $: presentation = articlePresentation(article);
    $: related = articles.filter((a) => a.category === article.category && a.slug !== article.slug);
</script>

<svelte:head
    ><title>{article.title} | Stub the Stubble</title><meta
        name="description"
        content={article.excerpt}
    /><meta name="author" content={article.author} /><link
        rel="canonical"
        href={'https://stubthestubble.com/' + article.slug + '/'}
    /></svelte:head
>
<div class="editorial">
    <article class="editorial-wrap">
        <header class="article-heading">
            <a class="article-back" href={'/' + article.category + '/'}
                >← {article.category === 'insights' ? 'Insights' : 'Resources'}</a
            >
            <p class="eyebrow">{presentation.topic}</p>
            <h1>{article.title}</h1>
            <p class="article-deck">{article.excerpt}</p>
            <div class="article-date">
                <time datetime={article.published}>{presentation.date}</time><span>·</span><span
                    >{presentation.minutes} min read</span
                >
            </div>
        </header>
        <div class="article-layout">
            <aside class="article-sidebar">
                <div class="author-mark" aria-hidden="true">
                    {article.author
                        .split(' ')
                        .map((w) => w[0])
                        .join('')}
                </div>
                <strong>{article.author}</strong><span>Contributor</span>
                {#if presentation.sections.length}<nav aria-label="In this article">
                        <p class="eyebrow">In this article</p>
                        {#each presentation.sections as section}<a href={'#' + section.id}
                                >{section.title}</a
                            >{/each}
                    </nav>{/if}
                <a class="sidebar-back" href={'/' + article.category + '/'}
                    >All {article.category} →</a
                >
            </aside>
            <div class="article-reading">
                {#if presentation.image}<figure class="article-hero">
                        <img
                            src={presentation.image.src}
                            alt={presentation.image.alt}
                            width="1200"
                            height="830"
                        />
                        {#if presentation.image.caption}<figcaption>
                                {presentation.image.alt}
                            </figcaption>{/if}
                    </figure>{/if}
                <div class="article-body">
                    <!-- Reviewed static archive content; never visitor-provided HTML. -->
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html presentation.body}
                </div>
                <details class="archive-note">
                    <summary>Publication notes</summary>
                    <p>
                        Originally published in {article.published.slice(0, 4)}. Restored from the
                        2024 archive with the original author's text. Some images and attachments
                        remain unavailable. Historical claims have not been updated.
                    </p>
                </details>
            </div>
        </div>
        {#if related.length}<section class="related-stories" aria-labelledby="related-title">
                <div class="section-label">
                    <h2 id="related-title">Continue reading</h2>
                    <a href="/insights/">All insights →</a>
                </div>
                <div class="related-grid">
                    {#each related as item}<article>
                            <p class="eyebrow">{articlePresentation(item).topic}</p>
                            <h3><a href={'/' + item.slug + '/'}>{item.title}</a></h3>
                            <p>{item.author}</p>
                            <a class="editorial-link" href={'/' + item.slug + '/'}
                                >Read the story →</a
                            >
                        </article>{/each}
                </div>
            </section>{/if}
    </article>
</div>
