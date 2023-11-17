import { formatISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const getDateIST = () => {
    return utcToZonedTime(new Date(), 'Asia/Kolkata');
};

export const getDateISO = () => {
    return formatISO(getIndiaDate(), { representation: 'date' });
};


