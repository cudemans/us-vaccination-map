
// Set up canvas
const MARGINS = {TOP: 0, BOTTOM: 40, LEFT: 10, RIGHT: 10};
const HEIGHT = 640 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

// Get geodata
const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

// set up global variables
let countyData
let stateData
let vacData
let i = 0
let button
let percentage


const increments = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', "No data"]
const colors = [ "#e6f3ec", "#cce8d9", "#b3dcc6", "#99d1b3", '#80c5a0', "#66b98d", "#4dae7a", "#33a267", "#1a9754", "#008b41", "#ffffff", "#cecfc8", "#ffffff"]


// Create SVG
const svg = d3.select("#chart-area").append("svg")
    .attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
    .attr("width", WIDTH + MARGINS.LEFT - MARGINS.RIGHT)


const g = svg.append("g")
    .attr("transform", `translate(0, ${MARGINS.LEFT})`)


// Create legend 
const LegendArea = d3.select("#legend").append("svg")
.attr("width", WIDTH)
.attr("height", 50)

let legendInner = LegendArea.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${WIDTH * 0.19}, 20)`)

legendInner.append("text")
    .attr("class", "legend-header")
    .attr("x", 250)
    .attr("y", -7)
    .attr("text-anchor", "middle")
    .attr("font-size", "17px")
    .text("Percentage of total population vaccinated")

increments.forEach((increment, i) => {
    const legendRow = legendInner.append("g")
        .attr("class", "legendRow")
        .attr("transform", `translate(${i * 50}, 5)`)

    legendRow.append("rect")
        .attr("height", 10)
        .attr("width", 50)
        
        .attr("fill", function() {
            while (i < colors.length) {
                return colors[i] 
                i++
            }
        })

    legendRow.append("text")
        .attr("class", "legend-nums")
        .attr("x", 0)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", 100)
        .text(function() {
            while (i < increments.length) {
                return increments[i]
                i ++
            }
        })

    legendRow.append("rect")
        .attr("class", "legend-lines")
        .attr("height", "14px")
        .attr("width", "1.5px")
})

// Data credit
const credit = g.append("text")
    .attr("class", "credit")
    .attr("x", WIDTH - 400)
    .attr("y", HEIGHT + 20)
    .attr("font-size", "12px")
    .attr("opacity", "0.5")
    .attr("font-style", "italic")
    .text("Data: CDC | Note: Data for Texas, New Mexico, and Hawaii is missing.")
    
// Update button based on whether it is selected
$(".button").on('click', function() {
    var thisBtn = $(this)
    thisBtn.addClass('clicked').siblings().removeClass("clicked")
    return thisBtn
 })

// Select data from button value
$(".button").on("click", function() {
     button = $(this).val()
     // Update map based on new data
     drawMap()
})


// Draw map
let drawMap = () => {

// Tooltip
const tip = d3.tip()
    .attr("class", "d3-tip")
    .html(d => d)
g.call(tip)

    // add transiton
    const t = d3.transition()
		.duration(50)

    // Add app
    //Bind data
    const paths = g.selectAll("path")
        .data(countyData)

    //Exit
    paths.exit().remove()
    
    // Merge
    paths.enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "0.5px")
        .on("mouseover", function(d) {
            d3.select(this).classed("shaded", true)
            tip.show()    
        })
        .on("mouseout", function(d) {
            d3.select(this).classed("shaded", false)
            tip.hide()
        })
        .merge(paths)
        .transition(t)
        .attr("fill", (item) => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            if (button == null) {
                percentage = county["Series_Complete_Pop_Pct"]
            } else percentage = county[button]
            if (percentage == null) {
                return "#cecfc8"
            } 
            else if (percentage <= 10) {
                return "#e6f3ec"
            } else if (percentage <= 20) {
                return "#cce8d9"
            } else if (percentage <= 30){
                return "#b3dcc6"
            } else if (percentage <= 40) {
                return "#99d1b3"
            } else if (percentage <= 50) {
                return '#80c5a0'
            } else if (percentage <= 60) {
                return "#66b98d"
            } else if (percentage <= 70) {
                return "#4dae7a"
            } else if (percentage <= 80) {
                return "#33a267"
            } else if (percentage <= 90) {
                return "#1a9754"
            } else return "#008b41"
        })


        // Change legend header when data updates
        $(".legend-header").text(function() {
            if (button == null) {
                return "Percentage of total population vaccinated"
            } else if (button == "Series_Complete_Pop_Pct") {
                return "Percentage of total population vaccinated"
            } else if (button == "Series_Complete_18PlusPop_Pct") {
                return "Percentage of 18+ vaccinated"
            } else return "Percentage of 65+ vaccinated"
        })

    // Zoom functionality
    // const zoom = d3.zoom()
    //     .scaleExtent([1, 8])
    //     .extent([[0, 0], [WIDTH, HEIGHT]])
    //     .on("zoom", () => g.attr("transform", d3.event.transform));
    
    // svg.call(zoom);
    
    }


// Read in and transform data, call the drawMap function
d3.json(countyURL).then(
    (data, error) => {
        if (error) {
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            stateData = topojson.feature(data, data.objects.states).features
        }

            d3.json("data/cdc_data.json").then(
                (data, error) => {
                    if (error) {
                        console.log(error);
                    } else {
                        vacData = data['vaccination_county_condensed_data']
                    
                        delete vacData.runid

                        vacData = vacData.map(data => {
                            data.FIPS = Number(data.FIPS)
                            return data
                        })
                        // console.log(vacData)
                        drawMap()
                    }
                }
            )
    }
)


// const tip = d3.tip()
// .attr("class", "d3-tip")
// .html(() => {
//     let text = `<strong><span style="color: black; font-size: 14px; line-spacing:70%">County</strong></span><br>`
//     text += `<p style="color: #6e6d6d; font-size: 12px; line-spacing:70%">Number of vaccinations</p>`
//     return text
// })
// g.call(tip)
