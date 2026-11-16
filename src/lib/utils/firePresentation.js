const escapeHtml = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]),
    );

export function firePopupHtml(location) {
    // The v2 producer omits acquisition time; never imply a timezone for raw source values.
    return `District: ${escapeHtml(location.district ?? 'Unassigned (source state retained)')}${
        location.observation_date ? `<br>Date: ${escapeHtml(location.observation_date)} (IST)` : ''
    }<br>Time: unavailable`;
}
