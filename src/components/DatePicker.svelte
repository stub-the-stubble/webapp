<script>
    import { fade, slide } from 'svelte/transition';
    import { CalendarIcon, ChevronDown } from 'lucide-svelte';
    import { highlightedDate, startDate, endDate, isRangeMode, isMenuMinimised } from '../stores.js';
    import { timeFormat } from 'd3-time-format';
    import { startOfMonth, startOfToday, startOfYesterday, subDays, getTime } from 'date-fns';
    import { cn } from '$lib/utils';
    import { Button } from '$lib/components/ui/button';
    import { RangeCalendar } from '$lib/components/ui/range-calendar';
    import { Label } from '$lib/components/ui/label';
    import { Switch } from '$lib/components/ui/switch';
    import { today, CalendarDate } from '@internationalized/date';

    import * as Popover from '$lib/components/ui/popover';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

    let showDatePicker = true,
        showCustomRangePicker = false;
    let preset = 'today';
    const formatter = timeFormat('%d %b %G');
    const tz = 'Asia/Kolkata';
    const todayDate = startOfToday();

    let sd, ed, dateString;

    const presets = {
        'today' : 'Today',
        'yesterday' : 'Yesterday',
        'month' : 'This month',
        'all_time' : 'All time',
        'thirty_days' : 'Last 30 days',
        'custom' : 'Custom'
    }

    //These values use CalendarDate from @internationalized/date library
    let value = {
        start: undefined,
        end: undefined,
    };

    let singleValue = undefined;

    $: {
        updateSelection(preset);
    }

    $: {
        if (value && value.start && value.end) {
            sd = value.start.toDate(tz);
            ed = value.end.toDate(tz);
        } else if (singleValue) {
            sd = singleValue.toDate(tz);
            ed = null;
        }
        updateDateString();
    }

    function updateSelection(selected) {
        switch (selected) {
            case '':
            case 'today':
                sd = todayDate;
                ed = null;
                showCustomRangePicker = false;

                break;
            case 'yesterday':
                sd = startOfYesterday();
                ed = null;
                showCustomRangePicker = false;

                break;
            case 'month':
                sd = startOfMonth(todayDate);
                ed = todayDate;
                showCustomRangePicker = false;

                break;
            case 'thirty_days':
                sd = subDays(todayDate, 30);
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
        const sdString = formatter(sd);

        if (sd && ed) {
            const edString = formatter(ed);
            dateString = sdString + ' – ' + edString +' ';
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

    function openDatePicker() {
        showDatePicker = !showDatePicker;
    }
</script>

<div class="border-b-2 border-light-grey {$isMenuMinimised ? 'pt-0 pb-0' : 'pt-2 md:pt-4 pb-3 md:pb-5'}" transition:fade>
    <div class="mb-2">
        {#key dateString}
            <div class="flex justify-between items-center text-sm md:text-base mb-0.5 text-grey" in:fade>
                <div class="">Showing Data For</div>
                <div class="flex gap-2 px-1.5 py-1 bg-white md:bg-transparent rounded-sm border md:border-none border-light-grey">
                    <Label for="minimise-menus">
                        Hide controls
                    </Label>
                    <Switch id="minimise-menus" />
                </div>
            </div>
            <span class="text-xl md:text-2xl text-brown font-bold">
                {dateString}
            </span>
            {#if preset !== 'custom'}
                <span class="align-text-bottom md:text-lg text-light-brown whitespace-nowrap">
                    ({presets[preset]})
                </span>
            {/if}
        {/key}
    </div>

    {#if !$isMenuMinimised}
        <div class="flex flex-col md:flex-row gap-2 md:gap-4" transition:slide>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button variant="outline" builders={[builder]} class="group max-w-[8rem] md:max-w-[10rem] text-sm text-dark-grey border-light-brown hover:bg-light-orange">
                        Change Dates
                        <ChevronDown class="ml-1 py-0 h-5 w-5 group-data-[state=open]:rotate-180 transition-transform duration-150"/>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-56" align="start">
                    <DropdownMenu.RadioGroup bind:value={preset}>
                        <DropdownMenu.RadioItem value="today">Today</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="yesterday">Yesterday</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="month">This month</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="thirty_days">Last 30 days</DropdownMenu.RadioItem
                        >
                        <DropdownMenu.RadioItem value="all_time">All time</DropdownMenu.RadioItem>
                        <DropdownMenu.RadioItem value="custom">Custom</DropdownMenu.RadioItem>
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

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
                                            {formatter(value.start.toDate(tz))} - {formatter(
                                                value.end.toDate(tz),
                                            )}
                                        {:else}
                                            {formatter(value.start.toDate(tz))}
                                        {/if}
                                    {:else if singleValue}
                                        {formatter(singleValue.toDate(tz))}
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
