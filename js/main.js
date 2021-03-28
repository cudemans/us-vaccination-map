
// Set up canvas
const MARGINS = {TOP: 0, BOTTOM: 40, LEFT: 10, RIGHT: 10};
const HEIGHT = 620 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

// Data
const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
// const vacURL = fetch('https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_county_condensed_data').then((resp) => resp.json())

// set up global variables
let countyData
let educationData
let vacData
var btnValue
let i = 0
var button

const increments = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', "No data"]
const colors = [ "#e6f3ec", "#cce8d9", "#b3dcc6", "#99d1b3", '#80c5a0', "#66b98d", "#4dae7a", "#33a267", "#1a9754", "#008b41", "#ffffff", "#cecfc8", "#ffffff"]


// Create SVG
const svg = d3.select("#chart-area").append("svg")
    .attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
    .attr("width", WIDTH + MARGINS.LEFT - MARGINS.RIGHT)


const g = svg.append("g")
    .attr("transform", `translate(0, ${MARGINS.LEFT})`)

// Add tooltip
const tip = d3.tip()
.attr("class", "d3-tip")
.html(() => {
    let text = `<strong><span style="color: #6e6d6d; font-size: 15px"></strong></span><br>`
    text += `<p style="color: #6e6d6d; font-size: 15px">Number of vaccinations</p>`
    return text
})
g.call(tip)


// Create legend 
const LegendArea = d3.select("#legend").append("svg")
.attr("width", WIDTH)
.attr("height", 50)

const legendInner = LegendArea.append("g")
.attr("transform", `translate(${WIDTH * 0.19}, 20)`)

legendInner.append("text")
.attr("class", "legend-header")
.attr("x", 250)
.attr("y", -5)
.attr("text-anchor", "middle")
.attr("font-size", "17px")
.text("Percentage of population vaccinated")

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

var value = $(".button").on('click', function() {
    var thisBtn = $(this)
    thisBtn.addClass('clicked').siblings().removeClass("clicked")
    return thisBtn
}).val()

console.log(value)

$(".button").on("click", function() {
     button = $(this).val()
     drawMap()
     console.log(button)
})

// $("#total-button").click()


// Draw map
let drawMap = () => {

    // Initiate counter
    

    // add transiton
    const t = d3.transition()
		.duration(100)


    // Filtering for only certain data
    // THIS RETURNS WHAT I NEED IT TO BUT BUTTONS DON"T REACT
   

   var thisValue
   $('button').click(function() {
       var thisBtn = $(this)
       thisValue = thisBtn.val()
       
   })




   
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
            let percentage = county[button]
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

    }



// Read in and transform data, call the drawMap function
d3.json(countyURL).then(
    (data, error) => {
        if (error) {
            console.log(error);
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            // console.log(countyData);
        }

            d3.json("data/cdc.json").then(
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
                        
                        console.log(vacData)
                        drawMap()
                    }
                }
            )
    }
)