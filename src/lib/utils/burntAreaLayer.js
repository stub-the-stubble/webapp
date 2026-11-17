import { polygonCoordinates, projectCoordinate, tileRequest } from './burntArea.js';

export function createBurntAreaLayer(L, boundary, period) {
    const polygons = polygonCoordinates(boundary.geometry);
    const paths = new Map();
    function pathAtZoom(zoom) {
        if (!paths.has(zoom)) {
            const path = new Path2D();
            for (const polygon of polygons) {
                for (const ring of polygon) {
                    ring.forEach((coordinate, index) => {
                        const [x, y] = projectCoordinate(coordinate, zoom);
                        if (index === 0) path.moveTo(x, y);
                        else path.lineTo(x, y);
                    });
                    path.closePath();
                }
            }
            paths.set(zoom, path);
        }
        return paths.get(zoom);
    }
    const ClippedLayer = L.GridLayer.extend({
        createTile(coords, done) {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 256;
            const context = canvas.getContext('2d');
            const image = new Image();
            image.crossOrigin = 'anonymous';
            // A stalled source must settle as unavailable, not leave a spinner
            // running indefinitely or be interpreted as an unburnt region.
            let finished = false;
            const settle = (error) => {
                if (finished) return;
                finished = true;
                clearTimeout(timeout);
                done(error, canvas);
            };
            const timeout = setTimeout(() => {
                settle(new Error('Burnt-area request timed out'));
                image.src = '';
            }, 15000);
            image.onload = () => {
                if (finished) return;
                context.save();
                context.translate(-coords.x * 256, -coords.y * 256);
                context.clip(pathAtZoom(coords.z), 'evenodd');
                context.translate(coords.x * 256, coords.y * 256);
                context.drawImage(image, 0, 0, 256, 256);
                context.restore();
                settle(null);
            };
            image.onerror = () => settle(new Error('Burnt-area tile unavailable'));
            image.src = tileRequest(coords, period);
            return canvas;
        },
    });
    return new ClippedLayer({
        pane: 'burntArea',
        bounds: L.geoJSON(boundary).getBounds(),
        noWrap: true,
        minZoom: 5,
        maxZoom: 19,
        maxNativeZoom: 14,
        opacity: 0.7,
        updateWhenIdle: true,
        keepBuffer: 1,
        attribution:
            '<a href="https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/burnt-areas">Burnt area: EU/Copernicus GWIS</a> (clipped to state)',
    });
}
