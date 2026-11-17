const escapeHtml = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]),
    );

export function firePopupHtml(location) {
    // IARI preserves the publisher's clock value. Its timezone is not confirmed,
    // so keep it separate from the observation date and never label it UTC/IST.
    const time =
        location.district_assignment === 'publisher' &&
        typeof location.acqtime === 'string' &&
        /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(location.acqtime)
            ? location.acqtime
            : null;
    return `District: ${escapeHtml(location.district ?? 'Unassigned (source state retained)')}${
        location.observation_date ? `<br>Date: ${escapeHtml(location.observation_date)} (IST)` : ''
    }<br>Time: ${
        time ? `${escapeHtml(time)} (publisher time; timezone unspecified)` : 'unavailable'
    }${location.sat ? `<br>Satellite: ${escapeHtml(location.sat)}` : ''}${
        location.shared_observation_states?.length > 1
            ? '<br>Also counted in the other state by IARI.'
            : ''
    }`;
}
