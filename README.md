# US vaccination map

![Heroku](https://pyheroku-badge.herokuapp.com/?app=covid-vac-us&style=flat-square)

Written in D3.js, this visualization maps the US' vaccination program. It currently uses static data but I'm working on getting it to pull from the CDC's API. Data for this project can be found [here](https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_county_condensed_data). A live version of the visualization can be found [here](https://covid-vac-us.herokuapp.com).

## Upcoming features

The map is currently feature-light, but I'll add them when I can. They include:

- Working tooltips
- Zoom functionality
- ~~Data Credit~~
- ~~Dynamic legend text~~
- Pull data from CDC API
- Offset "no data" label
- ~~Update information~~

I'll also look at including daily vaccination totals in a separate chart.

**Caveat:** The visualization still needs to be annotated, and currently gives no indication how complete the data is. I'll be adding this in soon.
