# Changelog

Release notes for the Stub the Stubble website.



## Unreleased

### Added
- State map counts are now updated while a past date is highlighted in the fire count chart.
- Clicking on a district in the state map now scrolls the page to the corresponding row in the district breakup table (state pages only).
- The _most affected districts_ charts are now updated while a past date is highlighted in the fire count chart.

### Changed
- Improved the styling of most affected districts charts.

### Fixed
- Fixed an issue where the headings of some components in the _State Summary_ section were not aligning properly with each other.



## 1.4.0 - 2024-04-19

### Added
- Added the ability see past data on hovering over the fire count bar chart.
- Added the ability to see district count when hovering on a district in the state map.

### Changed
- Changed Leaflet map markers to bright fire icons (GitHub [#11](https://github.com/stub-the-stubble/webapp/pull/11)). Thanks [@Arya-GITh](https://github.com/Arya-GITh).
- Adjusted Leaflet map zoom level based on its parent's layout.
- Improved the logic to render state pages.
- Improved the markup in the _State Summary_ section.
- Improved the logic to store application state.
- Updated Svelte from v4.2.2 to v4.2.14.
- Updated Sveltekit from v1.27.3 to v2.5.6.
- Updated Vite from v4.5.0 to v5.2.8.
- Updated Adapter Auto from v2.1.1 to v3.2.0.
- Updated Adapter Static from v2.0.3 to v3.0.1.

### Fixed
- Fixed a spacing issue below interactive state maps.
- Fixed an issue where the district breakup data was going under the main navigation.
- Fixed an issue where pages were hard reloading instead of updating components reactively.



## 1.3.0 - 2023-12-14

### Added
- Added separate pages for Punjab and Haryana data.
- Added basic SEO information to pages.
- Added charts to show district-wise breakup of fires for Punjab and Haryana.

### Changed
- Improved logic to pass fires data to all pages.



## 1.2.0 - 2023-11-29

### Added
- Added a day-wise fire count chart for Punjab.
- Added the site header (includes links to Knowledge Centre sections).

### Changed
- Modified the district-wise fire count chart to show the top five districts.
- Improve spacing in the cumulative data table.
- Improved footer styling.
- Configured the site to use trailing slashes on all URLs.



## 1.1.0 - 2023-11-17

### Changed
- Updated the site to use the second version of the data pipeline.
- Increased the width of the page layout.
- Changed the order in which districts appear in the district-wise chart.
- Improved styling across the site.

### Fixed
- Fixed an animation issue that was preventing the content from being rendered.



## 1.0.0 - 2023-11-02

### Added
- Released the first version of the site.
