<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { CalendarIcon, ChevronDown } from 'lucide-svelte';
    import CrossIcon from '$lib/assets/icons/cross.svg?raw';
    import {
        highlightedDate,
        startDate,
        endDate,
        isRangeMode,
        isMenuMinimised,
        fires_data,
    } from '../stores.js';
    import { timeFormat } from 'd3-time-format';
    import { startOfMonth, startOfDay, subDays, getTime } from 'date-fns';
    import { cn, getDateIST } from '$lib/utils';
    import { latestReportedDate, reportedDate } from '$lib/utils/dashboardSummary.js';
    import { Button } from './external/button';
    import { RangeCalendar } from './external/range-calendar';
    import { Toggle } from './external/toggle';
    import { today, CalendarDate, getLocalTimeZone } from '@internationalized/date';

    import * as Popover from './external/popover';
    import * as DropdownMenu from './external/dropdown-menu';

    let showCustomRangePicker = false;
    let preset = 'latest';
    $: latest = latestReportedDate($fires_data);
    const formatter = timeFormat('%d %b %Y');
    const tz = 'Asia/Kolkata';
    const todayDate = startOfDay(getDateIST());
    let mounted = false;
    onMount(() => {
        mounted = true;
    });

    let sd, ed, dateString;

    const presets = {
        latest: 'Latest reported',
        today: 'Today',
        yesterday: 'Yesterday',
        month: 'This month',
        all_time: 'All time',
        thirty_days: 'Last 30 days',
        custom: 'Custom',
    };

    //These values use CalendarDate from @internationalized/date library
    let value = {
        start: undefined,
        end: undefined,
    };

    let singleValue = undefined;

    $: {
        updateSelection(preset, latest);
    }

    $: {
        if (value && value.start && value.end) {
            sd = value.start.toDate(getLocalTimeZone());
            ed = value.end.toDate(getLocalTimeZone());
        } else if (singleValue) {
            sd = singleValue.toDate(getLocalTimeZone());
            ed = null;
        }
        updateDateString();
    }

    function updateSelection(selected, latestDate) {
        switch (selected) {
            case 'latest':
                sd = reportedDate(latestDate);
                ed = null;
                showCustomRangePicker = false;
                break;
            case '':
            case 'today':
                sd = todayDate;
                ed = null;
                showCustomRangePicker = false;

                break;
            case 'yesterday':
                sd = subDays(todayDate, 1);
                ed = null;
                showCustomRangePicker = false;

                break;
            case 'month':
                sd = startOfMonth(todayDate);
                ed = todayDate;
                showCustomRangePicker = false;

                break;
            case 'thirty_days':
                sd = subDays(todayDate, 29);
                ed = todayDate;
                showCustomRangePicker = false;

                break;
            case 'all_time':
                sd = new Date(2021, 8, 3);
                ed = todayDate;
                showCustomRangePicker = false;

                break;
            case 'custom':
                showCustomRangePicker = true;
                break;
            default:
                sd = todayDate;
        }
        updateDateString();
    }

    function updateDateString() {
        if (!sd) {
            dateString =
                $fires_data?.errors?.PB_historical && $fires_data?.errors?.HR_historical
                    ? 'Could not load data'
                    : 'Loading data…';
            $startDate = $endDate = $highlightedDate = null;
            $isRangeMode = false;
            return;
        }
        const sdString = formatter(sd);

        if (sd && ed) {
            const edString = formatter(ed);
            dateString = sdString + ' – ' + edString + ' ';
            $startDate = getTime(sd);
            $endDate = getTime(ed);
            $highlightedDate = getTime(ed);
            $isRangeMode = true;
        } else {
            dateString = sdString + ' ';
            $startDate = getTime(sd);
            $highlightedDate = getTime(sd);
            $isRangeMode = false;
        }
    }
</script>

