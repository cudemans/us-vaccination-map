const MARGINS_LINE = { TOP: 10, BOTTOM: 40, LEFT: 50, RIGHT: 250 };
const HEIGHT_LINE = 500 - MARGINS_LINE.TOP - MARGINS_LINE.BOTTOM
const WIDTH_LINE = 900 - MARGINS_LINE.LEFT - MARGINS_LINE.RIGHT

let formattedData
let lineX
let lineY
let line
let nested
let nestFilter
let filtered

const svgLine = d3.select("#line-chart").append("svg")
    .attr("height", HEIGHT_LINE + MARGINS_LINE.TOP + MARGINS_LINE.BOTTOM)
    .attr("width", WIDTH_LINE + MARGINS_LINE.LEFT + MARGINS_LINE.RIGHT)


const gLine = svgLine.append("g")
    .attr("transform", `translate(${MARGINS_LINE.LEFT }, ${MARGINS_LINE.TOP})`)

let drawLine = () => {

    const lines = gLine.selectAll("path")
        .data(filtered)

    lines.enter().append("path")
        .attr("class", ".path")
        .attr("d", d => {
            return line(d.values)
        })
        .attr("fill", "none")
        .attr("stroke", d => {
            if (d.key == "United States") {
                return "red"
            } else {
                return "grey"
            }
        })

    const countryLabels = gLine.selectAll(".country-labels")
        .data(filtered)

    countryLabels.enter().append("text")
        .attr("class", "country-labels")
        .attr("x", WIDTH_LINE - 50)
        .attr("y", d => line(d.values[d.values.length -1]))
        
        .text(d => d.key)


}

d3.csv("data/daily-covid-19-vaccination-doses-2.csv").then((data, error) => {
    if (error) {
        console.log(error)
    } else {
        formattedData = data
        formattedData.map(data => {
            data.new_vaccinations_smoothed = Number(data.new_vaccinations_smoothed)
            let parseTimeLine = d3.timeParse("%Y-%m-%d")
            data.Day = parseTimeLine(data.Day)
            return data
        })
    }

    // .domain([new Date(d3.min(formattedData, d => d.Day)), new Date(d3.max(formattedData, d => d.Day))])
    lineX = d3.scaleTime()
        .domain([new Date(2020, 11, 14), new Date(2021, 02, 25)])
        .range([0, WIDTH_LINE])
    
    lineY = d3.scaleLinear()
        .domain([0, 5000000])
        .range([HEIGHT_LINE, 0])

    const xAxisLine = d3.axisBottom(lineX)
    .ticks(5)
    gLine.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${HEIGHT_LINE})`)
        .call(xAxisLine)
        
    const yAxisLine = d3.axisLeft(lineY)
    .ticks(5)
    .tickFormat(d3.format(".2s"))
    gLine.append("g")
        .attr("class", "y-axis-line")
        .call(yAxisLine)
        // .select(".domain").remove()


    line = d3.line()
        .x(d => lineX(d.Day))
        .y(d => lineY(d.new_vaccinations_smoothed))

    nested = d3.nest()
        .key(d => d.Entity)
        .entries(formattedData)

    filtered = nested
        .filter(d => d.key != "Africa")
        .filter(d => d.key != "Asia")
        .filter(d => d.key != "North America")
        .filter(d => d.key != "South America")
        .filter(d => d.key != "Europe")
        .filter(d => d.key != "World")
        
        
    console.log(filtered)

    drawLine()

})