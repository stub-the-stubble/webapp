<script>
    import { onMount } from 'svelte';
    import { format, parseISO } from 'date-fns';
    import { createSentinelBurnLayer } from '$lib/utils/sentinelBurnLayer.js';
    export let L, map, state_code, dates;
    let enabled = false,
        controller,
        status = { kind: 'off', scenes: [] };
    onMount(() => {
        controller = createSentinelBurnLayer(L, map, { onStatus: (next) => (status = next) });
        return () => controller.destroy();
    });
    $: if (controller) controller.update(enabled, state_code, dates);
    const friendly = (date) => format(parseISO(date), 'd MMM yyyy');
    $: observationDates = [...new Set(status.scenes.map((scene) => scene.after))].sort();
    $: observationLabel =
        observationDates.length > 1
            ? `${format(parseISO(observationDates[0]), 'd MMM')} – ${friendly(
                  observationDates.at(-1),
              )}`
            : observationDates.length
            ? friendly(observationDates[0])
            : '';
</script>

<div class="mb-3 text-sm">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label class="inline-flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                bind:checked={enabled}
                aria-label={`${state_code} Sentinel-2 burnt area`}
                class="accent-brown"
                aria-controls={`map-${state_code}`}
            />
            Burnt area · Sentinel-2
        </label>
    </div>
    {#if enabled}
        <div
            class="mt-2 text-xs text-grey"
            role="status"
            aria-live="polite"
            data-sentinel-status={status.kind}
        >
            {#if status.kind === 'loading'}Loading Sentinel-2…
            {:else if status.kind === 'blocked'}Burnt-area validation in progress.
            {:else if status.kind === 'empty'}No processed imagery for these dates.
            {:else if status.kind === 'error'}Sentinel-2 could not load. Toggle off and on to retry.
            {:else if status.kind === 'ready'}
                <span class="inline-block w-2 h-2 bg-[#f45d22] mr-1" aria-hidden="true" />
                Possible burn scars · {observationLabel}
            {/if}
        </div>
        {#if status.kind === 'ready'}
            <details class="mt-2 text-xs text-grey">
                <summary class="cursor-pointer">Imagery dates and coverage</summary>
                {#if status.coverage}
                    <p class="mt-2">
                        Clear comparisons cover {status.coverage.validCroplandPercent}% of mapped
                        cropland.
                    </p>
                {/if}
                {#each status.scenes as scene}
                    <p class="mt-2">
                        Observed {friendly(scene.after)} · baseline {friendly(
                            scene.before,
                        )}{scene.beforeEnd && scene.beforeEnd !== scene.before
                            ? ` – ${friendly(scene.beforeEnd)}`
                            : ''}.
                    </p>
                {/each}
                <p class="mt-2">
                    Dates refer to satellite observations, not exact fire dates. Cloud-covered
                    fields and dates without processed imagery are not assessed.
                </p>
                <p class="mt-2">
                    A single date shows comparisons available by that day, up to 14 days old. A date
                    range selects observations within that range. These recent comparisons are not a
                    complete season inventory.
                </p>
                <p class="mt-2">
                    20 m Sentinel-2 comparison, clipped to {state_code === 'PB'
                        ? 'Punjab'
                        : 'Haryana'} cropland. Harvesting, ploughing and haze can resemble burn scars.
                    This experimental layer does not change fire counts.
                </p>
                <a
                    class="inline-block mt-2 underline"
                    href="https://doi.org/10.3390/s25175588"
                    target="_blank"
                    rel="noreferrer">Source method</a
                >
            </details>
        {/if}
    {/if}
</div>
