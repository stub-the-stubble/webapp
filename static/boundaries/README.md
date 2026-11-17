# Burnt-area display masks

PB.geojson and HR.geojson are full-resolution unions of the reviewed district
outlines in the data-pipeline repository at a3e4cd0bcf97413cdd93b0960e17008454200349,
under geojson/iari-2026. They were dissolved with Shapely unary_union without
simplification. Interior rings are retained. The Hansi/Hisar partition does not
change Haryana's external footprint. Source: IARI / Survey of India, with the
documented LGD-derived Hansi district split.

These outlines only clip the optional display overlay. They do not reclassify
IARI fire counts and are not cadastral boundaries.

The previous active-fire-derived perimeter overlay has been removed. These
masks are retained for clipping the Sentinel-2 imagery analysis to Punjab and
Haryana. A burn-scar layer must carry its actual observation dates and coverage;
missing or cloud-covered imagery must never be labelled as unburned land.
