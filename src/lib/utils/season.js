import { format, startOfDay } from 'date-fns';

// CAQM/ISRO monitoring windows (inclusive), not the sowing calendar:
// Paddy: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197201
// Wheat: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2228743
export function getMonitoringSeason(istDate) {
    // Like the other date helpers, accept a civil IST date carried in local fields.
    const today = startOfDay(istDate);
    const year = today.getFullYear();
    if (!Number.isFinite(today.getTime())) throw new RangeError('Invalid season date');
    let crop, start, end;
    if (today >= new Date(year, 8, 15)) {
        crop = 'Paddy';
        start = new Date(year, 8, 15);
        end = new Date(year, 10, 30);
    } else if (today >= new Date(year, 3, 1)) {
        crop = 'Wheat';
        start = new Date(year, 3, 1);
        end = new Date(year, 4, 31);
    } else {
        crop = 'Paddy';
        start = new Date(year - 1, 8, 15);
        end = new Date(year - 1, 10, 30);
    }
    // Between monitoring windows, retain the most recently completed season,
    // label it explicitly, and never include winter/summer days in its total.
    const active = today <= end;
    const through = active ? today : end;
    return {
        crop,
        start,
        end,
        through,
        active,
        label: active ? 'This season' : 'Last season',
        description: `${crop}: ${format(start, 'd MMM yyyy')} – ${format(
            through,
            'd MMM yyyy',
        )} (inclusive${active ? ', season to date' : ', completed season'}).`,
    };
}
