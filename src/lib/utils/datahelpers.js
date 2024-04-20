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

function get_filtered_data(data_tuple, rangeMode, endDate, startDate, selectedDate) {
    let data_filtered;
    if (rangeMode) {
    // Use start date and end date difference here for slicing
    data_filtered = data_tuple
        .slice(data_tuple.length - 30)
        .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
} else if (selectedDate) {
    //Use logic here to figure out which dates to select, -15/+15 days
    // only applicable for this and district chart because its data doesn't change on highlightedDate
    data_filtered = data_tuple
        .slice(data_tuple.length - 30)
        .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
} else {
    //Default case where no date is selected and we default to today's date, 
    // selectedDate in this case should be null because it should only be set on user input
    data_filtered = data_tuple
        .slice(data_tuple.length - 30)
        .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
}
    return data_filtered
}


export { getFiresTotals, getFiresBreakupsByDistrict, get_filtered_data };
