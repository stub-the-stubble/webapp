<script>
    import { slide } from 'svelte/transition';
    import { ChevronDown, CalendarIcon } from 'lucide-svelte';
    import { highlightedDate, startDate, endDate, rangeMode, selectedDate } from '../../stores.js';
    import { timeFormat } from 'd3-time-format';
    import { startOfMonth, startOfToday, startOfYesterday, subDays, getTime } from 'date-fns';
    import { cn } from '$lib/utils';
    import { Button } from '$lib/components/ui/button';
    import { RangeCalendar } from '$lib/components/ui/range-calendar';
    import { today, CalendarDate } from "@internationalized/date";

    import * as Popover from '$lib/components/ui/popover';

    let showDatePicker = true,
        showCustomRangePicker = false;
    let preset;
    const formatter = timeFormat('%d %B %G');
    const tz = 'Asia/Kolkata';
    const todayDate = startOfToday();

    let sd, ed, dateString;

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
        updateStores();
       
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
                sd = startOfMonth(today);
                ed = todayDate;
                showCustomRangePicker = false;

                break;
            case 'thirty_days':
                sd = subDays(todayDate, 30);
                ed = today;
                showCustomRangePicker = false;

                break;
            case 'all_time':
                sd = new Date(2020, 8, 1);
                ed = todayDae;
                showCustomRangePicker = false;

                break;
            case 'custom':
                showCustomRangePicker = true;
                break;
            default:
                sd = todayDate;
        }
        updateDateString();
        updateStores();

    }

    function updateDateString() {
        const sdString = formatter(sd);

        if (sd && ed) {
            const edString = formatter(ed);
            dateString = sdString + ' – ' + edString;
            $rangeMode = true;
            $startDate = getTime(sd)
            $endDate = getTime(ed)
            $highlightedDate = getTime(ed)
        } else {
            dateString = sdString;
            $rangeMode = true;
            $startDate = getTime(sd)
            $highlightedDate = getTime(sd)
        }
        //console.log(dateString, $highlightedDate)
    }

    function updateStores() {
        
    }
    function openDatePicker() {
        showDatePicker = !showDatePicker;
    }

</script>

<div class="py-2 bg-lightest-grey">
    <div class="flex items-center gap-8">
        <div class="">
            Showing data for {dateString}
        </div>
        <button
            class="inline-flex items-center justify-center hover:text-brown"
            on:click={openDatePicker}
        >
            Edit
            <ChevronDown class="w-4 h-4 ml-2" />
        </button>
    </div>
    {#if showDatePicker}
        <div transition:slide>
            <label for="range-select">Choose a Timeframe:</label>

            <select name="timeframe" id="range-select" bind:value={preset}>
                <option value="" />
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="month">This month</option>
                <option value="thirty_days">Last 30 days</option>
                <option value="all_time">All time</option>
                <option value="custom">Custom</option>
            </select>
        </div>
        {#if showCustomRangePicker}
            <div class="grid gap-2">
                <Popover.Root openFocus>
                    <Popover.Trigger asChild let:builder>
                        <Button
                            variant="outline"
                            class={cn(
                                'w-[300px] justify-start text-left font-normal',
                                !value && 'text-muted-foreground',
                            )}
                            builders={[builder]}
                        >
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {#if value && value.start}
                                {#if value.end}
                                    {formatter(value.start.toDate('Asia/Kolkata'))} - {formatter(
                                        value.end.toDate('Asia/Kolkata'),
                                    )}
                                {:else}
                                    {formatter(value.start.toDate('Asia/Kolkata'))}
                                {/if}
                            {:else if singleValue}
                                {formatter(singleValue.toDate('Asia/Kolkata'))}
                            {:else}
                                Pick a date
                            {/if}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0" align="start">
                        <RangeCalendar
                            bind:value
                            bind:startValue={singleValue}
                            initialFocus
                            numberOfMonths={3}
                            placeholder={value?.start}
                            minValue={new CalendarDate(2020,9,1)}
                            maxValue={today(tz)}
                        />
                    </Popover.Content>
                </Popover.Root>
            </div>
        {/if}
    {/if}
</div>
