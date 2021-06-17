// BAR CHART - VACCINATIONS PER DAY

const CHART_MARGINS = { TOP: 60, BOTTOM: 40, LEFT: 30, RIGHT: 10 };
const CHART_HEIGHT = 400 - CHART_MARGINS.TOP - CHART_MARGINS.BOTTOM
const CHART_WIDTH = 900 - CHART_MARGINS.LEFT - CHART_MARGINS.RIGHT

// Global variables
let usComplete
let x
let y
let avNest
let avLines

const chart = d3.select("#chart-area").append("svg")
    .attr("height", CHART_HEIGHT + CHART_MARGINS.TOP + CHART_MARGINS.BOTTOM)
    .attr("width", CHART_WIDTH + CHART_MARGINS.LEFT + CHART_MARGINS.RIGHT)

const gChart = chart.append('g')
    .attr("transform", `translate(${CHART_MARGINS.LEFT}, ${CHART_MARGINS.TOP})`)

// Tooltip
let formatTime = d3.timeFormat("%B %d");
let numberFormatter = d3.format(",.4r")

const chartTip = d3.tip()
    .attr("class", "d3-tip")
    .html(d => {
        let chartText = `<strong><p id="date">${formatTime(d.Date)}</strong></p><br>`
        chartText += `<p id="number">Vaccinations: ${numberFormatter(d.Administered_Daily)}</p>`
        return chartText
    })
gChart.call(chartTip)

const chartTitle = chart.append("text")
    .attr("class", "title-text")
    .attr("x", 15)
    .attr("y", 20)
    .text("New doses per day")

const chartSubtitle = chart.append("text")
    .attr("x", 15)
    .attr("y", 42)
    .attr("opacity", "0.6")
    .text("Rollout has accelerated since late February")

// D3.ANNOTATION ONLY SEEMS TO WORK IN V4
// const annotations = [
//     {
//         note: {
//         label: "Here is the annotation label",
//         title: "Annotation title"
//         },
//         x: 100,
//         y: 100,
//         dy: 100,
//         dx: 100
//     }
//     ]

// const makeAnnotations = d3.annotation()
//   .annotations(annotations)
// d3.select('#chart-area')
//   .append("g")
//   .call(makeAnnotations)
    

let drawChart = () => {

    const rects = gChart.selectAll("rect")
        .data(usComplete)

    rects.enter().append("rect")
        .attr("x", d => x(d.Date))
        .attr("y", d => y(d.Administered_Daily))
        .attr("width", "5px")
        .attr("height", d => CHART_HEIGHT - y(d.Administered_Daily))
        .attr("fill", "#99d1b3")
        // .transition(tChart)
        .on("mouseover", chartTip.show)
        .on("mouseout", chartTip.hide)

    // const avLineChart =  gChart.selectAll("path")
    //     .data(avNest)

    // avLineChart.enter().append("path")
    //     .attr("d",  avLines(avNest))
    //     .attr("fill", "none")
    //     .attr("stroke", "black")

    // const avLineChart = gChart.append("path")
    //     .attr("d", avLines(avNest.value))

}

d3.json("https://raw.githubusercontent.com/simprisms/vaccination-data/main/data/_us_historical.json").then((data, error) => {
    if (error) {
        console.log(error)
    } else {
        usComplete = data['vaccination_trends_data']
        console.log(usComplete)

        delete usComplete.runid

        usComplete.map(data => {
            let parseTime = d3.timeParse("%Y-%m-%d")
            data.Date = parseTime(data.Date)
            return data
        })
        
    }

    avLines = d3.line()
        .x(d => d.Date)
        .y(d => d.Administered_7_Day_Rolling_Average)


    avNest = d3.nest()
        .key(d => d.Date)
        .rollup(v => { return d3.mean(v, d => d.Administered_7_Day_Rolling_Average) })
        .entries(usComplete)

    avNest.map(d => {
        d.key = new Date(d.key)
    })


    x = d3.scaleTime()
        .domain([new Date(d3.min(usComplete, d => d.Date)), new Date(d3.max(usComplete, d => d.Date))])
        .range([0, CHART_WIDTH])
        

    y = d3.scaleLinear()
        .domain([0, d3.max(usComplete, d => d.Administered_Daily)])
        .range([CHART_HEIGHT, 0])

    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat("%B"))

    gChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${CHART_HEIGHT})`)
        .call(xAxis)

    const yAxis = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(d3.format(".1s"))
        .tickSize(-CHART_WIDTH)
    gChart.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .select(".domain").remove()


    drawChart()
})
