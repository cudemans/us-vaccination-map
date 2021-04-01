const MARGINS_LINE = { TOP: 0, BOTTOM: 40, LEFT: 10, RIGHT: 10 };
const HEIGHT_LINE = 640 - MARGINS_LINE.TOP - MARGINS_LINE.BOTTOM
const WIDTH_LINE = 900 - MARGINS_LINE.LEFT - MARGINS_LINE.RIGHT

let formattedData
let lineX
let lineY
let line
let nested

const svgLine = d3.select("#line-chart").append("svg")
    .attr("height", HEIGHT_LINE + MARGINS_LINE.TOP + MARGINS_LINE.BOTTOM)
    .attr("width", WIDTH_LINE + MARGINS_LINE.LEFT + MARGINS_LINE.RIGHT)


const gLine = svgLine.append("g")
    .attr("transform", `translate(${MARGINS_LINE.LEFT + 60}, ${MARGINS_LINE.TOP})`)

let drawLine = () => {

    const lines = gLine.selectAll("path")
        .data(nested)

    // lines.enter().append("path")
    //     .attr("class", ".path")
    //     .attr("d", function(d) { 
    //         return line(d.values)
    //     })

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
        console.log(formattedData)

    }

    lineX = d3.scaleTime()
        .domain([new Date(d3.min(formattedData, d => d.Day)), new Date(d3.max(formattedData, d => d.Day))])
        .range([0, WIDTH_LINE])
    
    lineY = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.new_vaccinations_smoothed)])
        .range([HEIGHT_LINE, 0])

    const xAxisLine = d3.axisBottom(lineX)
    .ticks(5)
    gLine.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${HEIGHT_LINE})`)
        .call(xAxisLine)
        
    const yAxisLine = d3.axisLeft(lineY)
    // .ticks(3)
    // .tickFormat(d3.format(".1s"))
    gLine.append("g")
        .attr("class", "y-axis-line")
        .call(yAxisLine)
        // .select(".domain").remove()


    line = d3.line()
        .x(lineX( d => d.Day))
        .y(lineY( d => d.new_vaccinations_smoothed))

    nested = d3.nest()
        .key(d => d.Entity)
        .entries(formattedData)


    drawLine()

})