<div
    class="border-b-2 border-light-grey {$isMenuMinimised
        ? 'pt-0 pb-0'
        : 'pt-2 md:pt-4 pb-3 md:pb-5'}"
    transition:fade
>
    <div class="mb-2">
        {#key dateString}
            <div class="flex justify-between items-center md:text-lg text-grey" in:fade>
                Showing Data For
                <Toggle
                    class="text-light-brown icon-h-5 md:icon-toggle-6 rounded-full transition duration-300 {$isMenuMinimised
                        ? 'rotate-[135deg]'
                        : 'rotate-0'}"
                    aria-label="Toggle menu and date controls"
                    title={$isMenuMinimised
                        ? 'Show navigation and date controls'
                        : 'Hide navigation and date controls'}
                >
                    <!-- Imported static SVG, never remote content. -->
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html CrossIcon}
                </Toggle>
            </div>
            <span class="text-xl md:text-2xl text-brown font-bold">
                {mounted ? dateString : 'Loading dates…'}
            </span>
            {#if mounted && sd && preset !== 'custom'}
                <span class="align-text-bottom md:text-lg text-grey whitespace-nowrap">
                    ({presets[preset]})
                </span>
            {/if}
        {/key}
    </div>

    {#if !$isMenuMinimised}
        <div class="flex flex-col md:flex-row gap-2 md:gap-4" transition:slide>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button
                        variant="outline"
                        builders={[builder]}
                        class="group max-w-[8rem] md:max-w-[10rem] text-sm text-dark-grey border-light-brown hover:bg-light-orange"
                    >
                        Change Dates
                        <ChevronDown
                            class="ml-1 py-0 h-5 w-5 group-data-[state=open]:rotate-180 transition-transform duration-150"
                        />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-56" align="start">
                    <DropdownMenu.RadioGroup bind:value={preset}>
                        <DropdownMenu.RadioItem value="latest"
                            >Latest reported</DropdownMenu.RadioItem
                        >
                        <DropdownMenu.RadioItem value="today">Today</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="yesterday">Yesterday</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="month">This month</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="thirty_days"
                            >Last 30 days</DropdownMenu.RadioItem
                        >
                        <DropdownMenu.RadioItem value="all_time">All time</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="custom">Custom</DropdownMenu.RadioItem>
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <button
                class="text-sm text-grey hover:text-brown self-start px-2 py-2"
                on:click={() => window.location.reload()}>Refresh</button
            >

            {#if showCustomRangePicker}
                <div class="flex flex-wrap" in:fade>
                    <Popover.Root openFocus>
                        <Popover.Trigger asChild let:builder>
                            <Button
                                variant="outline"
                                class={cn(
                                    'max-w-[18rem] justify-start text-left font-normal',
                                    !value && 'text-muted-foreground',
                                )}
                                builders={[builder]}
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                <div class="yaya">
                                    {#if value && value.start}
                                        {#if value.end}
                                            {formatter(value.start.toDate(getLocalTimeZone()))} - {formatter(
                                                value.end.toDate(getLocalTimeZone()),
                                            )}
                                        {:else}
                                            {formatter(value.start.toDate(getLocalTimeZone()))}
                                        {/if}
                                    {:else if singleValue}
                                        {formatter(singleValue.toDate(getLocalTimeZone()))}
                                    {:else}
                                        Select a single date or a date range
                                    {/if}
                                </div>
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content class="w-auto p-0" align="start">
                            <RangeCalendar
                                bind:value
                                bind:startValue={singleValue}
                                initialFocus
                                numberOfMonths={1}
                                placeholder={value?.start}
                                minValue={new CalendarDate(2021, 9, 3)}
                                maxValue={today(tz)}
                                pagedNavigation
                            />
                        </Popover.Content>
                    </Popover.Root>
                    <p class="flex items-center mt-1 pl-1 md:pl-2 text-sm text-dark-grey">
                        Select one date after another to set a range
                    </p>
                </div>
            {/if}
        </div>
    {/if}
</div>
