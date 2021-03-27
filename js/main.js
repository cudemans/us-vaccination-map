
// Set up canvas
const MARGINS = {TOP: 0, BOTTOM: 40, LEFT: 10, RIGHT: 10};
const HEIGHT = 750 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

// Data
const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
const educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

// set up global variables
let countyData
let educationData
const increments = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100']
const colors = ["#e6f3ec", "#cce8d9", "#b3dcc6", "#99d1b3", '#80c5a0', "#66b98d", "#4dae7a", "#33a267", "#1a9754", "#008b41"]
let i = 0

// Create SVG
const svg = d3.select("#chart-area").append("svg")
    .attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
    .attr("width", WIDTH + MARGINS.LEFT - MARGINS.RIGHT)


const g = svg.append("g")
    .attr("transform", `translate(0, ${MARGINS.LEFT})`)
 
// Draw map
let drawMap = () => {

    const tip = d3.tip()
        .attr("class", "d3-tip")
        .html(() => {
            let text = `<strong><span style="color: #6e6d6d; font-size: 15px">${educationData.area_name}</strong></span><br>`
            text += `<p style="color: #6e6d6d; font-size: 15px">Number of vaccinations</p>`
            return text
        })
    g.call(tip)

    g.selectAll("path")
        .data(countyData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "0.5px")
        .attr("fill", (item) => {
            let fips = item['id']
            let county = educationData.find(county => {
                return county['fips'] === fips
            })
            let percentage = county['bachelorsOrHigher']
            if (percentage <= 10) {
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
        .on("mouseover", function(d) {
            d3.select(this).classed("shaded", true)
            tip.show()
        
            
        })
        // .on("mouseover", tip.show)
        .on("mouseout", function(d) {
            d3.select(this).classed("shaded", false)
            tip.hide()
            
        
        })
        // .on("mouseout", tip.hide)

        // Create legend
        const LegendArea = d3.select("#legend").append("svg")
            .attr("width", WIDTH)
            .attr("height", 50)

        const legendInner = LegendArea.append("g")
            .attr("transform", `translate(${WIDTH * 0.25}, 20)`)
    
        legendInner.append("text")
            .attr("class", "legend-header")
            .attr("x", 250)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .attr("font-size", "17px")
            .text("Percentage of population vaccinated")

            increments.forEach((increment, i) => {
                const legendRow = legendInner.append("g")
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

    }

// Read in and transform data, call the drawMap function
d3.json(countyURL).then(
    (data, error) => {
        if (error) {
            console.log(error);
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            console.log(countyData);
        }

        d3.json(educationURL).then(
            (data, error) => {
                if (error) {
                    console.log(error);
                } else {
                    educationData = data
                    console.log(educationData);
                    drawMap()
                }
            }
        )
    }
)