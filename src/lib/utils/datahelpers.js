import { differenceInDays, startOfToday } from "date-fns";

const getFiresTotals = (data) => {
    let totals_tuple, totals_filtered;

    totals_tuple = Object.entries(data);
    totals_filtered = totals_tuple.slice(totals_tuple.length - 30).map(
        (data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]
    );

    return Object.fromEntries(totals_filtered);
};

const getFiresBreakupsByDistrict = (data) => {
    let dates = Object.keys(data[Object.keys(data)[0]].dates);
    let dates_filtered = dates.slice(dates.length - 30);

    let district_breakup_tuple = dates_filtered.map((filtered_date) => {
        return [
            new Date(filtered_date).setHours(0, 0, 0, 0),
            Object.fromEntries(Object.entries(data).map(([district, dates_obj]) => {
                return [
                    district,
                    dates_obj.dates[filtered_date]
                ];
            }))
        ]
    });

    return Object.fromEntries(district_breakup_tuple);
};

function get_filtered_data(data_tuple, rangeMode, endDate, startDate) {
    let data_filtered;
    const td = startOfToday()
    let sd_index = differenceInDays(td,startDate) + 1
    let ed_index = differenceInDays(td,endDate)

    if (rangeMode) {
        // Use start date and end date difference here for slicing
        data_filtered = data_tuple
            .slice(data_tuple.length -  sd_index, data_tuple.length  - ed_index)
            .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
    } else if (startDate) {
        //Use logic here to figure out which dates to select, -15/+15 days
        // or till today if not too far in the past
        let delta
        if (sd_index < 15) 
            delta = sd_index
        else 
            delta = 15
        
        data_filtered = data_tuple
            .slice(data_tuple.length - sd_index - (30 - delta), data_tuple.length - sd_index + delta)
            .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
    }
    return data_filtered;
}

export { getFiresTotals, getFiresBreakupsByDistrict, get_filtered_data };
