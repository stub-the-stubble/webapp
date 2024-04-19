const getFiresTotals = (data) => {
    let totals_tuple, totals_filtered;

    totals_tuple = Object.entries(data);
    totals_filtered = totals_tuple.slice(totals_tuple.length - 30).map(
        (data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]
    );

    return Object.fromEntries(totals_filtered);
};

const getFiresBreakupByDistrict = (data, date) => {
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
    let district_breakup = Object.fromEntries(district_breakup_tuple);

    return district_breakup[date];
};



export { getFiresTotals, getFiresBreakupByDistrict };
