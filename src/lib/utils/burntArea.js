export const BURNT_AREA_WMS = 'https://maps.effis.emergency.copernicus.eu/gwis';
export const BURNT_AREA_SOURCE =
    'https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/burnt-areas';

export function burntAreaPeriod(dates) {
    if (!dates?.length || dates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) return null;
    return `${dates[0]}/${dates.at(-1)}`;
}

export function polygonCoordinates(geometry) {
    if (geometry?.type === 'Polygon') return [geometry.coordinates];
    if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
    throw new Error('A polygon boundary is required for the burnt-area layer');
}

// The tile and clipping path use the same Web Mercator projection. Clip the
// actual polygons (including holes), never just their rectangular extent.
export function projectCoordinate([lon, lat], zoom) {
    const size = 256 * 2 ** zoom;
    const sine = Math.sin((Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI) / 180);
    return [
        ((lon + 180) / 360) * size,
        (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size,
    ];
}

export function tileRequest(coords, period) {
    const extent = 20037508.342789244;
    const span = (2 * extent) / 2 ** coords.z;
    const west = -extent + coords.x * span;
    const north = extent - coords.y * span;
    const params = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        layers: 'nrt.ba',
        styles: '',
        format: 'image/png',
        transparent: 'true',
        srs: 'EPSG:3857',
        width: '256',
        height: '256',
        bbox: [west, north - span, west + span, north].join(','),
        time: period,
    });
    return `${BURNT_AREA_WMS}?${params}`;
}
