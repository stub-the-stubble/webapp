# Burnt-area display masks

PB.geojson and HR.geojson are full-resolution unions of the reviewed district
outlines in the data-pipeline repository at a3e4cd0bcf97413cdd93b0960e17008454200349,
under geojson/iari-2026. They were dissolved with Shapely unary_union without
simplification. Interior rings are retained. The Hansi/Hisar partition does not
change Haryana's external footprint. Source: IARI / Survey of India, with the
documented LGD-derived Hansi district split.

These outlines only clip the optional display overlay. They do not reclassify
IARI fire counts and are not cadastral boundaries.

The overlay is Copernicus GWIS's public WMS layer `nrt.ba`, requested for the
fire-location filter's inclusive date range. GWIS derives estimated perimeters
from MODIS/VIIRS active-fire detections. It is not the delayed, reflectance-based
MODIS MCD64A1 burned-area product, Sentinel-2 burn-scar classification, or a
confirmed map of stubble burning. GWIS renders overview symbols at smaller
scales and estimated polygons when zoomed in. Missing shading is not proof of
no burning. Its values never enter the IARI count summaries.

Source and methodology: https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/burnt-areas
Service: https://maps.effis.emergency.copernicus.eu/gwis
Reuse terms: https://gwis.jrc.ec.europa.eu/about-gwis/data-license
Attribution: European Union / Copernicus GWIS. The displayed layer is clipped
to the selected state and displayed at 70% opacity; underlying estimates are
otherwise unchanged. No service key is required or bundled.
