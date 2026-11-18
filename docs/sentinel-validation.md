# Sentinel-2 release review, 18 November 2026

The experimental dNBR-only overlay failed independent unburnt-field checks.
It is not included in the public assets. The map controller blocks methods
without an explicitly reviewed release, even if a catalogue claims approval.
The existing fire observations and counts are unaffected.

## Diagnostic

Reference: CEEW, *Patterns of Crop Residue Burning*, version 2,
[Zenodo record 20179137](https://zenodo.org/records/20179137), CC BY-NC 4.0.
The 438 field polygons were independently labelled from very-high-resolution
imagery. They were used for evaluation, with no threshold fitting.
No reference polygons or third-party imagery are redistributed here.

The check used Sentinel-2 Collection 1 L2A from Earth Search, calibrated B08
and B12 reflectance, ESA WorldCover 2021 cropland (class 40), SCL classes 4/5,
cloud probability <=70, and a two-pixel
erosion of the clear mask. NBR = (B08 - B12) / (B08 + B12).
The existing candidate rule was NBR(before) - NBR(after) >=0.1.
Field boundaries were inset 10 m to reduce mixed edge pixels; evaluation
required at least three interior 20 m pixels and 80% clear interior coverage.

| Label date / category | Labelled | Assessable | Any candidate pixels | At least half of clear interior marked |
| --- | ---: | ---: | ---: | ---: |
| 2020-11-10, green unburnt | 12 | 7 | 4 | 0 |
| 2020-11-10, golden-yellow unburnt | 13 | 6 | 4 | 4 |
| 2020-11-10, completely burnt | 18 | 0 | 0 | 0 |
| 2020-11-10, partially burnt | 38 | 1 | 1 | 1 |
| 2021-10-29, unburnt | 95 | 76 | 59 | 49 |
| 2021-10-29, completely burnt | 72 | 50 | 46 | 43 |
| 2021-10-29, partially burnt | 190 | 128 | 93 | 76 |

Scene pairs: S2A_T43REP_20201031T053450_L2A to
S2A_T43REP_20201110T053044_L2A, and
S2A_T43REQ_20211019T054623_L2A to S2A_T43REQ_20211029T053942_L2A.

The 2021 negative-field majority-marked rate is 49/76 (64.5%). This is a
diagnostic on this sample, not a population accuracy estimate. Excluded fields
are unassessed, not correct classifications. The 2020 positive sample has too
little clear coverage for a useful sensitivity estimate. Labels describe
visible condition on their observation date, not a verified season-long
history. These checks do not establish 2026 performance or Haryana accuracy.

## Season status and remaining release conditions

The complete season-to-date catalogue was collected from 15 September through
18 November 2026, with baseline acquisitions from 1 September. It contains
369 Punjab and 360 Haryana scene intersections (some scenes overlap states),
covering their geographic footprints. Latest available acquisitions in this
inventory are dated 17 November. Footprints are not clear-pixel coverage.

Full-season burn classification has **not** been run or approved. Repeating
the failed threshold over more dates would accumulate false positives.
Before enabling an overlay:

- Develop a replacement using multi-date spectral evidence, with unknown
  observations retained separately from unburnt observations.
- Test on held-out fields, including independently documented harvested,
  ploughed and irrigated unburnt fields in both states. The public CEEW sample
  does not explicitly identify these management categories.
- Report field-level precision, recall, negative-category error rates and
  clear-data coverage; avoid pixel leakage between training and evaluation.
- Only then process all season dates, deduplicate overlapping acquisitions
  and repeated scars, and validate date-filtered tiles before approval.

No zero-error guarantee is established by this review.
